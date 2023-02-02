const path = require("path");
/*//////////////////////////////////
3.14
/*//////////////////////////////////
const routes = [];
function routing(path, callback) {
  routes.push([path, callback]);
  //example routes.push([`*`, (session)=>{session.send("this is 404")}]);
}
/*/push route above//////////////////////////////*//////////////////////////////////
const file_routes = [];
function serveFile(url, file_path, default_index, callback = undefined) {
  file_routes.push([url, file_path, default_index, callback]);
}
/*/file serving above///////////////////////////////
/*//////////////////////////////////
const logs = require("./debug-and-logs");
// const default_header = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Credentials": "true",
//   "Access-Control-Allow-Headers": "content-type,XFILENAME,XFILECATEGORY,XFILESIZE,token",
//   'Content-Type': 'application/json; charset=UTF-8',
//   'Access-Control-Allow-Methods': "POST",
//   "Access-Control-Max-Age": "2592000",
// }
//////////////////////////////////////////////////////////////
function onRequest(req, res) {
  let session = preprocess_res(preprocess_req({ req, res }));//prepare session
  try {
    if (call_file_server()) return;//if file served then return
    //above are file serving/ below are api request////////////////
    let match_all;
    for (let [path, controller] of routes) {
      // onsole.log(path,session.req.url, session.req.url.split("/"));
      if (path === "*") {
        match_all = [path, controller];
        continue;
      }
      let re = path_regex_create(path);
      
      if (req.url.match(re) !== null) {
        session.req.url = req.url.replace(re, "");
        session.req.url = `${session.req.url[0] !== "/"?"/":""}${session.req.url}`;
        call_controller( controller );
        return;//only match once
      }
    }
    /////go */////////////////////////////////////////////
    if (match_all) call_controller(match_all[1]);
    //////////////////////////////////////////////////////
  } catch (error) {
    on_end_without_send(session, error);
  }
  ///////////////////////////////
  function call_file_server(){
    for(let [url,f_path,d_index,cb] of file_routes){
      let re = path_regex_create(url);
      if( session.req.url.match(re) !== null ){
        if(path.parse(session.req.url).ext !== "" ){//check url ask for
          let file_content = read_static_files(`${f_path}${url_filtering(session.req.url.replace(re,""))}`);
          if(file_content !== false){
            session.sendFile(file_content);
            return true;
          }
        }else if(d_index?.length > 0 && session.req.url === "/"){//check default etc index.html
          for(let file_name of d_index){
            let file_content = read_static_files(`${f_path}/${file_name}`);
            if(file_content !== false){
              session.sendFile(file_content);
              return true;
            }
          }
        }
      }
    }
    return false;
  }
  function call_controller(func) {
    func(session);
    if (!session.isSent) throw `session controller end without send`;
  }
  ///////////////////////////////
}
/////preprocess/////////////////////////////////////////////////
function preprocess_req(session) {
  /*
    field add 
    req.body if method = post
  */
  ///process body
  if (session.req.method === 'POST') {
    let body = '';
    session.req.on('data', function (data) { body += data; });
    session.req.on('end', function () { session.req.body = body; });
  }
  
  session.req.originalURL = session.req.url;
  session.req.url = session.req.url.replaceAll(/[/]{2,}/g,"/"); //preprocess url
  session.steps = [{ mark: "on request", time: new Date().getTime() }];// lapse of time
  //handling request method/////////////////////////////////////////////
  if(!["POST","GET","PUT","DELETE","OPTION"].includes(session.req.method)){
    session.error({error:`unrecognized method ${session.req.method}`});
  }
  session[session.req.method.toLowerCase()] = ( path , callback ) => {
    const parameter_path = path.split(":");
    const raw_path = parameter_path.shift();
    if (raw_path === "*" || session.req.url.match(path_regex_create(raw_path)) !== null) {
      try {
        ///////////////////////////////////////////////
        session["params"] = function (){///process params
          let ret = {};
          const tmp = session.req.url.replace(raw_path,"").split("/");
          parameter_path.forEach((el,idx)=>{
            ret[el.replaceAll('/',"")] = tmp[idx] || undefined;
          });
          return ret;
        }();
        session['queries'] = function (){//process query
          const ret = {};
          const tmp = session.req.url.split("?");
          if(tmp.length < 2) return {};
          tmp[1].split("&").map(el=>{
            let eq = el.split("=");
            return ret[eq[0]]= eq[1] || undefined;
          });
          return ret;
        }();
        ///////////////////////////////////////////////
        callback(session);
      } catch (error) {
        on_error(error);
      }
    }
  }
  return session;
}
function preprocess_res(session) {
  session.res.error = (error) => { 
    on_error(error);
    session.isSent = true;
  };
  session.isSent = false;
  session.code = (code) => {
    session.res.statusCode = code;
    return session;
  }
  session.send = (data) => {
    logs.request_log_to_file(session);//log
    if (!session.isSent) session.res.end(data);
    session.isSent = true;
  };
  session.sendFile = (content) =>{
    session.res.on("finish",()=>{ logs.request_file_log_to_file(session, content.path); });//delay log
    session.res.setHeader('Content-Type', content.header);
    if( !session.isSent ) content.pipe(session.res);
    session.isSent = true;
  }
  return session;
}

////utility/////////////////////////////////////////////////////////
function read_static_files(filename) {
  const fs = require('fs');
  try {
    let header = file_extension()[path.parse(filename).ext];
    if (fs.existsSync(filename) && header) {//if file exists and vaild file extension//
      return Object.assign(fs.createReadStream(filename),{header});
    }
    return false;
  } catch(error) {
    on_error({error,filename});
    return false;
  }
  function file_extension() {
    return {
      ".css": "text/css",
      ".gif": "image/gif",
      ".html": "text/html",
      ".ico": "image/x-icon",
      ".jpeg": "image/jpeg",
      ".jpg": "image/jpeg",
      ".js": "text/javascript",
      ".json": "application/json",
      ".pdf": "application/pdf",
      ".png": "image/png",
      ".svg": "image/svg+xml",
      ".swf": "application/x-shockwave-flash",
      ".tiff": "image/tiff",
      ".txt": "text/plain",
      ".wav": "audio/x-wav",
      ".wma": "audio/x-ms-wma",
      ".wmv": "video/x-ms-wmv",
      ".xml": "text/xml",
      ".ttf": "font/ttf",
      ".woff": "font/woff",
      ".woff2": "font/woff2",
      ".mp4": "video/x-ms-mp4",
    };
  }
}
function path_regex_create(path) {
  // let re = new RegExp(`^${path}|^${path}$`); // re为^/asda/|/asda$
  return new RegExp(`^${path}|^${path}$`);
}
function url_filtering(url)
{
  let filter = [
    [new RegExp(`\\.{2,}`),"."],
    [new RegExp(`\/{2,}`),"/"],
    [new RegExp(`[^a-zA-Z0-9-./]`),""]
  ];
  for(let [reg, replacement] of filter) url = url.replace( reg , replacement );
  return url;
}
/////event/////////////////////////////////////////////////
function on_end_without_send(session, error) {
  console.error(error);
  session.code(500).send("server error");
}
function on_error(error) {
  logs.log_error(error);
}
//////////////////////////////////////////////////////
module.exports = {
  onRequest, routing, serveFile
}