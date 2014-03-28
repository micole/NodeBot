//TODO: !d = definition
//TODO: !u = urban dictionary def.

//config:
var config = {
    channels: ["#cscofc", "#micoleTest"],
    server: "irc.freenode.net",
    botName: "Bukkets_Baby"
};

//var RegUrl = new RegExp("(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})");
var validUrl = /^(http|https):\/\/[^ "]+$/;
//lib
var irc = require("irc");
var http = require("follow-redirects").http;
var S = require("string");
var request = require("request");
var cheerio = require("cheerio");
var forecast = require("forecast");

//This seems to be horrible and unreliable
var chsForecast = new forecast({
    service: 'forcast.io',
    key: 'your key here',
    units: 'fahrenheit',
    cache: true,
    ttl: {
        minutes: 5,
        seconds: 0
    }
});

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

    if(message.indexOf('!w') == 0){
        var sub = message.split(" ");
        if(sub[1].toLowerCase() == "charleston"){
            chsForecast.get([32.7833, -79.9333], function(err, weather) {
                if(err){
                    console.log("ERROR");
                    console.log(err);
                } else {
                    console.log(weather);
                    //var jsonWeather = JSON.parse(weather);
                    if(sub[2] == null){
                        weatherString = "";
                        weatherString += "Hourly: " + weather.hourly.summary; //+ " ";
                        weatherString += " ---- Daily: " + weather.daily.summary;
                        /*for(i = 0; i < weather.data.length; i++){
                            //data.time given in seconds, need to convert to milliseconds
                            date = new Date(weather.data[i].time * 1000);
                            weatherString += "\nDATE:" + date.getMonth() + "/" + date.getDay();
                            weatherString += " WEATHER: Min Temp:" + weather.data[i].temperatureMin;
                            weatherString += " Max Temp:" + weather.data[i].temperatureMax;
                        }*/
                        bot.say(to, weatherString);
                    }
                    //console.log(weather);
                }
            });
        } else {
            bot.say(to, "I'm sorry, I don't have that location. Tell Micole to add that.");
        }
    }


    if(validUrl.test(message)){
        var url = message.match(validUrl)[0];
        //bot.say(to, "Fetching: " + url);


        //TODO: maximum stack size exceeds during imgur gif's
        request({
            uri: url,
            timeout: 2000
        }, function(error, response, body){
            console.log(error);
            console.log(response);
            if(error && error.code.toString().indexOf("ENOTFOUND") >= 0){
                bot.say(to, url + " Doesn't seem to exist");
            } else if(error) {
                boy.say(to, "error");
            } else {
                var $ = cheerio.load(body);
                bot.say(to, $('title').text());
            }
        });

        /*try{
            http.get(url, function(result){
                var responseParts = '';
                result.on('data', function(chunk){
                    responseParts += chunk;
                    if(responseParts.indexOf("</title>") >= 0){
                        result.destroy();
                    }
                });
                result.on('end', function(){
                    var $ = cheerio.load(responseParts);
                    bot.say(to, $('title').text());
                    console.log(responseParts);
                    title = cleanTitle(responseParts);
                    if(title){
                        bot.say(to, cleanTitle(responseParts));
                    } else {
                        bot.say(to, "Can't find title data.");
                    }

                });
            });
        } catch (e) {
            bot.say(to, from + ", Couldn't find Title Data");
        }*/


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
    //TODO: better title finder
    title = title.substring(title.toLowerCase().lastIndexOf("<title>") + 7,
                            title.toLowerCase().lastIndexOf("</title>"));
    title = title.replace(/(\r\n|\n|\r)/gm,"");
    title = title.replace("'", "\'");
    title = S(title).decodeHTMLEntities().s;
    title = title.replace(/^\s+|\s+$/g, '');
    return(title);
}