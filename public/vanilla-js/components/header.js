
import { createHTML } from '../general.js';
class header {
  exportObj = null;
  self_ = null;
  constructor(parent) {
    let header_ = createHTML(this.structure());
    this.exportObj = header_.export;
    this.self_ = header_.self;
    parent?.append(this.self_);

  }
  structure() {
    return {
      export_: "main",
      class:"navbar has-shadow",
      role:"navigation",
      "aria-label":"main navigation",
      childs_:[
        {class:"navbar-brand",childs_:[
          {tagname_:"a",class:"navbar-item",href:"/",childs_:[{tagname_:"img",src:"/favicon.ico",width:"28",height:"28"},{tagname_:"h1",class:"ml-3",innerHTML:"with vanilla-js frontend version"}]},
          {tagname_:"button",class:"navbar-burger","aria-label":"menu","aria-expanded":"false","data-target":"navbarBasicExample",childs_:[{tagname_:"span","aria-hidden":"true"},{tagname_:"span","aria-hidden":"true"},{tagname_:"span","aria-hidden":"true"}]}
        ]},
        {id:"navbarBasicExample",class:"navbar-menu",childs_:[
          {class:"navbar-start",childs_:[{tagname_:"a",class:"navbar-item",href:"/",innerHTML:"Here is React Version"}]}]
        }
      ]
    }
  }
}

export {header};