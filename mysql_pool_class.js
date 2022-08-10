const mysql = require('mysql2');
const config = require('./config');
const fs = require('fs');
const util = require('util');
/////////////////////////////////////////////////////
async function mysql_log(content) {
  console.log(content);

  let d = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '').split(" ");
  let fn = "logs/" + d[0] + "mysql_log.txt";
  fs.writeFile(fn, d[1] + util.inspect(content) + "\r\n", { 'flag': 'a' }, function (err) {
    if (err) {
      console.log(err);
    }
  });

}

function search_key_in_deep_obj(obj, keyname) {
  for (let x in obj) {
    if (x === keyname) return obj[x];
    if (typeof obj[x] === "object") {
      let rst = search_key_in_deep_obj(obj[x], keyname);
      if (rst != false) return rst;
    }
  }
  return false;
}
// mysql_pool.insert = async(arr,table)=>{



// }

const mysql_pool = mysql.createPool(config.aws_mysql);
const promise_mysql_pool = mysql_pool.promise();

//insert update read delete
promise_mysql_pool.list_field = async function (table) {
  //
  let [result] = await this.query(`SELECT column_name FROM information_schema.columns WHERE table_name = '${table}'; `);
  if (result.length > 0) {
    let rst = {};
    for (let x of result) {
      rst[x['COLUMN_NAME']] = x['COLUMN_NAME'];
    }
    return rst;
  }
  else {
    return false;
  }
}
promise_mysql_pool.update = async function (json, table, where) {
  if (Object.keys(json).length === 0) return false;

  let val_arr = [];
  for (let x in json) val_arr.push(`\`${x}\`='${json[x]}'`);

  let sql = `UPDATE ${table} SET ${val_arr.join(",")} where ${where};`;

  let result;
  try {
    result = await this.query(sql);
    return result;
  } catch (error) {
    console.log("mysql update error", result, sql, error);
    mysql_log(error.toString());
    return false
  }
  //let field_arr = arr[0].filter(el)
}
promise_mysql_pool.insert = async function (arr, table) {
  if (arr.length === 0) return false;
  var fields = await this.list_field(table);
  if (!fields) return false;
  //生成field name
  let fields_arr = [];
  for (let y in arr[0]) {
    if (fields[y] != undefined) {
      fields_arr.push(y);
    }
  }

  //按field name 排列 val
  let val_arr = [];
  for (let x of arr) {
    let each_val = [];

    for (let y of fields_arr) {
      if (x[y] !== undefined) {
        each_val.push(x[y]);
      }
    }
    val_arr.push("'" + each_val.join("','") + "'");
  }
  let sql = `INSERT INTO ${table} (\`${fields_arr.join("`,`")}\`) VALUES (${val_arr.join("),(")});`;
  let result;
  try {
    result = await this.query(sql);
    return result;
  } catch (error) {
    console.log("mysql insert error", result, sql, error);
    mysql_log(error.toString());
    return []
  }

}
mysql_pool.delete = async function (where, table) {
  //
}
mysql_pool.get_all = async function (sql, callback) {
  //mysql_log()

  this.query(sql, callback);
}
//end of insert update read delete
///////////////////////////////////////////////////////////////
//error handlding
mysql_pool.handlding_error = (error) => {
  mysql_log(error.toString());
}
mysql_pool.getConnection((err, connection) => {
  if (err) {

    mysql_log("error on mysql pool connection " + err.code);

    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('Database connection was closed.')
    }
    if (err.code === 'ER_CON_COUNT_ERROR') {
      console.error('Database has too many connections.')
    }
    if (err.code === 'ECONNREFUSED') {
      console.error('Database connection was refused.')
    }
  }
  if (connection) connection.release()
  return
})

//export
module.exports = {
  mysql_obj: mysql_pool,
  promise_mysql_pool,
  search_key_in_deep_obj: search_key_in_deep_obj,
};