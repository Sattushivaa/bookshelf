const MongoClient = require("mongodb").MongoClient;
const url = 'mongodb+srv://satyambhartijnv0:Password1@cluster0.uxj2lag.mongodb.net/?retryWrites=true&w=majority';
const client = new MongoClient(url);

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
        if (data.type == "addtocart") handleaddtocart(data,client);
        if (data.type == "getcartpreload") handlegetcartpreload(data,client);
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
    let profile = await client.db("userdb").collection("profile").findOne({username : data.username});
	let cart = profile.cart;
	cart[cart.length] = data.bookid;
	await client.db("userdb").collection("profile").updateOne({
	username : data.username
	},{ $set : {
		cart : cart
	}});
	wbclient.send(JSON.stringify({
		type : "success",
		desc : "added to cart",
		cart : cart.push(data.bookid)
	}))
}

//========================================================

async function getcart(data,wbclient){
	let profile = await client.db("userdb").collection("profile").findOne({ username : data.username });
	let cart = profile.cart;
	let books = [];
	for(let i=0;i<cart.length;i++){
		let book = await client.db("bookdb").collection("books").findOne({ _id : cart[i]});
		books.push(book);
	}
	wbclient.send(JSON.stringify({
		type : "cartitems",
		items : books
	}))
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