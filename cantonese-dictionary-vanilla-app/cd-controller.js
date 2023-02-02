// const {serveFile} = require('../router-v3.js');
// serveFile('/cd',"./public/assets/");//base on router-v2's relative path

function cantonese_dictionary(cd){
  // cd.use("/api/:id",require(`../root-app/controller.js`));
  cd.process("get","/api/:id",(session)=>{
    // console.log(session.params(),session.queries())
    session.send("this is cd")
  });
  // cd.get("/api/:id/:pa01/:pa02",(cd)=>{
  //   console.log(cd.params,cd.queries);
  //   cd.code(200).send("this is abcd under cd");
  // });
  
  cd.process("get","/test/",(cd)=>{
    cd.send("this is cd root");
  });

  
  cd.serveFile("/",'./public/vanilla-js');
}


module.exports = cantonese_dictionary;
