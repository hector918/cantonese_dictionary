import {cej,preload_image,raw_post,raw_get,LoadScript} from '../js/general.js';
class error_bar{
  on_destory(){
    clearInterval(this.countdown);
    this.self.remove()
  }
  constructor(parent){

    this.parent = parent;
    this.self = cej(this.structure(),this)['self'];
    parent.append(this.self);
    this.countdown = setInterval(()=>{
      this.error_progress_bar.setAttribute("value",Number(this.error_progress_bar.getAttribute("value"))-1);
    },50)
    setTimeout(this.on_destory.bind(this),5000);

  }
  set_text(text){
    this.error_body.innerText = text;
  }

  structure(){
    //
    
    /*
    <progress class="progress" value="15" max="100">15%</progress>
    */
    return {
      childrens_:[
        {
          class:"columns",
          childrens_:[
            {
              class:"is-four-fifths column",
              childrens_:[{
                tagname_:"span",
                innerHTML_:"",
                export_:"error_body",
              }]
            },
            {
              class:" column",
              childrens_:[{
                tagname_:"button",
                class:"button is-small",
                innerHTML_:"dismiss",
                export_:"error_button",
              }]
            },
          ]
        },
        {
          tagname_:"progress",
          class:"progress is-danger",
          value:"100",
          max:"100",
          innerHTML_:"100%",
          export_:"error_progress_bar",
        },
      ]
    }
  }
}

export{
  error_bar as error_bar,
}