process.env.NTBA_FIX_319 = 1;
const { date } = require('assert-plus');
const TelegramBot = require('node-telegram-bot-api');
// replace the value below with the Telegram token you receive from @BotFather
const token = '1949178318:AAGQDERtAnBxijzPd_TTXVqpG1gJmJXGoPI';
const crypto = require('crypto');

user_array = {};
// Matches "/echo [whatever]"

var bot = null;


//var rigs_config=null;
function connect_to_bot()
{
    
    bot = new TelegramBot(token, {polling: true});

    bot.onText(/\/reg (.+)/, (msg, match) => {
        // 'msg' is the received Message from Telegram
        // 'match' is the result of executing the regexp above on the text content
        // of the message

        const chatId = msg.chat.id;
        var resp = match[1]; // the captured "whatever"
        if(user_array[match[1]]!=undefined)
        {
            //
            resp = "name is taken";
        }
        else
        {
            //
            resp = match[1]+" successfully register";
            user_array[match[1]]={chatId:chatId,time_login:Date.now(),};
            console.log(user_array);
        }
        // send back the matched "whatever" to the chat
        bot.sendMessage(chatId, resp);
    });

    console.log("telegram bot running");
}


function makeid(length) {
    var result = '';
    //var characters='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var characters='0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) 
    {
        result += characters.charAt(Math.floor(Math.random()*charactersLength));
   }
   return result;
}

function sendkey_to_chat(username)
{
    
    let string_message = makeid(6);
    user_array[username]['key']=string_message;
    user_array[username]['md5']=
    bot.sendMessage(chatid,string_message);
}

module.exports = {
    sendkey_to_chat : sendkey_to_chat,
    connect_to_bot : connect_to_bot,
    user_array : user_array ,
}