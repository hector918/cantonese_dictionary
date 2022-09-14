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
          tagname_:"footer",
          childrens_:[{class:"content has-text-centere",
          style:"text-align: center;",
          childrens_:[{tagname_:"p",innerHTML:`<strong>About this APP</strong> by <a href="./about.html">HZ</a>. The source code is on  <a href="https://github.com/hector918/cantonese_dictionary">Github</a>.`}]}]
        },
        {
          export_:"iframe",
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