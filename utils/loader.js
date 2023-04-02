class Loader {
  AnimationDelay = 500;
  LoaderStyleRule = {
    transition : 'all 500ms',
    // animationDirection : 'alternate',
    fontWeight : 'bolder',
    display : 'inline-block',
    fontSize : '25px',
  }
  set ContainerStyleRule(obj={}){
    Object.assign(this.container.style,obj);
  }
  constructor(text = 'loading..'){
    this.text = text;
    this.container = this.create('div');
    //console.log(this.container);
    Object.assign(this.container.style,{
      position : "fixed",
      top : '0px',
      left  : '0px',
      width : '100vw',
      height : '100vh',
      background : 'white',
      textAlign : 'center',
      paddingTop : '50vh',
      boxSizing : 'border-box',
      display : 'none',
      zIndex : 1000
    });
    document.body.appendChild(this.container);
    let eln = 0;
    let arr = [];
    for(let i=0;i<this.text.length;i++){
      let span = this.create('pre');
      span.innerText = this.text[i];
      Object.assign(span.style, this.LoaderStyleRule);
      span.style.animationDelay = i*this.AnimationDelay + 'ms';
      arr.push(span);
      this.container.append(span);
    }
    let appfun = () => {
      if (eln==arr.length) eln = 0;
      arr[eln].style.transform = 'translateY(-50px) scale(2)';
      arr[eln].style.color = 'royalblue';
      arr[eln].style.borderBottom = '5px solid darkgreen';
      let x = eln;
      setTimeout(()=>{
        arr[x].style.transform = 'translateY(0px) scale(1)';
        arr[x].style.color = 'black';
        arr[x].style.borderBottom = '0px solid black';
        appfun();
      },this.AnimationDelay);
      eln++;
    }
    
    setTimeout(appfun,0);
  }
  load(){
    this.container.style.display = 'block';
  }
  unload(){
    this.container.style.display = 'none';
  }
  discard(){
    this.container.remove();
  }
  create(element='span',number=1){
    /***
     * @param {String} element - description
     * @returns an html element
    */
    let arr = [];
    for(let i=0;i<number;i++){
      arr.push(document.createElement(element));
    }
    return arr.length==1?arr[0]:arr;
  }
}
//ld.load()
