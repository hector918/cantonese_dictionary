
const {mysql_obj} = require('./mysql_class.js');
//====================================================================
async function add_record(data,callback)
{
//  
  let stepPreparingData ={
    user: data.username,
    action : "add_record",
    content : JSON.stringify(data.data),
  }
  let steps_feedback =await mysql_obj.insert([stepPreparingData],"cantonese_dictionary_steps_data");

  let masterPreparingData = {
    english:data.data['english'],
    chinese:data.data['chinese'],
    json_data:JSON.stringify(data.data),
  };
  let master_feedback =await mysql_obj.insert([masterPreparingData],"cantonese_dictionary_master_data");
  callback(master_feedback.affectedRows+steps_feedback.affectedRows);
}


///////////////////////////////////////////////////////////////
module.exports = { 
  add_record,
};
