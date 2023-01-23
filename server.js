const config = require('./config.js');
const {onRequest} = require('./router-v2.js');
require("./app");
const websocketApp = require(`./websocket-app`);

const http = require('http');
const https = require('https');
const fs = require('fs');
const ws = require('ws');

const options = {
  key: fs.readFileSync('./cert/key.pem'),
  cert: fs.readFileSync('./cert/cert.pem')
};
const multi_thread = config.mode === "single" ? 0 : 1;

const [http_on, https_on] = [true, true];
const [http_port, https_port] = [config.port, config.httpsport];
const hostname = config.hostname;
const [wss_on, wss_path] = [false, `/echo`];

function http_start(){
  let http_server = http.createServer(onRequest);
  http_server.listen(http_port, hostname, () => {
    console.log(`Http server running at http://${hostname}:${http_port}/`);
  });
  return http_server;
}
function https_start(){
  let https_server = https.createServer(options, onRequest);
  https_server.listen(https_port, hostname, () => {
    console.log(`Https server running at https://${hostname}:${https_port}/`);
  });
  return https_server;
}
function wss_start(web_server){
  const wss = new ws.Server({web_server, path:wss_path});
  websocketApp.wss_server_event_hanger(web_server);
  websocketApp.wss_socket_event_hanger(wss);
}
if (multi_thread === 0) {
  if (http_on) {
    http_start();
    // if (wss_on) {
    //   const wss = new ws.Server({http_server, path:wss_path});
    //   websocketApp.wss_server_event_hanger(http_server);
    //   websocketApp.wss_socket_event_hanger(wss);
    // }
  }
  if (https_on) {
    https_server = https_start();
    if (wss_on) { wss_start(https_server); }
  }
}
else if (multi_thread === 1) {
  var cluster = require('cluster');
  var numCPUs = require('os').cpus().length;
  if (cluster.isMaster) {
    console.log('[master] start master...');
    for (var i = 0; i < numCPUs; i++) { cluster.fork(); }
    cluster.on('listening', function (worker, address) {
      console.log(`[master] listening: worker${worker.id},pid:${worker.process.pid}, Address:${address.address}:${address.port}`);
    });

  } else if (cluster.isWorker) {
    console.log(`[worker] start worker ...${cluster.worker.id}`);
    if (http_on) {
      http_server = http_start();
      // if(wss_on){
      //   const wss = new ws.Server({http_server, path:wss_path});
      //   websocketApp.wss_server_event_hanger(http_server);
      //   websocketApp.wss_socket_event_hanger(wss);
      // }
    }
    if (https_on) {
      https_server = https_start();
      if(wss_on){ wss_start(https_server); }
    }
  }
}