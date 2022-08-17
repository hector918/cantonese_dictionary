const {mysql_obj,promise_mysql_pool,search_key_in_deep_obj:skido} = require('./mysql_pool_class.js');
let lastest_time_stamp;
//=========================================================
function handle_error(error)
{
  console.log(error);
}
function getType(things)
{
  let result = typeof things;
  switch(result)
  {
    case "object":
      if (Array.isArray(things)) return 'array';
      return 'json';
    break;
    default:
      return result;
  }
}
function filterOf_str_json(content)
{
  let string_filter = /\`|\"|\\|\'|\;|\//g;
  let result = content;
  try {
    switch(getType(content))
    {
      case "json":
        result={};
        for(let x in content) result[filterOf_str_json(x)]=filterOf_str_json(content[x]);
      break;
      case "array":
        result=[];
        for(let x of content) result.push(filterOf_str_json(x));
        
      break;
      case "string":
        result = content.replace(string_filter,"");
      break;
    }
    return result;
  } catch (error) {
    console.log("error in string json filter ",error);
    return "";
  }  
}

async function read_record_result_process(error,result,field,callback){
  if(error)
  {
    handle_error(error);
    callback(error,result,field);
    return;
  }
  result = result.map(el=>{
    //save 
    // console.log(el,Date.parse(el.timestamp),el.timestamp)
    
    el['json_data']['dbId']=el['index'];
    return el['json_data'];
  });

  callback(error,result,field);
}
async function add_record(data,callback)
{
  //  
  //clean the data for sql injection
  data = filterOf_str_json(data);

  let stepPreparingData ={
    user: data.username,
    action : data['action']||undefined,
    content : JSON.stringify(data.data),
  }
  let steps_feedback = await promise_mysql_pool.insert([stepPreparingData],"cantonese_dictionary_steps_data");

  let recordIndex = data['data']["dbId"];
  delete data['data']["dbId"];

  let masterPreparingData = {
    english:data.data['english'],
    chinese:data.data['chinese'],
    tags:JSON.stringify(data.data['tags']),
    json_data:JSON.stringify(data.data),
  };
  let master_feedback = null;

  if(typeof recordIndex!=="number")
  {
    //insert
    master_feedback = await promise_mysql_pool.insert([masterPreparingData],"cantonese_dictionary_master_data");
  }
  else
  {
    //update
    
    master_feedback = await promise_mysql_pool.update(masterPreparingData,"cantonese_dictionary_master_data",`\`index\`="${recordIndex}"`);
    master_feedback['insertId']=recordIndex;
  }
  
  /* example of master feedback
    [
      ResultSetHeader {
        fieldCount: 0,
        affectedRows: 1,
        insertId: 15,
        info: '',
        serverStatus: 2,
        warningStatus: 0
      },
      undefined
    ]
  */
  let rst = { 
    steps_affectedRows:skido(steps_feedback,"affectedRows"),
    master_affectedRows:skido(master_feedback,"affectedRows"),
    master_insertId:skido(master_feedback,"insertId"),
  }

  callback(rst);

}

async function read_user_keypair(name)
{
  const [rows,fields] =  await promise_mysql_pool.query(`SELECT value FROM \`cantonese_dictionary_config\` where \`key\`="input_keypair" and JSON_EXTRACT(value, "$.${name}"); `);
  return rows[0]['value'];
}

async function read_lastest_record(cb){
  //
  let sql = `select * from \`cantonese_dictionary_master_data\` where \`deleted\`=0 order by \`timestamp\` desc limit 50; `;
  //example select * from `cantonese_dictionary_master_data` where `deleted`=0  and ( `chinese` IN ("通知","继续")  OR  `english` IN ("country","virus"))
  mysql_obj.get_all(sql,(error,result,field)=>{
    read_record_result_process(error,result,field,cb)}
  );
}

