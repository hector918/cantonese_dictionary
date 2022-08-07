const config = require('./config.js');
const public_file_access = require('./public_file_access.js');

const fs = require('fs');
var util = require('util');
const { handle_GET } = require('./handling_get.js');

function debug_to_file(content) {
  //
  let fn = "logs/" + new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '').split(" ")[0] + "request_log.txt";
  let d = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '').split(" ");

  fs.writeFile(fn, d[1] + util.inspect(content) + "\r\n", { 'flag': 'a' }, function (err) {
    if (err) {
      console.log(err);
    }
  });

}

function OnRequest(req, res) {
  var par_ = {
    callback: null,
    "debug_footprint": [],
    on_request_time: process.uptime(),
    ResContent:
    {

      'Content-Type': 'text/html',
      'status_code': 200,
      'content': {},

    },
    postBody: [],
    errors: [],
    station: {

    },
    Request: req,
    Respond: res,

  }
  if (config.debug) {//debug
    par_.debug_footprint.push({
      func_name: "onrequest",
      time_record: process.uptime() - par_.on_request_time,
    })
  }

  try {
    switch (req.method) {
      case "OPTIONS":
        //如果是带有session并是options就直接返回 
        par_.status_code = 200;
        general_function.ResWrite(par_);
        break;
      case "POST":

        //如果 有post
        //par_.callback=process_post;
        const hp = require('./handling_post.js');
        hp.handle_POST(par_);
        break;
      default:
        //file access //including get

        var url_parts = public_file_access.url_filtering(par_.Request.url);
        switch (url_parts) {
          case (url_parts.match(/(?:js|css|img|png|webfont|ttf|svg|woff|html|htm|woff2)$/) || {}).input: case "/favicon.ico":
            public_file_access.ReadStaticFile(url_parts, par_);
            break;
          case (url_parts.match(/^\/api\//) || {}).input:
            //handling get, must contains "/api/" within url
            handle_GET(par_);
            break;
          case "/bb":
            public_file_access.ReadStaticFile("/hz.html", par_);
            break;
          default:
            public_file_access.ReadStaticFile("/index.html", par_);
            break;
        }
        break;
    }
  } catch (error) {
    console.log(error);
    debug_to_file(error);
  }
}
function api_direct_end(par) {

  if (config.debug) {

    //调试用途
    console.log(par.Request.method + " ws=" + (typeof (par.SessionDoc)) + ' [ ' + Math.round((process.uptime() - par.on_request_time) * 1000) + "ms ]" + ' ' + par.Request.url);
    console.log(par.debug_footprint);
    //print_usage();
    //console.log(token)
  }

  //ends
  par = null;
}

function api_res_end(par) {
  var par_ = debug_step_log(par, "api_res_end");

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
    console.log(par.Request.method + " " + status_code + " ws=" + (typeof (par_.SessionDoc)) + ' ' + par.Request.connection.remoteAddress + ' [' + Math.round((process.uptime() - par.on_request_time) * 1000) + "ms]" + ' ' + par.Request.url);
    console.log(par.debug_footprint);
    //print_usage();
    //console.log(token)
  }
  for (let x in header_json) {
    par.Respond.setHeader(x, header_json[x]);
  }
  par.Respond.end(JSON.stringify(content));
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

  OnRequest,
  api_res_end,
  api_direct_end,
}