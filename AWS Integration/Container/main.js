function makeid(length) {
    var result = [];
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result.push(characters.charAt(Math.floor(Math.random() *
            charactersLength)));
    }
    return result.join('');
}

const data = require('./creds.json');

var unirest = require('unirest');
var mqtt = require('mqtt');
var options = {
    protocol: 'mqtts',
    clientId: makeid(5),
    username: data.myusername,
    password: data.mypassword,
    keepalive: 60,
    reconnectPeriod: 1000
};
var client = mqtt.connect('mqtts://us-west.thethings.network:8883', options);

client.subscribe("#");

client.on('connect', function () {
    client.subscribe('#', function (err) {
        if (!err) {
            console.log("Mqtt OK")
        }
    })
})

client.on('message', function (topic, message) {
    console.log(message.toString())
    unirest('POST', data.myAPIurl)
        .headers({
            'Content-Type': 'application/json'
        })
        .send(message.toString())
        .end(function (res) {
            if (res.error) throw new Error(res.error);
            console.log(200);
        });
})