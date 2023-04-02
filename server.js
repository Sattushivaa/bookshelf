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
    client.onmessage = (e) => {
        let data = JSON.parse(e.data);
        //console.log(data);
        if (data.type == "login") handlelogin(data, client);
        if (data.type == "signup") handlesignup(data, client);
        if (data.type == "accountDelete") deleteAccount(data);
        if (data.type == "bookupload") uploadBook(data,client);
        if (data.type == 'findbook') findBook(data,client);
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

async function findBook(keyword,wbclient){
  console.log(keyword);
  let result = await client.db('bookdb').collection('books').find({ title : keyword}).toArray();
  for(let i = 0;i<result.length;i++){
    let user = await client.db('userdb').collection('users').findOne({ username : result[i].by });
    result[i].from = user.from;
  }
  wbclient.send(JSON.stringify({
    type : 'searchresults',
    results : result
  }));
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