//TODO: !d = definition
//TODO: !u = urban dictionary def.

//config:
var config = {
    channels: [ "#cscofc", "#micoleTest"],
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
var urban = require("urban");
var botconfig = require('./config');

//This seems to be horrible and unreliable
var chsForecast = new forecast({
    service: 'forcast.io',
    key: botconfig.keys["forecast"],
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

    if(message.indexOf('!u') == 0){
        word = urban(message.substring(2, message.length).trim());
        word.first(function(json){
            bot.say(to, json);
        });
    }

    if(message.indexOf('!w') == 0){
        //TODO: Add "hell" as a location
        //var sub = message.split(" ");
        sub = message.split(" ");
        location = sub.splice(1, sub.length);
        locationJoined = location.join();
        url = "https://maps.googleapis.com/maps/api/geocode/json?address=" + encodeURI(location) + "&sensor=false&key=" + botconfig.keys["geocode"];
        request({
            uri: url,
            timeout: 2000
        }, function(error, response, body){
            if(error){
                bot.say(to, "Couldn't find location, check error logs");
                console.log(error);
            } else {
                console.log(body);
                weatherJson = JSON.parse(body);
                if(weatherJson.status.indexOf("ZERO_RESULTS") >= 0){
                    bot.say(to, "Something went wrong, couldn't find location...");
                } else {
                    chsForecast.get([weatherJson.results[0].geometry.location.lat, weatherJson.results[0].geometry.location.lng], function(err, weather) {
                        if(err){
                            console.log("ERROR");
                            console.log(err);
                        } else {
                            console.log(weather);
                            //var jsonWeather = JSON.parse(weather);

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
                            bot.say(to, weatherJson.results[0].formatted_address + ": " + weatherString);
                        }
                    });
                }
            }
        });
    }



    if(validUrl.test(message)){
        var url = message.match(validUrl)[0];
        //fix imgur images
        if(url.indexOf(".gif") >= 0){
            url = url.substring(0, url.indexOf(".gif"));
        }
        if(url.indexOf(".jpg") >= 0){
            url = url.substring(0, url.indexOf(".jpg"));
        }


        //TODO: maximum stack size exceeds during imgur gif's
        request({
            uri: url,
            timeout: 2000,
            headers: {
                'Accept': 'text/plain'
            }
        }, function(error, response, body){
            console.log(error);
            console.log(response);
            if(error && error.code.toString().indexOf("ENOTFOUND") >= 0){
                bot.say(to, url + " Doesn't seem to exist");
            } else if(error) {
                boy.say(to, "error");
            } else {
                var $ = cheerio.load(body);
                title = $('title').text().replace(/(\r\n|\n|\r)/gm,"");
                bot.say(to, title);
            }
        });

        
    }
});

bot.addListener('error', function(message) {
    console.log('error: ', message);
});


