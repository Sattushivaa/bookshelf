let ld = new Loader('loading');
ld.load();
const server = new WebSocket('wss://teal-erratic-exoplanet.glitch.me',['mainserver']);
server.onopen =()=>{
  ld.discard()
}

if (!localStorage.getItem('bkshelf_0.0.1_userdata')){
  location.href = location.href.replace('/upload','/login');
}


imageup.onchange = () => {
  let file = imageup.files[0];
  if (!file) return;
  let reader = new FileReader();
  reader.onload = () => {
    preview.src = reader.result;
    filebtn.innerText = file.name;
  }
  reader.readAsDataURL(file);
}

function upload(){
  let obj = JSON.stringify({
    type : 'bookupload',
    title : bookname.value,
    author : bookauthor.value,
    cost : bookcost.value,
    cover : preview.src,
    by : JSON.parse(localStorage.getItem('bkshelf_0.0.1_userdata')).username
  })
  server.send(obj);
  //console.log(obj);
}

sellbtn.onclick = (e) =>{
  e.preventDefault();
  upload()
}

server.onmessage = (e) => {
  let data = JSON.parse(e.data);
  if(data.type == 'success') {
    let ups = new Notif('upload successfull');
    ups.show();
    location.href = location.href.replace('/upload','');
  }
}