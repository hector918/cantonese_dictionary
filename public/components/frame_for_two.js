import {cej,preload_image} from '../js/general.js';
class frame_for_two {


  structure() {
    return {
      class : "container is-fluid",
      
      childrens_ : [{
        class : "columns",
        childrens_ : [
          {
            class:"column is-6",
            export_ : "left_frame",
          },
          {
            export_ : "right_frame",
            class:"column is-6 is-primary",
          },
        ]
      }]
    };
  }
  constructor(parent) {
    this.parent = parent;
    //this.structure();
    parent.appendChild(cej(this.structure(),this)['self']);

    // this['login_form'].addEventListener("submit",this.on_submit);
    // this['on_username_button'].addEventListener("click",this.on_username_click);
    // this['on_verification_button'].addEventListener("click",this.on_verification_click);
    //this['passwordinput'];
    

  }

}

export {frame_for_two as frame_for_two}; 