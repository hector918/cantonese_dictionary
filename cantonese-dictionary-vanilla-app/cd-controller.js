const {serveFile} = require('../router-v2.js');
serveFile('/cd',"./public/assets/");//base on router-v2's relative path

function cantonese_dictionary(cd){
  // console.log(url.parse(cd.req.url,true));
 
  // console.log(cd.req.url)
  cd.get("/api/:id/:pa01/:pa02",(cd)=>{
    console.log("in control",cd.params,cd.queries);
    cd.code(200).send("this is abcd under cd");
  });
  
  cd.get("/",(cd)=>{
    cd.send("this is cd root");
  });

}


module.exports = cantonese_dictionary;
