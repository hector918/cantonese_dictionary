import {cej,preload_image,raw_post} from '../js/general.js';
class search_page {
  on_send_request(evt)
  {
    raw_post({action:"readrecord",parameter:{}},"api/v1",(responses_text)=>{
      try {
        let json = JSON.parse(responses_text);
        for(let x of json['result'])
        {
          this.create_one_tile(JSON.parse(x));
        }
      } catch (error) {
        console.log(error);
      }
      
    });  
    //evt.preventDefault();
  
  }
  on_input_box_keyup(evt)
  {
    this.time_intervel=0;
  }

  create_one_tile(json)
  {
    
    let inner_field = [];

    inner_field.push({
      class:"title",
      innerHTML_:json['english'],
    });
    inner_field.push({
      class:"subtitle",
      innerHTML_:json['chinese'],
    });
    inner_field.push({
      class:"title",
      innerHTML_:json['phonics'],
    });
    for(let x in json)
    {
      switch(x){
        case "english":case "chinese":
          //
        break;
        case "phonics":
          //
          
        break;
        default:
          //
          inner_field.push({
            tagname_:"p",
            innerHTML_:json[x],
          })
      }
    }

    let tileStructure = {class:"column is-one-third",childrens_:[
      {
        //
        class:"card",
        childrens_:[
          {
            class:"card-content",
            childrens_:inner_field,
          },
          // {
          //   tagname_:"footer",
          //   class:"card-footer",
          //   childrens_:[
          //     {
          //       tagname_:"p",
          //       class:"card-footer-item",
          //       childrens_:[{
          //         tagname_:"span",
          //         innerHTML_:"View on ",
          //         childrens_:[{
          //           tagname_:"a",href:"https://twitter.com/codinghorror/status/506010907021828096",
          //           innerHTML_:"Twitter",
          //         }]
          //       }]
          //     },
          //     {
          //       tagname_:"p",
          //       class:"card-footer-item",
          //       childrens_:[{
          //         tagname_:"span",
          //         innerHTML_:"Share on ",
          //         childrens_:[{
          //           tagname_:"a",
          //           href:"#",
          //           innerHTML_:"Facebook",
          //         }]
          //       }]
          //     }
          //   ]
          // }
        ]
      }
    ]};

    let tile = cej(tileStructure,this['tile_frame']);
    this['tile_frame'].insertBefore(tile.self,this['tile_frame'].childNodes[0]);
    
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
          class : "hero",
          style:`transition: background-image ease-in-out 0.5s;background: url(https://picsum.photos/${Math.round(window.innerWidth*1.1)}/500?blur=2);background-position:center;background-color:rgba(0, 0, 0, 0.5);background-size: cover;`,
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
          class:"columns is-multiline",
          export_:"tile_frame",
          
        }
      ]
    }
    ;
  }
  constructor(parent) {
    
    this.parent = parent;
    //this.structure();
    this.self = cej(this.structure(),this)['self'];
    this['search_box'].addEventListener("keyup",this.on_input_box_keyup.bind(this));

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
        this.on_send_request();
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