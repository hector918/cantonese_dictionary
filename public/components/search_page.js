import {cej,preload_image,raw_post,raw_get} from '../js/general.js';
class search_page {
  on_send_request(search_box)
  {
    let v_base64 = btoa(encodeURIComponent(search_box.value));    
    raw_get(`api/v1/readrecord?text=${v_base64}`,(responses_text)=>{
      try {
        let json = JSON.parse(responses_text);
        for(let x of json['result'])
        {
          this.create_one_tile(x);
        }
      } catch (error) {
        console.log(error);
      }
      
    });  
    //evt.preventDefault();
  
  }
  on_input_box_keyup_by_enter(evt)
  {
    switch(evt.keyCode)
    {
      case 13:
        //
        this.on_send_request(this.search_box);
      break;
      default:

    }
    
  }
  on_input_box_keyup_by_step_up(evt){
    //
    this.time_intervel = 0;
  }
  create_one_tile(json)
  {
    //if tile already exist, move it up front
    if(this.tilesList[json.dbId]!=undefined)
    {
      let tile = this.tilesList[json.dbId];
      this['tile_frame'].insertBefore(tile.self,this['tile_frame'].childNodes[0]);
      return;
    }

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
        case "english":case "chinese":case "phonics":case "tags":case "dbId":
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
    let tags = [];
    for(let x in json['tags'])
    {
      tags.push({tagname_:"span",class:"tag is-info is-light",innerHTML_:x});
    }
    inner_field.push({
      class:"tags",
      childrens_:tags,
    });
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

    this['tilesList'][json.dbId]=tile;
    
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
                innerHTML_:"Cantonese dictionary with English phonics.",
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
    this.tilesList={};
    this.self = cej(this.structure(),this)['self'];
    this['search_box'].addEventListener("keyup",this.on_input_box_keyup_by_enter.bind(this));

    ///this is for input box step responses
      // this['search_box'].addEventListener("keyup",this.on_input_box_keyup_by_step_up.bind(this)); 
      // let intervel = 1000;
      // this.time_intervel=intervel;
      // setInterval((evt)=>{
      //   if(this.time_intervel<=intervel)
      //   {
      //     this.time_intervel+=intervel;
      //   }
        
      //   if(this.time_intervel===intervel)
      //   {
      //     this.on_send_request(this.search_box);
      //   }
      // },intervel);
    ///end of input box step responses


    parent.appendChild(this.self);

    this.on_send_request(this.search_box);

  }

}

export {search_page as search_page}; 