//console.log(DOM);
let ld = new Loader('loading bookshelf');
ld.load();
let notif = new Notif();
const server = new WebSocket('wss://teal-erratic-exoplanet.glitch.me',['mainserver']);
server.onopen =()=>ld.discard();
const navitem = document.getElementsByClassName('navitem');
const panes = document.querySelectorAll('section[id*="pane"]');

window.cartaction = "add";


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
  window.activebookelement = el;
  // let img = el.getElementsByTagName('img')[0];
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
  if (el.dataset.incart!=null && el.dataset.incart!="undefined" && el.dataset.incart!="null"){
    //console.log(el.dataset.incart);
    btnaddtocart.innerText = "remove from cart";
    window.cartaction = "remove"
  } else {
    btnaddtocart.innerText = "add to cart";
    window.cartaction = "add"
  }
}


function buybooknow(book){
  //console.log(book);
  //document.getElementById('bookpane').click()
  document.getElementById('cartpane').style.display = 'none' ;
  document.getElementById('buybooknowpane').style.display = 'block' ;
  buying_cost.innerText = book.cost;
  buying_title.innerText = book.title;
  buying_img.src = book.cover;
  buying_delivery_charge = parseFloat(book.cost)*10/100 + ' INR';
  
}
// ====================================

function tosellbook(){
  location.href = location.href.replace('index.html','')+'upload'
}

// ====================================

function searchbook(){
  if (!loginned()){ gotologin(); return };
  if (dummybooknames.some(val=>new RegExp(searchbookname.value,'ig').test(val))){
    let reg = new RegExp(searchbookname.value,'ig');
    let bks = dummybooks.filter(b=>b.title.match(reg));
    handlesearchresults({results : bks});
    return;
  }
  // getcartpreload ================
  server.send(JSON.stringify({
    type : "getcartpreload",
    username : JSON.parse(localStorage.getItem('bkshelf_0.0.1_userdata'))?.username
  }))
  //=========================
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
  if (isadummyid(id)) return addtodummycart(id);
  if (window.cartaction=="remove") { removefromcart(id); return; }
  server.send(JSON.stringify({
    type : "addtocart",
    bookid : id,
    username : JSON.parse(localStorage.getItem('bkshelf_0.0.1_userdata')).username
  }));
  //getCartInfo(true);
  btnaddtocart.innerText = "remove from cart";
  window.cartaction = 'remove';
  notif.text = 'adding to cart';
  notif.permanent = true;
  notif.show();
}

function removefromcart(id){
  server.send(JSON.stringify({
    type : "removefromcart",
    bookid : id,
    username : JSON.parse(localStorage.getItem('bkshelf_0.0.1_userdata')).username
  }));
  //getCartInfo(true);
  notif.text = 'removing from cart';
  notif.permanent = true;
  btnaddtocart.innerText = "add to cart";
  window.cartaction='add';
  notif.show();
}

// ===========================================

function getUserInfo(){
  if (!loginned()){ gotologin(); return };
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
  
  let old_itms = document.querySelectorAll('.cartitem');
  for (let i=0;i<old_itms.length;i++){
    old_itms[i].remove();
  }
  
  handlecartitems({items:bkdummy.getBooks()});
  
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
  //alert(e.data);
  notif.hide();
  let data = JSON.parse(e.data);
  if(data.preload){
    handlePreloads(data);
    return;
  }
  notif.hide();
  if(data.type=='searchresults') handlesearchresults(data);
  if(data.type=='cartitems') handlecartitems(data);
  if(data.type=='userinfo') handleuserinfo(data);
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
        _id: res._id,
        dummy : res.dummy,
        incart : window._cart?.find((v)=>v==res._id) || null
      })
      //console.log(res.from);
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
  
  data.items.forEach((book)=>{
    if (book == null) return ;
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
    <a href="#" class="btn btnbuynow btn-dark">Buy Now</a>
  </div>
</div>
    `;
    container.innerHTML = ctt;
    let btn = document.querySelectorAll("a.btnbuynow");
    btn = btn[btn.length-1];
    //console.log(book);
    btn.addEventListener("click",()=>buybooknow(book));
    //Object.assign(container.dataset,book);
  })
}




//========================================================================================================================================

function handlePreloads(data){
  //alert(data);
  if (data.cart!=null) {
    window._cart = data.cart;
    let el = window.activebookelement;
    if (!el) {
      //console.log("el is "+ el);
      return;
    };
    let incart = false;
    for(let i=0;i<window._cart.length;i++){
      if(window._cart[i] == el.dataset._id) incart = true;
    }
    if (incart){
      btnaddtocart.innerText = "remove from cart";
      window.cartaction = "remove";
    } else {
      btnaddtocart.innerText = "add to cart";
      window.cartaction = "add";
    }
  }
}

function serviceUnavailable(){
  notif.hide();
  notif.text = 'service unavailable';
  notif.permanent = false;
  notif.show();
}

function signout(){
  localStorage.clear();
  location.reload();
}

function deleteaccount(){
  let confirmation = confirm('Do you really want to delete your account ? this action cannot be reversed.');
  if (!confirmation) return;
  server.send(JSON.stringify({
    type : 'deleteaccount',
    username : JSON.parse(localStorage.getItem('bkshelf_0.0.1_userdata')).username
  }));
  notif.text = 'deleting account';
  notif.permanent = true;
  notif.show();
  setTimeout(signout,1000);
}

function handleuserinfo(data){
  console.log(data);
  account_name.innerText = 'Welcome ' + data.name;
  account_username.innerText = data.username;
}