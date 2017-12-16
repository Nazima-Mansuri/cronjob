'use strict';

var apn = require('apn');
var fs = require('fs');
var path = require('path');
var config = require('./config/config');

var options = {
    token: {
        key: fs.readFileSync('/home/lcom25/Desktop/Rolla/cronjob/config/APNsAuthKey_94LFE2CY3F.p8'),
        keyId: "94LFE2CY3F",
        teamId: "Y55EBSG532",
        passphrase: 'lanetteam1'
    },
    production: false

};

var apnProvider = new apn.Provider(options);
var deviceToken = "d6c96e2dbf3ac97ed1871a01efc0890473a613e158b54004a2913263af5edb1a";

var note = new apn.Notification();

note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
note.badge = 3;
note.sound = "ping.aiff";
note.alert = '\uD83D\uDCE7 \u2709 You have a new message Megha';
note.payload = { 'messageFrom': 'John Appleseed' };
note.topic = "com.companyname.rollaapp";

apnProvider.send(note, deviceToken).then(function (result) {
    // see documentation for an explanation of result
    console.log(result);
});