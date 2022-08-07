const {mysql_obj,promise_mysql_pool,search_key_in_deep_obj:skido} = require('./mysql_pool_class.js');
// const {mysql_obj_not_sync} = require('./mysql_class_not_sync.js');
//====================================================================
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
async function add_record(data,callback)
{
  //  
  //clean the data for sql injection
  data = filterOf_str_json(data);

  let stepPreparingData ={
    user: data.username,
    action : "add_record",
    content : JSON.stringify(data.data),
  }
  let steps_feedback = await promise_mysql_pool.insert([stepPreparingData],"cantonese_dictionary_steps_data");

  let masterPreparingData = {
    english:data.data['english'],
    chinese:data.data['chinese'],
    tags:JSON.stringify(data.data['tags']),
    json_data:JSON.stringify(data.data),
  };
  let master_feedback = null;

  if(typeof data['data']["dbId"]!=="number")
  {
    //insert
    master_feedback = await promise_mysql_pool.insert([masterPreparingData],"cantonese_dictionary_master_data");
  }
  else
  {
    //update
    master_feedback = await promise_mysql_pool.update(masterPreparingData,"cantonese_dictionary_master_data",`\`index\`="${data['data']["dbId"]}"`);
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


async function read_record(cb)
{
  // let lastest = 'SELECT * FROM `cantonese_dictionary_master_data` ORDER BY timestamp DESC LIMIT 10';
  let sql = `select * from \`cantonese_dictionary_master_data\` where 1`;
  mysql_obj.get_all(sql,cb);
}
///////////////////////////////////////////////////////////////
module.exports = { 
  add_record,
  read_record,
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