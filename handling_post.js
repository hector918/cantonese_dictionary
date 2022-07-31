const fs = require('fs');
const util = require('util');
const CryptoJS = require("crypto-js");
const db_action =  require('./db_action.js');
const config =  require('./config.js');
// const tg =  require('./telegram.js');
function debug_to_file(content)
{
  let d = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '').split(" ");
	let fn ="logs/" + d[0]+"post_handling_log.txt";
	fs.writeFile(fn,d[1]+util.inspect(content)+"\r\n", {'flag':'a'},function(err)
  {
    if(err){
      console.log(err);
    }
  });
}

function debug_step_log(par,step)
{
    //
  if(config.debug)
  {
    par.debug_footprint.push({
			
      uptime : Math.round((process.uptime()  - par.on_request_time)*1000)+"ms" ,
      path : step,
		})
  }
  return par;
}
async function handle_POST(par)
{
	var par_=debug_step_log(par,"handle_POST");
  let json;
  //v2
  try {
    const buffers = [];
    
    for await(const chunk of par.Request) {
      buffers.push(chunk);
    }
    const data = Buffer.concat(buffers).toString();
    json = JSON.parse(data);
  
    
    
  } catch (error) {

    par_.postBody = "";
    console.log("handle post ", error)
    par_.ResContent.status_code = 500;
    api_res_end(par_);
    return;
  }

  try {

    let keypair = await db_action.read_user_keypair(json['username']);
    if(keypair[json['username']]===undefined)
    {
      throw `username ${json['username']} cant be found.`;
    }

    par_['username'] = json['username'];
    par_['password'] = keypair[par_['username']];

    let bytes  = CryptoJS.AES.decrypt(json['at'], keypair[json['username']]);

    par_.postBody = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    
    
  } catch (error) {
    par_.postBody = "";
    console.log("Crypto error ",error)
    par_.ResContent.status_code = 200;
    par_.ResContent.content.result = "wrong encryption";
    par_.ResContent.content.errors="wrong encryption";
    api_res_end(par_);
    return;
  }
    

  

  process_post(par_);
  //in gerenal callback will be null
  if(par.callback)
  {
    par.callback( par_);
  }

}
function process_post(par)
{
	//
	switch(par.postBody.action)
	{
    
    case "addrecord":
      //
      
      db_action.add_record(par.postBody,(result)=>{
        par.ResContent={
          content:{
            result:result,
            content:`${result} Row affected`,
            action:par.postBody.action
          },
          status_code:200
        };
        api_res_end(par,true);
      });
    break;

		default:
			console.log("unhandle post-"+par.Request.url);

			process_error_and_response(par);
		break;	
	}
	
}
function process_error_and_response(par)
{
  try {
    var par_=debug_step_log(par,"process_error_and_response");

    par_.ResContent['status_code']=500;
    
    par.ResContent.content.result = "failed";
    par.ResContent.content.errors=par_.errors;
    api_res_end(par_);    
  } catch (error) {
    console.log(error)
  }
    
    
}
function api_direct_end(par)
{
  
  if(config.debug)
  {
    
    //调试用途
    debug_to_file(par.Request.method+" ws="+(typeof(par.SessionDoc))+' [ '+Math.round((process.uptime()-par.on_request_time)*1000)+"ms ]"+' '+par.Request.url);
    debug_to_file(par.debug_footprint);
    print_usage();
    //console.log(token)
  }

  //ends
  par = null;
}

function api_res_end(par,ifcipher=false)
{
  //var par_ = debug_step_log(par,"api_res_end");
  
  //所有返回客户端信息从此处集合发出
  
  var status_code = 404;

  var header_json = {
    //下面头部都是必要
    "Access-Control-Allow-Origin":config.CORS_origin,
    "Access-Control-Allow-Credentials" : "true",
    "Access-Control-Allow-Headers": "content-type,XFILENAME,XFILECATEGORY,XFILESIZE,token",
    'Content-Type' :'application/json; charset=UTF-8',
    'Access-Control-Allow-Methods':"POST",
    "Access-Control-Max-Age": "2592000",
  };
  
  var content = {};
  
  for(var x in par.ResContent)
  {
    switch(x)
    {
      case "status_code":
        status_code = par.ResContent[x];
      break;
      
      case 'Content-Type':
      break;

      case 'Set-Cookie':
        if(par.ResContent[x].length>0)
        {
            header_json["Set-Cookie"] = [par.ResContent[x].trim()];
        }
      break;
      
      case "content":
        content = par.ResContent[x];
      break;
    }
  }
  switch(status_code)
  {
      case "200":
          par.Respond.statusCode=200;
      break;
      default :
          par.Respond.statusCode=status_code;
      break;
  }
  if(config.debug)
  {
      
      //调试用途
      debug_to_file(par.Request.method+" "+status_code+" ws="+(typeof(par.SessionDoc))+' '+par.Request.connection.remoteAddress+' ['+Math.round((process.uptime()-par.on_request_time)*1000)+"ms]"+' '+par.Request.url);
      debug_to_file(par.debug_footprint);
      //print_usage();
      //console.log(token)
  }
  for(let x in header_json){ 
      par.Respond.setHeader( x, header_json[x] ); 
  }
  if(ifcipher)
  {
    console.log(par['password'])
    var ciphertext = CryptoJS.AES.encrypt(JSON.stringify(content), par['password']).toString();
  
    par.Respond.end(ciphertext);
  }
  else
  {  
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
  handle_POST
}