async function read_record(search_obj,cb)
{  
  //keyword not empty======================================
  let k_where = "";
  if(search_obj['keyword']) 
  {
    let [chn_where,eng_where] = [[],[]];
    let chn_regex = /[\u4e00-\u9fa5]/;
    for(let x of search_obj['keyword']){
      if(chn_regex.test(x))
      {//chn
        chn_where.push(`"${x}"`);
      }
      else
      {//eng
        eng_where.push(`"${x}"`);
      }
    }
    if(chn_where.length>0) k_where+=` \`chinese\` IN (${chn_where.join(",")})`;
    if(eng_where.length>0) k_where+=` ${chn_where.length>0?" OR ":""} \`english\` IN (${eng_where.join(",")})`;
    if(k_where!=="") k_where=" and ("+ k_where + ")";
  }
  //keyword not empty======================================
  
  //tags not empty========================================
  ///select * from `cantonese_dictionary_master_data` where `deleted`=0  and JSON_SEARCH(`tags`,'one','test');
  let t_where = "";
  if(search_obj['tags']){
    let tags_arr = [];
    search_obj['tags'].forEach(el=>{
      tags_arr.push(`JSON_SEARCH(\`tags\`,'one','${el}')`);
    })
    if(tags_arr.length>0) t_where=` (${tags_arr.join(" or ")})`;
  }
  //tags not empty==========================================

  //all empty==========================================
  let empty_where ="";
  if(k_where===""&&t_where===""){
    empty_where =" LIMIT 50";
  }
  //all empty==========================================
  if(t_where!=="")t_where=(k_where===""?"and ":"or ")+t_where;

  let sql = `select * from \`cantonese_dictionary_master_data\` where \`deleted\`=0 ${k_where} ${t_where} ${empty_where}`;
  //example select * from `cantonese_dictionary_master_data` where `deleted`=0  and ( `chinese` IN ("通知","继续")  OR  `english` IN ("country","virus"))
  mysql_obj.get_all(sql,(error,result,field)=>{
    read_record_result_process(error,result,field,cb)}
  );
}
async function delete_record(data,cb)
{
  //
  /* data example
  {
    username: 'hector',
    data: {
      dbId: 35,
      english: '111h222',
      chinese: '333344',
      phonics: '5354',
      'chinese sentence example': 'llll',
      'english sentence example': '',
      tags: { test: 'test', hector: 'hector' }
    },
    action: 'addrecord',
    random: 0.09290560557099958
  } 
  */
 try {
  let stepPreparingData ={
    user: data.username,
    action : data.action,
    content : JSON.stringify(data.data),
  }
  let steps_feedback = await promise_mysql_pool.insert([stepPreparingData],"cantonese_dictionary_steps_data");

  let recordIndex = data['data']["dbId"];
  delete data['data']["dbId"];


  let masterPreparingData = {
    deleted:1,
  };
  
  let master_feedback = await promise_mysql_pool.update(masterPreparingData,"cantonese_dictionary_master_data",`\`index\`="${recordIndex}"`);
  /* master_feedback example
  [
    ResultSetHeader {
      fieldCount: 0,
      affectedRows: 1,
      insertId: 0,
      info: 'Rows matched: 1  Changed: 1  Warnings: 0',
      serverStatus: 2,
      warningStatus: 0,
      changedRows: 1
    },
    undefined
  ]
  */
  let rst = { 
    steps_affectedRows:skido(steps_feedback,"affectedRows"),
    master_affectedRows:skido(master_feedback,"affectedRows"),
    master_insertId:recordIndex,
  }
  cb(rst);
 } catch (error) {
  cb({"error":error.toString()});
 }
  
}
///////////////////////////////////////////////////////////////
module.exports = { 
  add_record,
  read_record,
  read_lastest_record,
  delete_record,
  handle_error,
  read_user_keypair,
};

///mysql table stucture below
/*
CREATE TABLE `cantonese_dictionary_config` (
  `index` int NOT NULL,
  `key` varchar(20) NOT NULL,
  `value` json NOT NULL,
  `timestamp` timestamp NOT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `cantonese_dictionary_config` (`index`, `key`, `value`, `timestamp`) VALUES
(1, 'input_keypair', '{\"kim\": \"1234\"}', '2022-07-30 18:44:19');





CREATE TABLE `cantonese_dictionary_master_data` (
  `index` int NOT NULL,
  `english` varchar(100) NOT NULL,
  `chinese` varchar(100) NOT NULL,
  `json_data` json NOT NULL,
  `tags` json NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cantonese_dictionary_master_data`
--
ALTER TABLE `cantonese_dictionary_master_data`
  ADD PRIMARY KEY (`index`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `cantonese_dictionary_master_data`
--
ALTER TABLE `cantonese_dictionary_master_data`
  MODIFY `index` int NOT NULL AUTO_INCREMENT;



CREATE TABLE `cantonese_dictionary_steps_data` (
  `index` int NOT NULL,
  `user` varchar(50) NOT NULL,
  `action` varchar(10) NOT NULL,
  `content` json NOT NULL,
  `timestamp` timestamp NOT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cantonese_dictionary_steps_data`
--
ALTER TABLE `cantonese_dictionary_steps_data`
  ADD PRIMARY KEY (`index`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `cantonese_dictionary_steps_data`
--
ALTER TABLE `cantonese_dictionary_steps_data`
  MODIFY `index` int NOT NULL AUTO_INCREMENT;

CREATE TABLE `cantonese_dictionary_steps_data` (
  `index` int NOT NULL,
  `user` varchar(50) NOT NULL,
  `action` varchar(10) NOT NULL,
  `content` json NOT NULL,
  `timestamp` timestamp NOT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cantonese_dictionary_steps_data`
--
ALTER TABLE `cantonese_dictionary_steps_data`
  ADD PRIMARY KEY (`index`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `cantonese_dictionary_steps_data`
--
ALTER TABLE `cantonese_dictionary_steps_data`
  MODIFY `index` int NOT NULL AUTO_INCREMENT;



*/