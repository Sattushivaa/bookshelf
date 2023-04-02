class Notif {
  set text(text){this.box.innerText=text};
  constructor(text='',permanent=false){
    this.permanent = permanent;
    this.container = this.el("div");
    Object.assign(this.container.style,{
      position : "fixed",
      zIndex : 1000,
      width : '100vw',
      left : '0px',
      padding : '10px',
      bottom : '-100px',
      transition : 'all 300ms',
    });
    this.box = this.el("div");
    this.box.innerText = text;
    Object.assign(this.box.style,{
      padding : '10px',
      background : 'black',
      color : 'white',
      overflow : 'hidden',
      maxHeight : '100px',
      borderRadius : '5px',
    });
    this.container.appendChild(this.box);
    document.body.appendChild(this.container);
  }
  show(){
    this.container.style.bottom = '0px';
    !this.permanent?setTimeout(this.hide.bind(this),2000):'';
  }
  hide(){
    this.container.style.bottom = '-100px';
  }
  el=(el)=>document.createElement(el)
}