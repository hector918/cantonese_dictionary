import {cej,appendCSS,getElBy,raw_post, raw_get} from '../js/general.js';

function raw_post_c (json_data,path,callback)
{
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      try {
        
        var bytes  = CryptoJS.AES.decrypt(this.responseText, page_var['hashkey']);
        var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));    
        callback(decryptedData);
      } catch (error) {
        let rst = JSON.parse(this.responseText);
        callback(rst);
      }
      
    }
  };
  //add a random seed to the package
  json_data['random']=Math.random();
  //

  if(page_var['hashkey']===undefined||page_var['hashkey']==="")
  {
    
  }

  let ciphertext = CryptoJS.AES.encrypt(JSON.stringify(json_data), page_var['hashkey']).toString();

  xhttp.open("POST", path );
  xhttp.send(`{"at":"${ciphertext}","username":"${page_var['username']}"}`);
  
}

function reset_password(){
  page_var['hashkey'] = prompt("Input the password for upload");
}

class input_page {
  on_search_input_keyup(evt){
    switch(evt.code)
    {
      case "Enter":
        let inVal = evt.target.value;
        raw_get(`api/v1/readrecord?search=${inVal}`,(rsp)=>{
          try {
            let rst = JSON.parse(rsp)['result'];
            rst.forEach(el=>this.create_card(el,this));
          } catch (error) {
            
          }
        })
      break;
      default:

    }
  }
  on_reset_password_click(){
    reset_password();
  }
  on_close_card_click(evt)
  {
    //
    let column = this['self'];
    column.parentNode.removeChild(column);
  }
  set_db_index(index){
    console.log(index)
    if(index!==false) this.dbId = index;
  }
  set_card_state(text,state="normal")
  {
    let card = this.fakehost.cardbody.self.firstChild;
    let state_text = this.fakehost.state_text_box;

    state_text.classList.remove("has-text-warning");
    state_text.classList.remove("has-text-success");
    state_text.classList.remove("has-text-danger");
    state_text.innerHTML=text;

    card.classList.remove("is-error");
    card.classList.remove("is-working");
    card.classList.remove("is-success");
    switch(state)
    {
      case "working":
        card.classList.add("is-working");
        state_text.classList.add("has-text-warning");
      break;
      case "error":
        card.classList.add("is-error");
        state_text.classList.add("has-text-danger");

      break;
      case "success":
        card.classList.add("is-success");
        state_text.classList.add("has-text-success");

      break;
      default:
        

    }
  }
  on_save_click(evt)
  {
    let uploadData = {
      username : "hector",
      data : {dbId:this.dbId},
      action:"addrecord",
    };
    let inputs = getElBy(this.fakehost['cardbody'].self,"input");
    for(let x of inputs)
    {
      if (x['name']!=="") uploadData.data[x['name']]=x.value;
    }

    let tags = getElBy(this.fakehost['tagsbox'],"div");
    uploadData.data['tags']={};
    for(let x of tags)
    {
      uploadData.data['tags'][x.innerHTML] = x.innerHTML;
    }
    
    raw_post_c(uploadData,"api/v1",(rst)=>{
      if(rst['errors']!=undefined)
      {
        this.set_card_state(rst['errors'],"error");
      }
      else
      {
        try {
          let {master_insertId} = JSON.parse(rst['result']);
          this.set_db_index(master_insertId);
          
        } catch (error) {
          this.set_card_state("json error","error");
        }
        
        this.set_card_state(rst['content'],"success");
        let timer = setTimeout(() => {
          clearTimeout(timer);
          this.set_card_state("");
        }, 10000);
      }
    });
    this.set_card_state("","working");
  }
  tagBox_on_blur(evt)
  {
    //
    evt.target.setAttribute("type","submit");
    evt.target.value = "Add";
  }
  tagBox_on_click(evt)
  {
    //
    evt.target.setAttribute("type","input");
    evt.target.value = "";
  }
  
