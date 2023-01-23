const {routing,serveFile} = require('./router-v2.js');

// serveFile('/root',"./public/assets/");

routing(`/cd`, require(`./cantonese-dictionary-vanilla-app/cd-controller.js`));
routing(`/`, require(`./root-app/controller.js`));
routing(`*`, (session)=>{session.send("this is 404")});
