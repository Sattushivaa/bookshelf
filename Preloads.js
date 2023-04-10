function handlePreloads(data){
  switch (data.type) {
    case ('cart') :
      Preloads.cart(data);
      break;
  }
}
class Preloads {
  static cart(){
    window.cart = data.cart;
  }
}