  tagsbox_on_keypress(evt)
  {
    //
    switch(evt.code)
    {
      case "Enter":
        this.tagsbox_add_tag(evt.target.value);
        evt.target.select();
      break;
      default:

    }    
  }
  tagsbox_add_tag(text)
  {
    let exist_tags = getElBy(this['fakehost']['tagsbox'],"div");
    if(exist_tags.find(x=>x.innerHTML===text)!==undefined) return;
    
    let tag = cej(this.tag(text),{});
    this['fakehost']['tagsbox'].appendChild(tag.self);
  }
  tagsbox_tag_remove_button_click(evt)
  {
    let tag = evt.target.parentNode;
    tag.parentNode.removeChild(tag)
  }
  create_card(json,input_page_obj){
    let fakehost = {};
    //create the el on fakehost, to pass the card obj to save button
    let singleCard = cej(input_page_obj['singleCardStructure'](json),fakehost);

    fakehost['cardbody']=singleCard;
    input_page_obj['cardContainer'].insertBefore(singleCard.self,input_page_obj['cardContainer'].childNodes[1]);
    
    //bind the save button with the card
    fakehost['saveButton'].addEventListener("click",input_page_obj.on_save_click.bind(this),true);
    //tagsbox event
    fakehost['tagbox_add_button'].addEventListener("click",input_page_obj.tagBox_on_click.bind(fakehost),true);
    fakehost['tagbox_add_button'].addEventListener("blur",input_page_obj.tagBox_on_blur.bind(fakehost),true);
    fakehost['tagbox_add_button'].addEventListener("keyup",input_page_obj.tagsbox_on_keypress.bind(this),true);
    fakehost['card_delete_button'].addEventListener("click",this.on_close_card_click.bind(singleCard));


    this['fakehost']=fakehost;
    return singleCard;

  }
  on_add_card_click(e){
    
    let card = this.create_card({},this);
    getElBy(card.self,"input")[0].focus();
  }
  tag(text){
    return {
      class:"tag is-link is-medium",
      tagname_:"span",
      childrens_:[
        {
          tagname_:"div",
          innerHTML_:text,
        },
        {
          tagname_:"button",
          class:"delete is-small",
          event_:{"click":this.tagsbox_tag_remove_button_click},
        },
        
      ]
    }
  }
  structure() {
  
    let inputField =(label,value="")=>{
      return {
        class:"field",
        childrens_:[
          {
            tagname_:"label",
            innerHTML_:label,
          },
          {
            class:"control",
            childrens_:[{
              tagname_:"input",
              class:"input is-medium",
              type:"text",
              name:label,
              value,
            }]
          }
        ]
      }
    }

    let singlecardCSS = [
      '.hover-hack-singlecard:hover{ transition: box-shadow 0.3s ease-in-out; box-shadow: 3px 3px 19px 3px rgba(0,255,255,0.25);}',
      '.hover-hack-singlecard{transition: box-shadow 0.3s ease-in-out;  box-shadow: none}',
    ];
    appendCSS(singlecardCSS.join(";"));

    let singleCard = (preData={})=>{
      if(Object.keys(preData)===0)
      {

      }
      return {
        class:"column",
        childrens_:
        [{
          class:"card hover-hack-singlecard",
          childrens_:[
            {
              tagname_:"header",
              class:"card-image",
              childrens_:[
                {
                  tagname_:"p",
                  class:"card-header-title",
                  style:"justify-content: space-between;",
                  innerHTML_:"Add record",
                  childrens_:[
                    {
                    tagname_:"span",
                    class:"block",
                    innerHTML_:"state text",
                    export_:"state_text_box",
                    },
                    {
                      tagname_:"button",
                      class:"delete is-large",
                      export_:"card_delete_button",
                    }
                  ]
                },
                
              ]
            },
            {
              class:"card-content",
              childrens_:[{
                class:"content",
                childrens_:[
                  inputField("english",preData["english"]||""),
                  inputField("chinese",preData["chinese"]||""),
                  inputField("phonics",preData["phonics"]||""),
                  inputField("chinese sentence example",preData["chinese sentence example"]||""),
                  inputField("english sentence example",preData["english sentence example"]||""),
                  {
                    class:"columns",
                    childrens_:[
                      {
                        class:"column is-narrow",
                        childrens_:[{
                          export_:"tagbox_add_button",
                          class:"input is-rounded",
                          tagname_:"input",
                          type:"submit",
                          value:"Add",
                          innerHTML_:"test",
                          placeholder:"press enter to confirm."
                        },
                       ]
                      },
                      {
                        class:"column",
                        childrens_:[
                          {
                            class:"tags",
                            export_:"tagsbox",
                            childrens_:[
                              // tag("Add")
                            ]
                          }
                        ]
                      },
                    ]
                  }
                ]
              }]
            },
            {
              tagname_:"footer",
              class:"card-footer",
              childrens_:[
                {
                  tagname_:"a",
                  class:"card-footer-item",
                  innerHTML_:"save",
                  export_:"saveButton",
                },
                // {
                //   tagname_:"a",
                //   class:"card-footer-item",
                //   innerHTML_:"edit",
                // },
                {
                  tagname_:"a",
                  class:"card-footer-item",
                  innerHTML_:"delete",
                },
                
              ]
            }
          ]
        }]
      }
    }
    this['singleCardStructure']=singleCard;

    let functionCard = ()=>{
      return {
        class:"column is-one-third",
        childrens_:
        [{
          class:"card hover-hack-singlecard function-card-centered",
          style:"display: flex;justify-content: center;align-items: center; height: 100%;",
          
          childrens_:
          [{
            class:"card-content",
            childrens_:
            [
              {
                class:"content",
                childrens_:[
                  {
                    tagname_:"input",
                  },
                ],
                event_:{"keyup":this.on_search_input_keyup.bind(this)},
              },
              {
                class:"content",
                event_:{"click":this.on_add_card_click.bind(this)},
                style:"text-align:center;",
                childrens_:
                [{
                  tagname_:"button",
                  style:"border:none;",
                  class:"button is-large",
                  childrens_:
                  [{
                    tagname_:"span",
                    class:"icon is-medium",
                    childrens_:
                    [{
                      tagname_:"i",
                      class:"fa fa-plus fa-2x"
                    }]
                  }]
                }]
              }
            ]
          }]
        }]
      }
    }
    return{
      childrens_:[
        {
          tagname_:"section",
          class:"hero is-info is-small",
          childrens_:[{
            class:"hero-body",
            childrens_:[{
              class:"container has-text-centered",
              childrens_:[
                {
                  tagname_:"p",
                  class:"title",
                  innerHTML_:"Title"
                },
                {
                  tagname_:"p",
                  class:"subtitle",
                  innerHTML_:"subTitle"
                },
              ]
            }]
          }]
        },
        {
          class:"box cta",
          childrens_:[{
            tagname_:"p",
            class:"has-text-centered",
            innerHTML_:"Here we have modal cards. When you click on them they will open functional modal examples.",
            childrens_:[{
              tagname_:"span",
              class:"tag is-primary",
              innerHTML_:"New",
              event_:{click:this.on_reset_password_click},
            }]
          }]
        },
        {
          class:"container is-fluid",
          childrens_:[{
            class:"columns is-multiline",
            export_:"cardContainer",
            childrens_:[
              functionCard(),
            ]
          }]
        }
      ]
    };
  }

  constructor(parent) 
  {
    
    this.parent = parent;

    parent.appendChild(cej(this.structure(),this)['self']);

  }
}

export {input_page as input_page}; 