const { serveFile } = require('../router-v2.js');

serveFile('/',`${__dirname}/public`,["index.html"]);

function root_app(root){
  root.get("/egg",(cd)=>{
    cd.send("this is root egg");
  });
  root.get("*",(cd)=>{
    cd.send("this is root 404");
  });
  
}
  
module.exports = root_app;
  