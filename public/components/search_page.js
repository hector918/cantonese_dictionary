import {cej,preload_image,raw_post,raw_get} from '../js/general.js';

import {search_bar} from './search_bar.js';
import {error_bar} from './error_bar.js';
class search_page {
  //event
  on_error(obj){

    let error_display = new error_bar(this.error_display);
    error_display.set_text(Date() + " " + obj.toString());

    error_display.error_button.addEventListener("click",error_display.on_destory.bind(error_display));

  }
  on_send_request(search_text)
  {
    let v_base64 = btoa(encodeURIComponent(search_text));
    raw_get(`api/v1/readrecord?text=${v_base64}`,
      (json)=>{
        this.remove_tile("all");
        for(let x of json['result'])
        {
          this.create_one_tile(x);
        } 
      },this.on_error.bind(this)
    );
  }
  on_input_box_keyup_by_enter(evt)
  {
    switch(evt.keyCode)
    {
      case 13:
        //
        this.on_send_request(this.search_box.value);
      break;
      default:

    }
    
  }
  on_input_box_keyup_by_step_up(evt){
    //
    this.time_intervel = 0;
  }
  on_bing_modal_close_click(evt){
    this.qrcode_modal.classList.toggle("is-active");
    this.qrcode_modal.remove();
  }
  on_bing_click(evt){
    let fakehost = {};
    
    let modal_strcuture = {
      class:"modal",
      export_:"qrcode_modal",
      childrens_:[
        {
          class:"modal-background",
        },
        {
          class:"modal-content",
          style:"height:90%",
          export_:"bing_wrapper",
          childrens_:[
            {
              tagname_:"iframe",
              style:"width:100%;height:100%;",
              src:`https://www.bing.com/translator?from=en&to=yue&setlang=en&text=${evt.target.getAttribute("chinese_word")}`,
              title:"Inline Bing Translate",
              width:Math.max(310,window.innerWidth),
            },
            {
              style:"width: 90%;margin: 20px auto ;",
              childrens_:[
                {
                  tagname_:"figure",
                  class:"image",
                  export_:"qrcode_image",
                }
              ]
            }
            
          ]
        },
        {
          tagname_:"button",
          class:"modal-close is-large",
          "aria-label":"close",
          event_:{"click":this.on_bing_modal_close_click.bind(fakehost)},
        }
      ]
    };

    let wrapper = cej(modal_strcuture,fakehost);
    // console.log(window.innerWidth,window.innerHeight)
    this.iframe.append(wrapper.self);
    wrapper.self.classList.add("is-active");
    
  }
  //event
  remove_tile(index="all")
  {
    if(index==="all")
    {
      if(Object.values(this.tilesList).length)
        for(let x in this.tilesList)
        {
          let tile = this.tilesList[x].self;
          tile.parentNode.removeChild(tile);
          delete this.tilesList[x]
        }
    }
    else
    {
      if(this.tilesList[index]!=undefined)
      {
        let tile = this.tilesList[index].self;
        tile.parentNode.removeChild(tile);
        delete this.tilesList[index]
      }
    }
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
      childrens_:[{tagname_:"button",class:"button",innerHTML:"Bing-> pronunciation",style:"margin-left:10px;",chinese_word:json['chinese'],event_:{"click":this.on_bing_click.bind(this)}}]
    });
    inner_field.push({
      class:"title",
      innerHTML_:json['phonics'],
    });
    for(let x in json)
    {
      switch(x){
        case "english":case "chinese":case "phonics":case "tags":case "dbId":
          //skip those keys
        break;
        
        default:
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
    
    return {
      childrens_:[
        {
          export_:"error_display",
        },
        {
          class:"columns is-multiline",
          export_:"tile_frame",
        },
        {
          
          export_:"iframe",
        },
        {
          tagname_:"footer",
          childrens_:[{class:"content has-text-centere",
          style:"text-align: center;",
          childrens_:[{tagname_:"p",innerHTML:`<strong>About this APP</strong> by <a href="./about.html">HZ</a>. The source code is on  <a href="https://github.com/hector918/cantonese_dictionary">Github</a>.`}]}]
        }
      ]
    }
    ;
  }
  constructor(parent) {
    
    this.parent = parent;
    let search_bar_ = new search_bar(parent);
    this.search_box=search_bar_.search_input_box;

    this.tilesList={};
    this.self = cej(this.structure(),this)['self'];
    this.search_box.addEventListener("keyup",this.on_input_box_keyup_by_enter.bind(this));
    ///end of input box step responses
    parent.appendChild(this.self);

    this.on_send_request(this.search_box.value);

  }

}
/*
https://www.bing.com/translator?from=en&to=yue&setlang=en&text=apple
*/
export {search_page as search_page}; 