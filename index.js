const config =  require('./config.js');
const router =  require('./router.js');
// const tg =  require('./telegram.js');
const http = require('http');
const https = require('https');
const fs = require('fs');
const options = {
	key: fs.readFileSync('key.pem'),
	cert: fs.readFileSync('cert.pem')
};

if(config.mode == "single")
{
    //http
    const server = http.createServer(router.OnRequest);
    server.listen(config.port, config.hostname, () => {
        console.log(`Server running at http://${config.hostname}:${config.port}/`);
    });
    //https
    const httpsserver = https.createServer(options,router.OnRequest);
    httpsserver.listen(config.httpsport, config.hostname, () => {
        console.log(`Server running at https://${config.hostname}:${config.httpsport}/`);
    });
}
else if(config.mode =="multi")
{
    var cluster = require('cluster');
    var numCPUs = require('os').cpus().length;
    if (cluster.isMaster) 
    {
        console.log('[master] ' + "start master...");
    
        for (var i = 0; i < numCPUs; i++) {
            cluster.fork();
        }
    
        cluster.on('listening', function (worker, address) 
        {
            console.log('[master] ' + 'listening: worker' + worker.id + ',pid:' + worker.process.pid + ', Address:' + address.address + ":" + address.port);
        });
    
    } else if (cluster.isWorker) 
    {
        console.log('[worker] ' + "start worker ..." + cluster.worker.id);
        var num = 0;
        //http
        http.createServer(router.OnRequest).listen(config.port,config.hostname, () => {
            console.log(`[worker] running at http://${config.hostname}:${config.port}/`);
        });
        //https
        const httpsserver = https.createServer(options,router.OnRequest);
        httpsserver.listen(config.httpsport, config.hostname, () => {
            console.log(`Server running at https://${config.hostname}:${config.httpsport}/`);
        });
    }
}
// tg.connect_to_bot();