const fs = require('fs'); const util = require('util');
// const CryptoJS = require("crypto-js");
const db_action = require('./db_action.js');
const search_js = require('./search_and_cache.js');

const config = require('./config.js');
function debug_to_file(content) {
  let d = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '').split(" ");
  let fn = "logs/" + d[0] + "get_handling_log.txt";
  fs.writeFile(fn, d[1] + util.inspect(content) + "\r\n", { 'flag': 'a' }, function (err) {
    if (err) {
      console.log(err);
    }
  });
}
function debug_step_log(par, step) {
  //
  if (config.debug) {
    par.debug_footprint.push({

      uptime: Math.round((process.uptime() - par.on_request_time) * 1000) + "ms",
      path: step,
    })
  }
  return par;
}
function handle_GET(par) {
  try {
    //preparation
    process_get(par);
    //api_res_end(par);
  } catch (error) {
    process_error_and_response(par);
  }

}
async function process_get(par) {
  //
  let questionMarkIndex = par.Request.url.indexOf("?");
  if (questionMarkIndex === -1) {
    questionMarkIndex = par.Request.url.length;
  }
  let prefix = par.Request.url.slice(0, questionMarkIndex).toLowerCase();

  
  switch (prefix) {
    case "/api/v1/readrecord":
      //perform base64 decode
      let url_parameter = par.Request.url.slice(questionMarkIndex + 1 + ("text=".length));

      url_parameter = decodeURIComponent(Buffer.from(url_parameter,"base64")).toString();

      
      search_js.search(url_parameter,(error, result, field) => {

        if (error != undefined) {
          db_action.handle_error(error);
        }
        if (!Array.isArray(result)) {
          console.log("db action result undefined -" + par.Request.url);
          process_error_and_response(par);
          return;
        }
        par.ResContent = {
          content: {
            result: result,
            content: `${result.length} Row affected`,
            action: par.postBody.action,
          },
          status_code: 200
        };

        if (config.debug) console.log(`${Math.round((process.uptime()-par.on_request_time)*1000)}ms Get ${prefix}: ${url_parameter}`);
        //send out response        
        api_res_end(par);
      })
      break;
    default:
      api_res_end(par);
  }

}
function process_error_and_response(par) {
  try {
    var par_ = debug_step_log(par, "process_error_and_response");

    par_.ResContent['status_code'] = 500;

    par.ResContent.content.result = "failed";
    par.ResContent.content.errors = par_.errors;
    api_res_end(par_);
  } catch (error) {
    console.log(error)
  }


}
function api_direct_end(par) {

  if (config.debug) {

    //调试用途
    debug_to_file(par.Request.method + " ws=" + (typeof (par.SessionDoc)) + ' [ ' + Math.round((process.uptime() - par.on_request_time) * 1000) + "ms ]" + ' ' + par.Request.url);
    debug_to_file(par.debug_footprint);
    print_usage();
    //console.log(token)
  }

  //ends
  par = null;
}

function api_res_end(par, ifcipher = false) {
  //var par_ = debug_step_log(par,"api_res_end");

  //所有返回客户端信息从此处集合发出

  var status_code = 404;

  var header_json = {
    //下面头部都是必要
    "Access-Control-Allow-Origin": config.CORS_origin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Headers": "content-type,XFILENAME,XFILECATEGORY,XFILESIZE,token",
    'Content-Type': 'application/json; charset=UTF-8',
    'Access-Control-Allow-Methods': "POST",
    "Access-Control-Max-Age": "2592000",
  };

  var content = {};

  for (var x in par.ResContent) {
    switch (x) {
      case "status_code":
        status_code = par.ResContent[x];
        break;

      case 'Content-Type':
        break;

      case 'Set-Cookie':
        if (par.ResContent[x].length > 0) {
          header_json["Set-Cookie"] = [par.ResContent[x].trim()];
        }
        break;

      case "content":
        content = par.ResContent[x];
        break;
    }
  }
  switch (status_code) {
    case "200":
      par.Respond.statusCode = 200;
      break;
    default:
      par.Respond.statusCode = status_code;
      break;
  }
  if (config.debug) {

    //调试用途
    debug_to_file(par.Request.method + " " + status_code + " ws=" + (typeof (par.SessionDoc)) + ' ' + par.Request.connection.remoteAddress + ' [' + Math.round((process.uptime() - par.on_request_time) * 1000) + "ms]" + ' ' + par.Request.url);
    debug_to_file(par.debug_footprint);
    //print_usage();
    //console.log(token)
  }
  for (let x in header_json) {
    par.Respond.setHeader(x, header_json[x]);
  }
  if (ifcipher) {
    var ciphertext = CryptoJS.AES.encrypt(JSON.stringify(content), config.keys["test"]).toString();

    par.Respond.end(ciphertext);
  }
  else {
    par.Respond.end(JSON.stringify(content));
  }

  //par.Respond.end(JSON.stringify(content));
  /*
  if(typeof(encrypt_key)==undefined)
  {
      
  }
  else
  {
      const aesjs = require("aes-js");
      const crypto = require("crypto");
      var key = crypto.createHash('sha256').update(encrypt_key).digest('array');
      var textBytes = aesjs.utils.utf8.toBytes(JSON.stringify(content));
      
      // The counter is optional, and if omitted will begin at 1
      var aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5));
      var encryptedBytes = aesCtr.encrypt(textBytes);
      
      // To print or store the binary data, you may convert it to hex
      var encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);
      par.Respond.end(encryptedHex);
  }
  */
  //ends
  par = null;
}
module.exports = {
  handle_GET
}