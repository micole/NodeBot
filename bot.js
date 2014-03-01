//config:
var config = {
    channels: ["#cscofc", "#micoleTest"],
    server: "irc.freenode.net",
    botName: "Bukkets_Baby"
};

//lib
var irc = require("irc");

//bot
var bot = new irc.Client(config.server, config.botName, {
    channels: config.channels,
    port:6665,
    debug: true,
    autoRejoin: true
});

bot.addListener("message", function(from, to, message) {
    if(message.indexOf('Micoles_Bitch') > -1){
        bot.say(to, "Stop asking me questions, I'm not done yet...");
    }
    if(message.indexOf('!g') == 0){
        var sub = message.substring(2, message.length);
        sub = "https://www.google.com/search?q=" + encodeURIComponent(sub.trim());
        bot.say(to, sub);
    }
});

bot.addListener('error', function(message) {
    console.log('error: ', message);
});