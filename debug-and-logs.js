const fs = require('fs');
const expiration_limit = 10; //unit by day
const dir_name = `logs/`;
const _time = {
  c:"",
  get current(){
    return this.c;
  },
  set current(d){
    if(this.c!==d){
      remove_out_date_files();
      this.c = d;
      this.log.push(d);
    }
  },
  log:[]
}
const remove_out_date_files = () => {
  let current_time = new Date().getTime();
  fs.readdir(dir_name, (err, files) => {
    for(let file of files){
      let time_diff = (current_time - new Date(file.split("-",3).join("-")).getTime())/86400000;
      if( time_diff > expiration_limit ){
        fs.unlink(`${dir_name}${file}`,(err)=>{console.log(`${file} deleted`,err);});
      }
      else{
        return;
      }
    }
  });
}

const get_date = (d) =>{
  _time.current = d.toISOString().replace(/T/, ' ').replace(/\..+/, '').split(" ")[0];
  return _time.current;
}

const writeFile_error_ENOENT = (err)=>{
  if (err && err.code=="ENOENT") {
    fs.mkdir(`./${dir_name}`,()=>{});
    console.log(err);
    log_error(err);
  }
}
/////export below/////////////////////////////////////////////////////
function request_log_to_file(session){
  let d = new Date();
  let content = {
    date : d.toString(),
    method : session.req.method,
    lapse : d.getTime() - session.steps[0].time,
    ip : session.req.socket.remoteAddress,
    statusCode : session.res.statusCode,
    url : session.req.originalURL,
  }
  console.log(JSON.stringify(content));
  fs.writeFile(`${dir_name}${get_date(d)}-request_log.txt`, JSON.stringify(content) + ",\r\n", { 'flag': 'a' }, writeFile_error_ENOENT);
}

function request_file_log_to_file(session,file_path){
/**
 * ReadStream {
  fd: null,
  path: './/cd.drawio.png',
  flags: 'r',
  mode: 438,
  start: undefined,
  end: Infinity,
  pos: undefined,
  bytesRead: 0,
  closed: false,
 */
  let d = new Date();
  let content = {
    date : d.toString(),
    method : session.req.method,
    lapse : d.getTime() - session.steps[0].time,
    ip : session.req.socket.remoteAddress,
    statusCode : session.res.statusCode,
    url : session.req.originalURL,
    file_path,
  }
  console.log(JSON.stringify(content));
  fs.writeFile(`${dir_name}${get_date(d)}-request_file_log.txt`, JSON.stringify(content) + ",\r\n", { 'flag': 'a' }, writeFile_error_ENOENT);
}
function log_error(error){
  let d = new Date();
  console.error(error);
  fs.writeFile(`${dir_name}${get_date(d)}-error_log.txt`, JSON.stringify(error) + ",\r\n", { 'flag': 'a' }, function (err) {
    if (err && err.code=="ENOENT") fs.mkdir(`./${dir_name}`);
  });
}
/////////////////////////////////////////
module.exports = {
  request_log_to_file, log_error, request_file_log_to_file
}