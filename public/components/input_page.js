import {cej,appendCSS,getElBy,raw_post} from '../js/general.js';
class input_page {
  on_save_click(evt)
  {
    let uploadData = {
      username : "hector",
      data : {},
      action:"addrecord",
    };
    let inputs = getElBy(this.self,"input");
    for(let x of inputs)
    {
      uploadData.data[x['name']]=x.value;
      
    }
    raw_post(uploadData,"api/v1",(text)=>{console.log(text)});
    // console.log(uploadData)
  }

  on_username_click(evt)
  {
    // //
    // console.log(evt)
    // try {

    //   let form = {action : "login",username:"11"};

    //   //var ciphertext = CryptoJS.AES.encrypt(JSON.stringify(form), 'secret key 123').toString();

    //   raw_post(form,"/api/v1/");
    // } catch (error) {
    //   console.log(error)
    // }
  }

  on_verification_click(evt)
  {
    // try {
    //   let source_string = this['usernameinput'].value + this['passwordinput'].value;
    //   let hash = CryptoJS.SHA3(source_string);
    //   page_var.hashkey = hash;

    //   let form = {action : "verification"};

    //   //var ciphertext = CryptoJS.AES.encrypt(JSON.stringify(form), 'secret key 123').toString();

    //   raw_post(form,"/api/v1/");
    // } catch (error) {
    //   console.log(error)
    // }

    // this['on_verification_button'].addEventListener("click",this.on_verification_click);
      
  }

  on_add_card_click(e){
    let fakehost = {};
    //create the el on fakehost, to pass the card obj to save button
    let singleCard = cej(this['singleCardStructure'](),fakehost);

    this['cardContainer'].insertBefore(singleCard.self,this['cardContainer'].childNodes[1]);
    
    //bind the save button with the card
    fakehost['saveButton'].addEventListener("click",this.on_save_click.bind(singleCard),true);

    getElBy(singleCard.self,"input")[0].focus();
  }
  structure() {
    let inputField =(label)=>{
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

    let singleCard = ()=>{
      return {
        class:"column",
        childrens_:
        [{
          class:"card hover-hack-singlecard",
          childrens_:[
            {
              tagname_:"header",
              class:"card-image",
              childrens_:[{
                tagname_:"p",
                class:"card-header-title",
                innerHTML_:"Add record"
              }]
            },
            {
              class:"card-content",
              childrens_:[{
                class:"content",
                childrens_:[
                  inputField("english"),
                  inputField("chinese"),
                  inputField("phonics"),
                  inputField("chinese sentence example"),
                  inputField("english sentence example"),
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
                {
                  tagname_:"a",
                  class:"card-footer-item",
                  innerHTML_:"edit"
                },
                {
                  tagname_:"a",
                  class:"card-footer-item",
                  innerHTML_:"delete"
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
          event_:{"click":this.on_add_card_click.bind(this)},
          childrens_:
          [{
            class:"card-content",
            childrens_:
            [{
              class:"content",
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
            }]
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