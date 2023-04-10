class DOM {
  constructor(){
    
  }
  static create(el){ return document.createElement(el) };
  static byid(id){ return document.getElementById(id)};
  static byclass(el){ return document.getElementsByClassName(el)}
}