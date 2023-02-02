const {routing} = require('./router-v3.js');

// serveFile('/root',"./public/assets/");

routing.use(`/abcd`, require(`./cantonese-dictionary-vanilla-app/cd-controller.js`));
routing.use(`/`, require(`./root-app/controller.js`));

routing.use(`*`, (all)=>{all.process('get','*',(session)=>{session.code(404).send("404")})});
