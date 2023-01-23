const { serveFile } = require('../router-v2.js');

serveFile('/',`${__dirname}/public`,["index.html"]);

function root_app(root){
  root.send("this is root");
}
  
module.exports = root_app;
  