const path = require("path");
const logs = require("./debug-and-logs");
/*//////////////////////////////////
// const default_header = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Credentials": "true",
//   "Access-Control-Allow-Headers": "content-type,XFILENAME,XFILECATEGORY,XFILESIZE,token",
//   'Content-Type': 'application/json; charset=UTF-8',
//   'Access-Control-Allow-Methods': "POST",
//   "Access-Control-Max-Age": "2592000",
// }
/*//////////////////////////////////
const routes = {};
const routing = {};
routing.use = (raw_path, callback, base = routes) => {
  base[ raw_path ] = { branch : {}, process : [], files : [] };
  callback({
    use : ( s_path, s_cb )=>{ 
      routing.use(s_path, s_cb, base[ raw_path ].branch);
    },
    process : ( method, p_path, cb ) => {
      base[raw_path].process.push([method.toUpperCase(), p_path, cb]);
    },
    serveFile : (uf_path, file_path) => { 
      base[raw_path].process.push(["file", uf_path, file_path]);
    }
  })
}
// routes.
function onRequest(req, res) {
  let session = preprocess_res(preprocess_req({ req, res }));//prepare session
  try {
    const {sub_url, callback} = path_finder(req.url, routes, undefined);
    for(let [method, path_from_control, handler] of callback){
      if(method === "file"){//lower case for servefile
        call_file_server(`${handler}${url_filtering(sub_url)}`)
        return;// end with first match
      }
      else if(method === req.method){
        const wildcard_path = path_from_control.split(":");
        let raw_path = wildcard_path.shift();
        if(raw_path.endsWith('/')) raw_path = raw_path.slice(0, raw_path.length-1);
        let re = new RegExp(`^${raw_path}`);
        if(sub_url.match(re) !== null){
          session.params = () => proc_params(sub_url.replace(re, "").split("/", 10), wildcard_path);
          session.queries = () => proc_queries(sub_url.split("?"));
          ///////////////////////////////////////////////////////
          call_controller( handler );
          return;// end with first match
        }
      }
    }
    if(routes['*'] !== undefined) call_controller(routes['*'].process[0][2]);//root *
    
  } catch (error) {
    on_end_without_send(session, error);
  }
//////////////////////////////////////////////////////////////////
  function call_controller(func){
    if (func) func(session);
    if (!session.isSent) throw `session controller ended without send`;
  }
  function call_file_server(file_path){
    const file_content = read_static_files(file_path);
    if(file_content !== false){
      session.sendFile(file_content);
      return true;
    }
    return false;
  }
  function path_finder(path_, root , callback){
    for(let x in root){
      let re = new RegExp(`^${x}`);
      if(path_.match(re) !== null){
        let sub_url = path_.replace(re, "");
        sub_url = sub_url.charAt(0)==="/" ? sub_url : `/${sub_url}`;
        if(root[x].process !== undefined) callback = {sub_url, "callback" : root[x].process};
        return path_finder(sub_url,root[x].branch,callback);
      }
    }
    return {"sub_url":undefined,"callback":undefined,...callback};
  }
  function proc_params(from_url,from_control){///process params
    let ret = {};
    from_url = from_url.filter(el=>el!=="");
    from_control.forEach((el,idx)=>{ ret[el] = from_url[idx]; })
    return ret;
  };
  function proc_queries(from_url){///process queries
    const ret = {};
    if(from_url.length < 2) return {};
    from_url[1].split("&").map(el=>{
      let [query_key, query_val] = el.split("=");
      return ret[query_key] = query_val || undefined;
    });
    return ret;
  }
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
  session.req.url = session.req.url.replaceAll(/[/]{2,}/g,"/"); //preprocess  url
  session.steps = [{ mark: "on request", time: new Date().getTime() }];// lapse of time

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
function url_filtering(url)
{
  let filter = [
    [new RegExp(`\\.{2,}`),"."],
    [new RegExp(`\/{2,}`),"/"],
    [new RegExp(`[^a-zA-Z0-9-./_]`),""]
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
  onRequest, routing
}