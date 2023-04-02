let ld = new Loader('connecting...');
ld.load();
var action = 'login';
let notf = null;
var form_title = document.querySelector('span.login100-form-title');
const $ =(e)=> document.querySelectorAll(e);
const server = new WebSocket('ws://localhost:8080');
server.onopen = () => ld.discard();


function tglwork(self){
  console.log(self.innerText);
  if (self.innerText.includes('Create')) {
    self.innerText = self.innerText.replace('Create your Account','Already have an account ? login');
    action = 'signup';
    form_title.innerText = 'become a member';
    loginbtn.innerText = 'signup';
    $('#name')[0].style.display = 'block';
    $('#address')[0].style.display = 'block';
  } else {
    self.innerText = self.innerText.replace('Already have an account ? login','Create your Account');
    action = 'login';
    form_title.innerText = 'member login';
    loginbtn.innerText = 'login';
    $('#name')[0].style.display = 'none';
    $('#address')[0].style.display = 'none';
  }
}

$('#loginbtn')[0].onclick = (e) => {
  e.preventDefault();
  let obj = {
    username : usernameinp.value,
    password : passinp.value,
    type : action
  }
  if(action=='signup'){
    obj.name = nameinp.value;
    obj.address = addressinp.value;
  }
  server.send(JSON.stringify(obj));
  notf = new Notif('Waiting For Response',true);
  notf.show();
}

server.onmessage = (e) => {
  notf.hide();
  let data = JSON.parse(e.data);
  let notf2 = new Notif(data.desc,true);
  notf2.show();
  if (data.type == 'success'){
    localStorage.setItem('bkshelf_0.0.1_userdata', JSON.stringify(Object.assign(data.userdata,{
      username : usernameinp.value,
      password : passinp.value
    }))) ;
    location.href = location.href.replace('/login','');
  } else {
    alert(JSON.stringify(data));
  }
}