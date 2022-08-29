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

  try {
    xhttp.open("POST", path );
    xhttp.send(`{"at":"${ciphertext}","username":"${page_var['username']}"}`);
    
  } catch (error) {
    callback({"errors":error.toString()});
  }
}

function reset_password(){
  page_var['hashkey'] = prompt("Input the password for upload");
}

class input_page {
  on_search_input_keyup(evt){
    switch(evt.code)
    {
      case "Enter":
        let inVal = btoa(encodeURIComponent(evt.target.value));
        raw_get(`api/v1/readrecord?text=${inVal}`,(rsp)=>{
          try {
            let rst = JSON.parse(rsp);

            rst['result'].forEach(el=>this.create_card(el,this));

            let msg_board= this['search_box_message_board'];
            msg_board.innerHTML = rst.content;
            msg_board.parentNode.classList.remove("is-hidden");
            //clear the not trigger timer;
            clearTimeout(this['messagebox_timer_handler']);

            let timerHandle = setTimeout(()=>{
              msg_board.parentNode.classList.add("is-hidden");
              clearTimeout(timerHandle);
            },5000);
            this['messagebox_timer_handler']=timerHandle;
          } catch (error) {
            console.log(error)
          }
        })
      break;
      default:

    }
  }
  on_search_box_focus(evt){
    evt.target.select();
  }
  on_clear_all_cards_click(evt){
    //
    let cards = this['cardContainer'].childNodes;
    for(let x = Object.keys(cards).length-1; x >= 1; x-- )
    {
      cards[x].parentNode.removeChild(cards[x]);
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
  
  set_card_state(text,state="normal")
  {
 
    let card = this.cardbody.self.firstChild;
    let state_text = this.state_text_box;

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
  on_delete_record_click(evt){
    //
    let uploadData = {
      username : "hector",
      data : {dbId:this.dbId},
      action:"deleterecord",
    };

    raw_post_c(uploadData,"api/v1",(rst)=>{
      if(rst['errors']!=undefined)
      {
        this.set_card_state(rst['errors'],"error");
      }
      else
      {
        try {
          this.cardbody.self.parentNode.removeChild(this.cardbody.self);
        } catch (error) {
          this.set_card_state("json error","error");
        }
       
      }
    });
  }
  on_save_click(evt)
  {
    let uploadData = {
      username : "hector",
      data : {dbId:this.dbId},
      action:this.dbId?"updaterecord" :"addrecord",
    };
    let inputs = getElBy(this['cardbody'].self,"input");
    for(let x of inputs)
    {
      if (x['name']!=="") uploadData.data[x['name']]=x.value;
    }

    let tags = getElBy(this['tagsbox'],"div");
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
          this['card_title_box']=`Record Id:${master_insertId}`;
          this.dbId = master_insertId;
          this.set_card_state(rst['content'],"success");
          let timer = setTimeout(() => {
            clearTimeout(timer);
            this.set_card_state("");
          }, 10000);
        } catch (error) {
          console.log(error);
          this.set_card_state("response:"+error.toString(),"error");
        }
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
    let exist_tags = getElBy(this['tagsbox'],"div");
    //no allow double
    if(exist_tags.find(x=>x.innerHTML===text)!==undefined) return;
    let tmp ={};
    let tag = cej(this.tag(text),tmp);
    
    tmp['tag_delete_button'].addEventListener("click",this.tagsbox_tag_remove_button_click);
    this['tagsbox'].appendChild(tag.self);
  }
  tagsbox_tag_remove_button_click(evt)
  {
    let tag = evt.target.parentNode;
    tag.parentNode.removeChild(tag)
  }
  create_card(json,input_page_obj){
    let fakehost = {};
    //create the el on fakehost, to pass the card obj to save button
    let singleCard = cej(input_page_obj.singleCardStructure(json),fakehost);

    fakehost['cardbody']=singleCard;
    input_page_obj['cardContainer'].insertBefore(singleCard.self,input_page_obj['cardContainer'].childNodes[1]);
    
    //bind the save and delete button with the card
    fakehost['saveButton'].addEventListener("click",input_page_obj.on_save_click.bind(fakehost),true);
    fakehost['deleteRecordButton'].addEventListener("click",input_page_obj.on_delete_record_click.bind(fakehost),true);
    
    //tagsbox event
    fakehost['tagbox_add_button'].addEventListener("click",input_page_obj.tagBox_on_click.bind(fakehost),true);
    fakehost['tagbox_add_button'].addEventListener("blur",input_page_obj.tagBox_on_blur.bind(fakehost),true);
    fakehost['tagbox_add_button'].addEventListener("keyup",input_page_obj.tagsbox_on_keypress.bind(fakehost),true);
    
    fakehost['card_delete_button'].addEventListener("click",this.on_close_card_click.bind(singleCard));
    fakehost.set_card_state=this.set_card_state.bind(fakehost);
    fakehost.tagsbox_add_tag = this.tagsbox_add_tag.bind(fakehost);

    fakehost.tagsbox_tag_remove_button_click=this.tagsbox_tag_remove_button_click;
    fakehost.tag = this.tag.bind(fakehost);

    if(json&&json.tags) for(let x in json['tags'])
    {
      fakehost.tagsbox_add_tag(x);
      //fakehost.tagsbox.appendChild(cej(this.tag(x),{}).self);

    }
    
    fakehost['card_title_box'].innerHTML=`Record Id:${json['dbId']||undefined}`;
    fakehost['dbId']=json['dbId']||undefined;
    
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
          export_:"tag_delete_button",
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
        class:"column is-one-third",
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
                  childrens_:[
                    {
                      tagname_:"span",
                      export_:"card_title_box",
                      
                    },
                    {
                    tagname_:"span",
                    class:"block",
                    innerHTML_:"",
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
                    class:"columns is-multiline",
                    childrens_:[
                      {
                        class:"column is-narrow",
                        childrens_:[{
                          export_:"tagbox_add_button",
                          class:"input is-rounded",
                          tagname_:"input",
                          type:"submit",
                          value:"Add tags",
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
                  innerHTML_:"delete record",
                  export_:"deleteRecordButton",
                },
              ]
            }
          ]
        }]
      }
    }
    this.singleCardStructure=singleCard;

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
                   tagname_:"article",
                   class:"message is-hidden",
                   childrens_:[{
                    class:"message-body",
                    export_:"search_box_message_board",
                   }]
                  },
                  {
                    tagname_:"label",
                    class:"label",
                    innerHTML_:"press enter in the search box to search.",
                  },
                  {
                    tagname_:"input",
                    class:"input",
                    event_:{"focus":this.on_search_box_focus},
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
              },
              {
                class:"content",
                style:"text-align:center;",
                childrens_:[{
                  tagname_:"button",
                  class:"button is-danger is-light",
                  innerHTML_:"clear all cards",
                  event_:{"click":this.on_clear_all_cards_click.bind(this)},
                }]
              },
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