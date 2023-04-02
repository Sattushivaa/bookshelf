let ld = new Loader('loading bookshelf');
ld.load();
let notif = new Notif();
const server = new WebSocket('ws://localhost:8080');
server.onopen =()=>ld.discard();
const navitem = document.getElementsByClassName('navitem');
const panes = document.querySelectorAll('section[id*="pane"]');


// ===========================


for(let i=0;i<navitem.length;i++){
  let item = navitem[i];
  item.addEventListener('click',()=>{
    for(let j=0;j<panes.length;j++){
      panes[j].style.display = 'none';
    }
    let attr = navitem[i].getAttribute('data-for');
    let d = document.getElementById(attr);
    d.style.display = 'block';
    
    for(let j=0;j<navitem.length;j++){
      navitem[j].classList.remove('active')
    }
    navitem[i].classList.add('active');
  })
}
navitem[0].click();

function showbook(el){
  let img = el.getElementsByTagName('img')[0];
  //console.log(img.src);
  document.getElementById('bookpane').style.display = 'none' ;
  document.getElementById('bookdetailpane').style.display = 'block' ;
  document.querySelector('#bookdetailpane .bookcover').src = img.src;
  showbook_author.innerText = el.dataset.author;
  showbook_cost.innerText = el.dataset.cost;
  showbook_by.innerText = el.dataset.by;
  showbook_name.innerText = el.dataset.title;
  showbook_from.innerText = el.dataset.from;
}

// ====================================

function tosellbook(){
  location.href = location.href.replace('index.html','')+'upload'
}

// ====================================

function searchbook(){
  
  server.send(JSON.stringify({
    type : 'findbook',
    keyword : searchbookname.value
  }))
  alert(searchbookname.value);
}

// ====================================

function addToCart(id){
  server.send(JSON.stringify({
    type : "addtocart",
    bookid : id,
  }));
  notif.text = 'adding to cart';
  notif.permanent = true;
  notif.show();
}

// =====================================

function getCartInfo(){
  server.send(JSON.stringify({
    type : 'getcartinfo',
    user : JSON.parse(localStorage.getItem('bkshelf_0.0.1_userdata')).username
  }))
}

// =====================================

server.onmessage =  (e) => {
  alert(e.data);
  let data = JSON.parse(e.data);
  notif.hide();
  let divs = document.querySelectorAll('div.book');
  divs.forEach(dv=>dv.remove());
  data.results.forEach( res =>{
    let cont = document.createElement('div');
    cont.classList.add('book');
    cont.addEventListener('click',()=>showbook(cont));
    Object.assign(cont.dataset,{
      title : res.title,
      cost : res.cost,
      by : res.by,
      author : res.author,
      from : res.from,
      _id : res._id
    })
    console.log(res.from);
  let book = `
      <div class="details">
        ${res.title} <br> ${res.cost}
      </div>
      <img src="${res.cover}" alt="image"><br>
  `
    cont.innerHTML = book;
    bookpane.appendChild(cont);
  })
  
}

