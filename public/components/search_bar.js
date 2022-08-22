import {cej,preload_image,raw_post,raw_get} from '../js/general.js';

class search_bar{
  constructor(parent){
    //
    this.parent = parent;
    let fakehost={};
    parent.append(cej(this.input_structure(),fakehost)['self']);
    parent.append(cej(this.cta_structure(),this)['self']);
    this['search_input_box']=fakehost['search_input_box'];
    addEventListener('resize',(e)=>{
      if(this.backgroundEventLimiter===null)
      {
        this.backgroundEventLimiter=1;
        let imgUrl = `https://picsum.photos/${(e.target.innerWidth+10)}/${(e.target.innerHeight+10)}?blur=5`;
        
        preload_image((xhr)=>{   
          fakehost['input_box_background'].style.backgroundImage=`url(${imgUrl})`;
          this.backgroundEventLimiter=null;
        },imgUrl);
        
      }
    });
    this.backgroundEventLimiter=null;

  }
  input_structure(){
    //
    return {
      tagname_:"section",
      export_:"input_box_background",
      class :"hero is-info",
      style:`transition: background-image ease-in-out 0.5s;background: url(https://picsum.photos/${(window.innerWidth+10)}/500?blur=5);background-position:center;background-color:rgba(0, 0, 0, 0.5);background-size: cover;`,
      childrens_:[{
        class:"hero-body",
        childrens_:[{
          class:"container",
          childrens_:[{
            class:"card",
            style:"background-color: rgba(0, 0, 0, 0.2);border-radius: 20px;",
            childrens_:[{
              class:"card-content",
              childrens_:[{
                class:"content field has-addons has-addons-right",
                style:"justify-content: center;",
                childrens_:
                [
                  {
                    class:"control",
                    childrens_:[{
                      tagname_:"button",
                      class:"button is-link is-light",
                      innerHTML_:"QRcode"
                    },]
                  },
                  {
                    class:"control has-icons-left",
                    style:"width:100%;",
                    childrens_:[
                      {
                        tagname_:"input",
                        class:"input is-rounded",
                        style:"text-align:center;",
                        type:"search",
                        export_:"search_input_box",
                        placeholder:"press enter to search...",

                      },
                      {
                        class:"icon is-medium is-left",
                        tagname_:"span",
                        childrens_:[{
                          tagname_:"i",
                          class:"fa fa-search",
                          "aria-hidden":"true",
                        }]
                      },
                      
                    ]
                  },
                  {
                    class:"control",
                    childrens_:[{
                      tagname_:"button",
                      class:"button is-primary is-light",
                      innerHTML_:"Search",
                    },]
                  }
                ]
              }]
            }]
          }]
        }]
      }]
    }
  }
  cta_structure(){
    return {
      class:"box cta",
      childrens_:[{
        class:"columns is-mobile is-centered",
        childrens_:[{
          class:"field is-grouped is-grouped-multiline",
          childrens_:[
            {
              class:"control",
              childrens_:[{
                tagname_:"span",
                class:"tag is-link is-medium",
                innerHTML_:"Link",
              }],
            },
            {
              class:"control",
              childrens_:[{
                tagname_:"span",
                class:"tag is-success is-medium",
                innerHTML_:"success",
              }],
            },
            {
              class:"control",
              childrens_:[{
                tagname_:"span",
                class:"tag is-black is-medium",
                innerHTML_:"Black",
              }],
            },
            {
              class:"control",
              childrens_:[{
                tagname_:"span",
                class:"tag is-warning is-medium",
                innerHTML_:"warning",
              }],
            },
            {
              class:"control",
              childrens_:[{
                tagname_:"span",
                class:"tag is-danger is-medium",
                innerHTML_:"danger",
              }],
            },
            {
              class:"control",
              childrens_:[{
                tagname_:"span",
                class:"tag is-info is-medium",
                innerHTML_:"info",
              }],
            },
          ]
        }]
      }]
    }
  }
}

export{
  search_bar as search_bar,
}