const {mysql_obj} = require('./mysql_class.js');
const {mysql_obj_not_sync} = require('./mysql_class_not_sync.js');
//====================================================================
async function add_record(data,callback)
{
//  
  let stepPreparingData ={
    user: data.username,
    action : "add_record",
    content : JSON.stringify(data.data),
  }
  let steps_feedback = await mysql_obj.insert([stepPreparingData],"cantonese_dictionary_steps_data");

  let masterPreparingData = {
    english:data.data['english'],
    chinese:data.data['chinese'],
    json_data:JSON.stringify(data.data),
  };
  let master_feedback = await mysql_obj.insert([masterPreparingData],"cantonese_dictionary_master_data");
  callback(master_feedback.affectedRows+steps_feedback.affectedRows);
}



async function read_record(cb)
{
  let lastest = 'SELECT * FROM `cantonese_dictionary_master_data` ORDER BY timestamp DESC LIMIT 10';
  let sql = `select * from \`cantonese_dictionary_master_data\` where 1`;
  let result = await mysql_obj.get_all(sql);
  cb(result);

}
///////////////////////////////////////////////////////////////
module.exports = { 
  add_record,
  read_record,
};
