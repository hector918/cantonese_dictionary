const fs = require('fs');
const util = require('util');
const path = require('path'); 

const config =  require('./config.js');

function consoletofile(any)
{
    console.log(any);
    //const myConsole = new console.Console(fs.createWriteStream('./output.txt'));
    //myConsole.log(any);
}

function debug_to_file(content)
{
    let d = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '').split(" ");
	let fn ="logs/" + d[0]+"file_access_log.txt";
	fs.writeFile(fn,d[1]+util.inspect(content)+"\r\n", {'flag':'a'},function(err)
    {
        if(err){
            console.log(err);
        }
    });
}

function url_filtering(url)
{
    let keyword = [".."];
    for(let x in keyword)
    {
        url = url.replace(keyword[x],"");
    }
    return url;
}

function read_static_files(filename,par)
{
    function CT(ext)
    {
        let CT = {
            "css": "text/css",
            "gif": "image/gif",
            "html": "text/html",
            "ico": "image/x-icon",
            "jpeg": "image/jpeg",
            "jpg": "image/jpeg",
            "js": "text/javascript",
            "json": "application/json",
            "pdf": "application/pdf",
            "png": "image/png",
            "svg": "image/svg+xml",
            "swf": "application/x-shockwave-flash",
            "tiff": "image/tiff",
            "txt": "text/plain",
            "wav": "audio/x-wav",
            "wma": "audio/x-ms-wma",
            "wmv": "video/x-ms-wmv",
            "xml": "text/xml",
            "ttf": "font/ttf",
            "woff": "font/woff",
            "woff2": "font/woff2",
            "mp4": "video/x-ms-mp4",
        };
        if(CT[ext]==undefined)
        {
            return "unknown";
        }
        else
        {
            return CT[ext];
        }
    }    
    
	try
	{

        let abs_path = path.resolve(__dirname,"./public", filename.replace("/",""));
        if(!fs.existsSync(abs_path))
        {
            //file not exist
            par.Respond.statusCode=404;
			par.Respond.end("404 File not found");
        }
        else if(fs.lstatSync(abs_path).isDirectory())
        {
            //directory
            par.Respond.statusCode=404;
			par.Respond.end("404 File not found");
        }
        else if(CT(path.extname(filename).replace(".",""))=="unknown")
        {
            //uncertified type
            par.Respond.statusCode=500;
			par.Respond.end("404 File not found");
        }
        
        else
        {
            fs.createReadStream(abs_path).pipe(par.Respond);
            /*/successed
            fs.stat(abs_path,(err, stats) => {
                if(err) {
                    throw err;
                }
                if((par.Request.headers['if-modified-since']!=undefined)&&(stats.mtime.toGMTString()==par.Request.headers['if-modified-since']))
                {
                    ////if 304
                
                    
                    par.Respond.statusCode=304;
                    //par.Respond.end();
                }
                else
                {
                    //if 200
                    // print file last modified date
                    //console.log(`File Data Last Modified: ${stats.mtime}`);
                    //console.log(`File Status Last Modified: ${stats.ctime}`);
                    par.Respond.setHeader('If-Modified-Since', stats.mtime.toGMTString());
                    par.Respond.setHeader('last-modified', stats.mtime.toGMTString());

                    //fs.createReadStream(abs_path).pipe(par.Respond);
        
                }
                
                
                
            });
            /*
                    { host: '140.238.126.231',
                'user-agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0',
                
                'accept-language':
                'zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2',
                'accept-encoding': 'gzip, deflate',
                connection: 'keep-alive',
                referer: 'http://140.238.126.231/',
                'if-modified-since': 'Wed, 04 Aug 2021 22:40:44 GMT',
                'cache-control': 'max-age=0' }

            */
            
            par.Respond.setHeader('Content-Type', CT(path.extname(filename).
            replace(".","")));
            
        }
        if(config.debug)
        {
            let remoteAddress = par.Respond.socket.remoteAddress||"unknow ip";
            if(remoteAddress==="unknow ip")
            {
                console.log(par.Respond.socket);
            }

            let content = `RF${remoteAddress}:${par.Request.socket.localPort}`+'['+Math.round((process.uptime()-par.on_request_time)*1000)+"ms]"+filename;

            debug_to_file(content);
            console.log(new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '').split(" ")[1]+content);

        }
	}
	catch(ex)
	{
        consoletofile(ex);
        par.Respond.statusCode = 500;
		par.Respond.end("500");
	}
}

module.exports = {
    ReadStaticFile:read_static_files,
    url_filtering
}