//console.log(DOM);
let ld = new Loader('loading bookshelf');
ld.load();
let notif = new Notif();
const server = new WebSocket('ws://localhost:8080');
server.onopen =()=>ld.discard();
const navitem = document.getElementsByClassName('navitem');
const panes = document.querySelectorAll('section[id*="pane"]');

// ==========================================

function loginned(){
  return !!localStorage.getItem('bkshelf_0.0.1_userdata')
}

function gotologin(){
  location.href = location.href.includes('index.html')?location.href.replace('index.html','login'):location.href+'/login';
}

// ==========================================


for(let i=0;i<navitem.length;i++){
  let item = navitem[i];
  item.addEventListener('click',()=>{
    for(let j=0;j<panes.length;j++){
      panes[j].style.display = 'none';
      panes[j].classList.add('paneglobal');
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
  document.querySelector('#bookdetailpane .bookcover').src = el.dataset.src;
  showbook_author.innerText = el.dataset.author;
  showbook_cost.innerText = el.dataset.cost;
  showbook_by.innerText = el.dataset.by;
  showbook_name.innerText = el.dataset.title;
  showbook_from.innerText = el.dataset.from;
  window.activebook_id = el.dataset._id;
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
  }));
  notif.text = 'waiting for response';
  notif.permanent = true;
  notif.show();
  //alert(searchbookname.value);
}

// ====================================

function addToCart(id){
  if (!loginned()){ gotologin(); return };
  server.send(JSON.stringify({
    type : "addtocart",
    bookid : id,
    username : JSON.parse(localStorage.getItem('bkshelf_0.0.1_userdata')).username
  }));
  notif.text = 'adding to cart';
  notif.permanent = true;
  notif.show();
}

// ===========================================

function getUserInfo(){
  server.send(JSON.stringify({
    type : 'getuserinfo',
    username : JSON.parse(localStorage.getItem('bkshelf_0.0.1_userdata')).username
  }))
  notif.text = 'fetching account info';
  notif.show();
}

// ===========================================

function getCartInfo(preload=false){
  if (!loginned()){ gotologin(); return };
  server.send(JSON.stringify({
    type : preload?'getcartpreload':'getcart',
    username : JSON.parse(localStorage.getItem('bkshelf_0.0.1_userdata')).username
  }));
  notif.text = 'waiting for response';
  notif.permanent = true;
  notif.show();
}

// =====================================

server.onmessage =  (e) => {
  alert(e.data);
  let data = JSON.parse(e.data);
  if(data.preload){
    handlePreloads(data);
    return;
  }
  notif.hide();
  if(data.type=='searchresults') handlesearchresults(data);
  if(data.type=='cartitems') handlecartitems(data);
  if(data.type=='userinfo') alert(JSON.stringify(data));
}

// ===========================================

function handlesearchresults(data){
    let divs = document.querySelectorAll('div.book');
    divs.forEach(dv => dv.remove());
    data.results.forEach(res => {
      let cont = document.createElement('div');
      cont.classList.add('book');
      cont.addEventListener('click', () => showbook(cont));
      Object.assign(cont.dataset, {
        title: res.title,
        cost: res.cost,
        src : res.cover,
        by: res.by,
        author: res.author,
        from: res.from,
        _id: res._id
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

//===========================================

function handlecartitems(data){
  let old_itms = document.querySelectorAll('.cartitem');
  for (let i=0;i<old_itms.length;i++){
    old_itms[i].remove();
  }
  data.items.map((book)=>{
    let container = DOM.create('div');
    container.className = 'cartitem';
    cartpane.appendChild(container);
    let ctt = `
        <div class="card">
  <!--div class="card-header">
    Featured
  </div-->
  <div class="card-body">
    <h5 class="card-title">${book.title}</h5>
    <p class="card-text">by ${book.author}</p>
    <a href="#" class="btn btn-dark">Go somewhere</a>
  </div>
</div>
    `;
    container.innerHTML = ctt;
    Object.assign(container.dataset,book);
  })
}