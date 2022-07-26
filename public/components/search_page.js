import {cej,preload_image} from '../js/general.js';
class search_page {
  on_submit(evt)
  {
      
    evt.preventDefault();
  
  }
  on_username_click(evt)
  {
    //
    console.log(evt)
    try {

      let form = {action : "login",username:"11"};

      //var ciphertext = CryptoJS.AES.encrypt(JSON.stringify(form), 'secret key 123').toString();

      raw_post(form,"/api/v1/");
    } catch (error) {
      console.log(error)
    }
  }
  on_verification_click(evt)
  {
    //
    try {
      let source_string = this['usernameinput'].value + this['passwordinput'].value;
      let hash = CryptoJS.SHA3(source_string);
      page_var.hashkey = hash;

      let form = {action : "verification"};

      //var ciphertext = CryptoJS.AES.encrypt(JSON.stringify(form), 'secret key 123').toString();

      raw_post(form,"/api/v1/");
    } catch (error) {
      console.log(error)
    }
    

    this['on_verification_button'].addEventListener("click",this.on_verification_click);
      
  }

  structure() {
    //event hook 防止多次读取图片
    addEventListener('resize',(e)=>{
      if(this.backgroundEventLimiter===null)
      {
        this.backgroundEventLimiter=1;
        let imgUrl = `https://picsum.photos/${Math.round(this['search_page'].clientWidth*1.1)}/${Math.round(this['search_page'].clientHeight*1.1)}?blur=2`;
        
        preload_image((xhr)=>{          
          this['search_page'].style.backgroundImage=`url(${imgUrl})`;
          this.backgroundEventLimiter=null;
        },imgUrl);
        
      }
    });
    this.backgroundEventLimiter=null;
    ////////////////////////////////////
    let search_input = {
      tagname_:"input",
      class:"input is-medium",
      type:"text",
      placeholder:"Search...",
      export_:"search_box",
    }
    return {
      childrens_:[
        {
          export_:"search_page",
          tagname_ : "section",
          class : "hero is-medium",
          style:`transition: background-image ease-in-out 0.5s;background: url(https://picsum.photos/${Math.round(window.innerWidth*1.1)}/${Math.round(window.innerHeight*1.1)}?blur=2);background-position:center;background-color:rgba(0, 0, 0, 0.5);background-size: cover;`,
          childrens_ : [{
            class : "hero-body has-text-centered",
            childrens_ : [
              {
                tagname_:"h1",
                class:"title is-2",
                innerHTML_:"Word for search.",
                style:"text-shadow: #fff 1px 0 0, #fff 0 1px 0, #fff -1px 0 0, #fff 0 -1px 0;",
              },
              {
                class:"field has-addons has-addons-centered",
                childrens_:[
                  {
                    class : "control",
                    childrens_:[search_input],
                  },
                ]
              }
            ]
          }]
        },
        {
          class:"tile",
          
        }
      ]
    }
    ;
  }
  constructor(parent) {
    
    this.parent = parent;
    //this.structure();
    this.self = cej(this.structure(),this)['self'];
    this['search_box'].addEventListener("keyup",(evt)=>{
      //console.log(evt);
      this.time_intervel=0;
    });

    ///this is for input box step responses
    let intervel = 1000;
    this.time_intervel=intervel;
    setInterval((evt)=>{
      if(this.time_intervel<=intervel)
      {
        this.time_intervel+=intervel;
      }
      
      if(this.time_intervel===intervel)
      {
        console.log("reach api");
      }
    },intervel);
    ///end of input box step responses


    parent.appendChild(this.self);

    // this['login_form'].addEventListener("submit",this.on_submit);
    // this['on_username_button'].addEventListener("click",this.on_username_click);
    // this['on_verification_button'].addEventListener("click",this.on_verification_click);
    //this['passwordinput'];
    

  }

}

export {search_page as search_page}; 