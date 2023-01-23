import { createHTML } from '../general.js';
import { header } from './header.js';
import { fetch_search } from '../fetch.js';
class search_page {
  exportObj = null;
  self_ = null;
  tagsList=[
    {name:"tags:hector",tags:"tags:hector"},
    {name:"tags:test",tags:"tags:test"},
    {name:"continue",tags:"continue"},
    {name:"warning",tags:"warning"},
    {name:"danger",tags:"danger"},
    {name:"info",tags:"info"},
  ];
  ////////////////////////////////////////////////////////////
  onSearchClick = (evt)=>{
    
    fetch_search(this.exportObj['search_input'].value,(data)=>{
      
      data.result.forEach(el => {
        this.exportObj['cardDisplay'].append(createHTML(this.card_template(el)).self);
      });
    })
  }
  onQrcodeClick = (evt)=>{
    console.log(evt)

  }
  ////////////////////////////////////////////////////////////
  constructor(parent) {
    let search_page = createHTML(this.structure())
    this.exportObj = search_page.export;
    this.self_ = search_page.self;
    parent.append(this.self_);
    //////////////////////////////////////////////////////
    let header_obj = new header();
    this.exportObj["main"].prepend(header_obj.self_);
    this.exportObj = {...this.exportObj,...header_obj.exportObj};


  }
  card_template(data){
    return {
      class:"column is-one-third",childs_:[{class:"card",childs_:[{class:"card-content",childs_:[
        {class:"title",innerHTML:data.english},
        {class:"subtitle",childs_:[{tagname_:"button",class:"button",chinese_word:data.chinese,innerHTML:"Audio"}],innerHTML:data.chinese},
        {class:"title",innerHTML:data.phonics},
        {tagname_:"p",innerHTML:data['chinese sentence example']},
        {tagname_:"p",innerHTML:data['english sentence example']},
        {class:"tags",childs_:Object.values(data.tags).map(el=>({tagname_:"span",class:"tag is-info is-light",innerHTML:el}))}
      ]}]}]
    }
  }
  structure() {
    return {
      export_:"main",
      childs_:[{class:"container is-fullhd mb-2",childs_:[
        {class:"field has-addons has-addons-left m-1",childs_:[
          {tagname_:"p",class:"control",childs_:[{tagname_:"button",class:"button is-primary",innerHTML:"QRcode",event_:this.onQrcodeClick}]},
          {tagname_:"p",class:"control",childs_:[{tagname_:"input",class:"input",type:"text",placeholder:"press Enter to search",export_:"search_input"}]},
          {tagname_:"p",class:"control",childs_:[{tagname_:"button",class:"button is-link",innerHTML:"Search",event_:{"click":this.onSearchClick}}]}
        ]},
        {class:"box cta",childs_:[{class:"columns is-mobile",childs_:[{class:"field is-grouped is-grouped-multiline",
          childs_:this.tagsList.map(el=>(
            {class:"control",childs_:[{tagname_:"span",class:"tag is-info is-light is-medium is-clickable",search_word:el.tags,innerHTML:el.name}]}
          ))}]}]
        },
        {class:"columns is-multiline",export_:"cardDisplay"}
      ]}]
    }
  }
}


export{search_page}