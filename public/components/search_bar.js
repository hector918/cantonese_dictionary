import {cej,preload_image,raw_post,raw_get,LoadScript} from '../js/general.js';
class search_bar{
  on_resize(e){
    if(this.backgroundEventLimiter===null)
    {
      this.backgroundEventLimiter=1;
      let imgUrl = `https://picsum.photos/${(e.target.innerWidth+10)}/${(e.target.innerHeight+10)}?blur=5`;
      
      preload_image((xhr)=>{   
        fakehost['input_box_background'].style.backgroundImage=`url(${imgUrl})`;
        this.backgroundEventLimiter=null;
      },imgUrl);
    }
  }
  on_qrcode_button_click(){
    // qrcode_popup_button
    let url =window.location.href;
    if(url.indexOf("?text=")!=-1){
      url = url.slice(url.indexOf("?text="));
    }
    // console.log(`${url}?text=${this.search_input_box.value}`)
    this.qrcode_input.value = `${url}?text=${this.search_input_box.value}`;
    this.qrcode_image.innerHTML="";
    let qrcode = new QRCode(this.qrcode_image, {
      text: `${url}?text=${this.search_input_box.value}`,
      width: 300,
      height: 300,
      colorDark : "#cc3300",
      colorLight : "white",
      correctLevel : QRCode.CorrectLevel.H
    });
    
    this.qrcode_modal.classList.toggle("is-active");
  }
  on_qrcode_modal_close_click(evt){
    this.fakehost.qrcode_modal.classList.toggle("is-active");
  }
  constructor(parent){
    LoadScript('https://cdn.rawgit.com/davidshimjs/qrcodejs/gh-pages/qrcode.min.js');

    this.parent = parent;
    let fakehost={};
    parent.append(cej(this.input_structure(),fakehost)['self']);
    parent.append(cej(this.cta_structure(),this)['self']);
    this['search_input_box']=fakehost['search_input_box'];
    this['search_button'] = fakehost['search_button'];
    addEventListener('resize',this.on_resize);
    this.backgroundEventLimiter=null;
    fakehost['qrcode_popup_button'].addEventListener('click',this.on_qrcode_button_click.bind(fakehost));
    
    parent.append(cej(this.modal_structure(),fakehost)['self']);
    this.fakehost = fakehost;
  
  }
  modal_structure(){
    //
    
    /*
    <div class="modal">
      <div class="modal-background"></div>
      <div class="modal-content">
        <!-- Any other Bulma elements you want -->
      </div>
      <button class="modal-close is-large" aria-label="close"></button>
    </div>
    */
    return {
      class:"modal",
      export_:"qrcode_modal",
      childrens_:[
        {
          class:"modal-background",
        },
        {
          class:"modal-content",
          childrens_:[
            {
              class:"field has-addons",
              childrens_:[
                {tagname_:"p",class:"control",childrens_:[{tagname_:"a",class:"button is-static",innerHTML_:"Share this page with: "}]},
                {tagname_:"p",class:"control is-expanded",childrens_:[{tagname_:"input",export_:"qrcode_input",readonly:"",class:"input",event_:{"focus":e=>e.target.select()}}]}
              ]
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
          event_:{"click":this.on_qrcode_modal_close_click.bind(this)},
        }
      ]
    }
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
            style:"background-color: rgba(0, 0, 0, 0.2);",
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
                      innerHTML_:"QRcode",
                      export_:'qrcode_popup_button',
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
                      export_:"search_button",
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
  control_tag_on_click(evt){

    this.search_input_box.value=evt.target.getAttribute("search_word");
    const kbEvent = new KeyboardEvent('keyup', {keyCode:13,},false);
    this.search_input_box.dispatchEvent(kbEvent);
    
  }
  control_tag_structure(text,search_word,style="link",size="m"){
    //
    let style_list = {
      primary : "is-primary",
      link : "is-link",
      success : "is-success",
      black : "is-black",
      warning : "is-warning",
      danger : "is-danger",
      info : "is-info",
    };
    let size_list ={
      s : "is-small",
      m : "is-medium",
      l : "is-large"
    };
    let tag = {
      class:"control",
      childrens_:[{
        tagname_:"span",
        class:`tag ${style_list[style]||"is-danger"} ${size_list[size]||"is-medium"}`,
        innerHTML_:text,
        search_word,
        event_:{"click":this.control_tag_on_click.bind(this)},
      }],
    };
    
    return tag;
  }
  cta_structure(){
    return {
      class:"box cta",
      childrens_:[{
        class:"columns is-mobile is-centered",
        childrens_:[{
          class:"field is-grouped is-grouped-multiline",
          export_:"control_tag_box",
          childrens_:[
            this.control_tag_structure("tags:hector","tags:hector"),
            this.control_tag_structure("tags:test","tags:test","success"),
            this.control_tag_structure("continue","continue","black"),
            this.control_tag_structure("warning","warning","warning"),
            this.control_tag_structure("danger","danger","danger"),
            this.control_tag_structure("info","info","info"),
          ]
        }]
      }]
    }
  }
}

export{
  search_bar as search_bar,
}