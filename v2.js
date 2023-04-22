const mongo = require("mongodb");
const MongoClient = mongo.MongoClient;
const url = 'mongodb+srv://satyambhartijnv0:Password1@cluster0.uxj2lag.mongodb.net/?retryWrites=true&w=majority';
const client = new MongoClient(url);

const log=(...txt)=>console.log(...txt);

const ws = require("ws");
const server = new ws.Server({ port: 8080 });

async function init() {
    await client.connect();
}

//============================================================================================

server.on("connection", (client) => {
    console.log("[*] a new client connected");
    client.onmessage = (e) => {
        let data = JSON.parse(e.data);
        //console.log(data);
        if (data.type == "login") handlelogin(data, client);
        if (data.type == "signup") handlesignup(data, client);
        if (data.type == "accountDelete") deleteAccount(data);
        if (data.type == "bookupload") uploadBook(data,client);
        if (data.type == 'findbook') findBook(data,client);
        if (data.type == "getcart") getcart(data,client);
        if (data.type == "getcartpreload") getcartpreload(data,client);
        if (data.type == "addtocart") handleaddtocart(data,client);
		if (data.type == "getuserinfo") handlegetuserinfo(data,client);
        if (data.type == "removefromcart") removefromcart(data,client);
    }
})

//==============================================================================================


function handlelogin(data,client) {
    let val = { username: data.username, password: data.password };
    userexists(val).then((existance) => {
        if (existance) {
            //console.log('user exists');
            getuserdata({username : data.username}).then((userdata) => {
                //console.log(userdata)
                client.send(JSON.stringify({
                    type : "success",
                    desc : 'login success',
                    userdata : userdata
                }));
            }).catch(console.log)
        } else {
            client.send(JSON.stringify({
                type : "failure",
                desc : "wrong username or password"
            }))
        }
    }).catch(console.log);
}

//===============================================================================================

function handlesignup(data, client) {
    //console.log(data);
    userexists({username : data.username}).then(existance=>{
        if(!existance){
            createUser(data); 
            let userdata = getuserdata({username : data.username});
            client.send(JSON.stringify({
              type:"success",
              desc:"signup success",
              userdata})); 
        } else {
            client.send(JSON.stringify({
                type : "failure",
                desc : "username occupied"
            }))
        };
    })
}


//==================================================================================================

// TODO MODIFY IT 

 async function deleteAccount(data){
    let username = data.username;
    await client.db("userdb").collection("users").deleteOne({username});
    await client.db("userdb").collection("profile").deleteOne({username});
}

//========================================================================================

async function uploadBook(data,wbclient){
  let obj = {
    title,
    author,
    cost,
    cover,
    by
  } = data;
  await client.db('bookdb').collection('books').insertOne(obj);
  wbclient.send(JSON.stringify({
    type : 'success',
    desc : 'uploaded book successfully'
  }))
}


//========================================================================================

async function findBook(data,wbclient){
  console.log(data);
  let result = await client.db('bookdb').collection('books').find({ title :{ 
  $regex : new RegExp(data.keyword,"i")
  }}).toArray();
  //console.log(result);
  for(let i = 0;i<result.length;i++){
    //console.log(i);
    let user = await client.db('userdb').collection('users').findOne({ username : result[i].by });
    result[i].from = user.address;
    //console.log(user,result[i]);
  }
  wbclient.send(JSON.stringify({
    type : 'searchresults',
    results : result
  }));
} 

//=======================================================

/*
var myquery = { address: "Valley 345" };
  var newvalues = { $set: { address: "Canyon 123" } };
  dbo.collection("customers").updateOne(myquery, newvalues, function(err, res) {
...
*/

async function handleaddtocart(data,wbclient){
log("adding to cart");
    let profile = await client.db("userdb").collection("profile").findOne({username : data.username});
	let cart = profile.cart;
log("got cart of type "+ typeof cart);
debugger;
	cart[cart.length] = data.bookid;
log("cart is : "+ cart);
debugger;
	await client.db("userdb").collection("profile").updateOne({
	username : data.username
	},{ $set : {
		cart : cart
	}});
	wbclient.send(JSON.stringify({
		type : "success",
		desc : "added to cart",
		cart : cart
	}))
}

//======================================================================================

async function removefromcart(data,wbclient){
    let profile = await client.db("userdb").collection("profile").findOne({username : data.username});
	let cart = profile.cart;
    let bookid = data.bookid;
    let index = cart.indexOf(bookid);
    // cart = cart.splice(index,1);
    delete cart[index];
    log(cart);
    await client.db("userdb").collection("profile").updateOne({
        username : data.username
    },{
        $set : { cart : cart }
    });
    wbclient.send(JSON.stringify({
        type : "success",
        desc : "successfully deleted one item from the cart"
    }));
    wbclient.send(JSON.stringify({
        type : "success",
        preload : true,
        cart : cart
    }));
}

//========================================================

async function getcart(data,wbclient){
	console.log("getting cart info for "+data.username);
	let profile = await client.db("userdb").collection("profile").findOne({ username : data.username });
	let cart = profile.cart;
	console.log("got cart");
	log("cart is : "+ cart);
	let books = [];
	console.log("adding books in array");
	for(let i=0;i<cart.length;i++){
		console.log(" i is : "+i);
		let book = await client.db("bookdb").collection("books").findOne({ _id : new mongo.ObjectId(cart[i])  });
		console.log("book is : "+book);
		books[books.length] = book;
		console.log("books are : "+books);
	}
	console.log("sending information");
	wbclient.send(JSON.stringify({
		type : "cartitems",
		items : books
	}))
}


//============================================================

async function getcartpreload(data,wbclient){
	let profile = await client.db("userdb").collection("profile").findOne({username:data.username});
    let cart = profile.cart;
    wbclient.send(JSON.stringify({
        type : "success",
        desc : "cart preload info",
        preload : true,
        cart : cart
    }))
}

//============================================================

async function handlegetuserinfo(data,wbclient){
	let user = await client.db("userdb").collection("users").findOne({username :data.username });
	let profile = await client.db("userdb").collection("profile").findOne({username:data.username});
	let obj = Object.assign(user,profile);
	delete obj.password ;
	obj.type = "userinfo";
	wbclient.send(JSON.stringify(obj));	
}

//================================================================================================


async function userexists(options) {
    const user = await client.db("userdb").collection("users").findOne(options);
    return user;
}
async function getuserdata(options) {
    const data = await client.db("userdb").collection("profile").findOne(options);
    return data;
}
async function createUser(options) {
    let { username, password, name, address } = options;
    let user = await client.db("userdb").collection("users").insertOne({username,password,name, address });
    //console.log(user);
    let userdata = await client.db("userdb").collection("profile").insertOne({ username, cart : []});
   // console.log(userdata);
}

init();
