//config:
var config = {
    channels: ["#cscofc", "#micoleTest"],
    server: "irc.freenode.net",
    botName: "Bukkets_Baby"
};

var RegUrl = new RegExp("(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})");

//lib
var irc = require("irc");
var http = require("follow-redirects").http;

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
    if(RegUrl.test(message)){
        var url = message.match(RegUrl)[0];

        http.get(url, function(result){
            var responseParts = '';
            result.on('data', function(chunk){
                responseParts += chunk;
                //bot.say(to, chunk);
            });
            result.on('end', function(){
                console.log(responseParts);
                bot.say(to, responseParts.substring(responseParts.toLowerCase().lastIndexOf("<title>")+7, responseParts.toLowerCase().lastIndexOf("</title>")));
            });
        });

        //var req = http.request({method: 'HEAD', host: url, port: 80}, function(res) {
        //    bot.say(to, JSON.stringify(res.headers));
        //});
        //req.end();

        //bot.say(to, url);
        //bot.say(to, "found URL");
    }
});

bot.addListener('error', function(message) {
    console.log('error: ', message);
});


function cleanTitle(title){
    title = title.substring(title.toLowerCase().lastIndexOf("<title>") + 7,
                            title.toLowerCase().lastIndexOf("</title>"));
    title = title.replace(/(\r\n|\n|\r)/gm,"");
    title = title.replace("'", "\'");
}