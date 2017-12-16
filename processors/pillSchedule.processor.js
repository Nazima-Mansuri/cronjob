var _ = require('lodash');
var moment = require('moment');
var path = require('path');
var config = require('../config/config');
var pg = require('pg');
var pool = new pg.Pool(config.pg);
var queue = require('../kue').instance;
var fs = require('fs');
var gcm = require('node-gcm');
var apn = require('apn');
var path = require('path');

var options = {
    token: {
        key: fs.readFileSync(path.join(__dirname, '..', 'config', config.certificates.apnKey)),
        keyId: "Q4Y6U4SL7V",
        teamId: "Y55EBSG532",
        passphrase: 'lanetteam1'
    },
    production: true,

};

var apnProvider = new apn.Provider(options);

queue.process('PillSchedule', onPillScheduleProcess);

function onPillScheduleProcess(job, done) {
    console.log('On Pill Schedule Process Start. Job details : ' + job);
    var schema = job.data.schema;
    var pillID = job.data.pillID;
    var feedID = job.data.feedID;
    var territory = job.data.territory;
    var userId = job.data.userID;
    var objItem = {
        pillID: pillID,
        feedID: feedID,
        territory: territory,
        schema: schema
    };

    getPillData(schema, pillID)
        .then(onSuccess)
        .catch(function () {
            console.log('Error in get pill data.')
            done();
        })
    ;
    function onSuccess(pillResult) {
        //console.log('Get Pill data successfully.Details - '+ JSON.stringify(pillResult.result));
        var pillResultSet = pillResult.result && pillResult.result || [];
        var title = pillResultSet[0].title;
        var id = pillResultSet[0].id;
        var body = pillResultSet[0].body;

        //console.log('here' + JSON.stringify(userId));
        if (userId.length == 0) {
            console.log('End process because of no user Id found');
            return done();
        } else {
            addDeliveryMessageBulk(objItem, userId);
            userId.forEach(function (item) {
                console.log('user id-' + item);
                getDeviceToken(item).then(function (deviceResult) {
                    console.log('Inside devicetoken .');
                    if (deviceResult.length == 0) {
                        console.log('No device token found');
                        return done();
                    }

                    var pillResultSet = deviceResult.result && deviceResult.result || [];
                    if (pillResultSet.length > 0) {
                        console.log("setting pillresultset");
                        var deviceToken = pillResultSet[0].devicetoken;
                        var device = pillResultSet[0].deviceos;
                        var megCont = {
                            title: title,
                            body: body,
                            pillId: id
                        };
                        //console.log('deviceToken ' + deviceToken + '-deviceId-' + device);

                        if (device && deviceToken) {
                            console.log("inside device& devicetoken");
                            var Obj = objItem;
                            Obj.userId = item;
                            if (device.toLowerCase() == "ios") {
                                console.log("iOs Device.");
                                pushToIos(deviceToken, megCont, Obj, function () {
                                    return done();
                                });
                                // pushToIos2(deviceToken,megCont,Obj, function () {
                                //     return done();
                                // });
                            } else if (device.toLowerCase() == "android") {
                                console.log("Android Device.");
                                pushToAndroid(deviceToken, megCont, Obj, function () {
                                    return done();
                                });
                            }
                        } else {
                            return done();
                        }
                    } else {
                        return done();
                    }
                }).catch(function () {
                    console.log('Error in get device token for userid - ' + item);
                    return done();
                });
            });
        }
    }
}

function getPillData(schema, pillId) {
    console.log('Inside Get Pill Data. Pill Id - ' + pillId);
    return new Promise(function (callback, reject) {
        pool = new pg.Pool(config.pg);
        pool.connect(function (err, client, done) {

            if (err) {
                console.log('Error in pool.connect. Details ' + err);
                reject({Success: false, error: err});
            }
            client.query('SELECT id,title, body FROM ' + schema + '.pills where id = ' + pillId, function (err, result) {
                done();
                if (err) {
                    console.log('Error in getting pill data from database. Details -' + err);
                    reject({Success: false, error: err});
                }
                callback({Success: true, result: result.rows});

            });
        })
    });

}

function getDeviceToken(uId) {
    console.log('Inside Get Device Token method');
    return new Promise(function (callback, reject) {
        pool = new pg.Pool(config.pg);
        pool.connect(function (err, client) {
            console.log('inside pool connect');
            if (err) {
                console.log('Error in pool connection inside device token.Details' + err);
                reject({Success: false, error: err});
            } else {
                console.log('No error in pool connection.');
            }
            client.query('SELECT id,devicetoken, deviceos FROM master.users where id = ' + uId, function (err, result) {
                if (err) {
                    console.log('Error in getting device details from database. Details -' + err);
                    reject({Success: false, error: err});
                } else {
                    console.log('get data for getdevicetoken');
                }
                console.log('Just before callback');
                callback({Success: true, result: result.rows});
            });
        })
    });
}

function pushToAndroid(deviceToken, messageContent, Obj, callback) {
    //console.log('Inside Push to android. devicetoken -' +deviceToken +'-Messagecontent-'+messageContent+'-obj-'+Obj);
    // deviceToken = "cwii8A27Asc:APA91bEk98QH1KE-HgQEjmmREOrSz6WQACHix7JYnj3IY2PueN4SVVk2_uFvf05Lk6RGfDerdnhM4gck8MB3jE477PClHlnl_ukTu4l5XM6So-FESCgyI40DwPKNoDCFSi3i-TumBdwa";
    var senderKey = "AAAAy-Ycr-M:APA91bFkHHd6lMRTasEqaRepH9iWZHT9alFzSPPl7ZLd3PCeIFlKx1m-TRhZyPfAsr8kXNp_96YzPoS8HqSveg7jvtfj6C6-s5lY-EsRp-sL01CDhUCwg3V1iGR9OwhblI7LMwm0IUys-rKFObq3VA-vCrfCMDgoaQ";

    var notificationData = {
        data: {
            title: messageContent.title,
            icon: "icon",
            body: messageContent.pillId,
            action: "Pill",
        }
    };

    var gcmSender = new gcm.Sender(senderKey);
    var message = new gcm.Message(notificationData);
    console.log("Android notification for user-" + Obj.userId + ".Request-" + JSON.stringify(message));
    gcmSender.send(message, {registrationTokens: [deviceToken]}, function (err, response) {
        if (err) {
            console.log('Failed to send android notification Error -' + JSON.stringify(err));
            return callback();
        }
        else {
            console.log('android notification sent Details -' + JSON.stringify(response));
            return callback();
        }
    });
}


function addDeliveryMessageBulk(obj, userIds) {
    //console.log('Inside Add delivery Message.');
    var schema = obj.schema;
    var feedId = obj.feedID;
    var pillId = obj.pillID;
    var territory = obj.territory[0];
    var now = new Date();
    pool = new pg.Pool(config.pg);
    pool.connect(function (err, client, done) {
        if (err) {
            console.log('Error in pool.connect.Detail' + err);
        } else {
            userIds.forEach(function (item) {
                client.query('INSERT INTO ' + schema + '.feeddelivery (territory, userid, feed, pillid,deliverytime,createdate) VALUES ($1, $2, $3, $4, $5,$6) RETURNING *;',
                    [territory, item, feedId, pillId, now, now], function (err, result) {
                        if (err) {
                            console.log('Error in connecting database.' + err);
                        } else {
                            console.log(JSON.stringify(result.rows[0].id));
                            //console.log('Schema - ' + schema + '.userID-' + item + '.feedId-' + feedId + '.pillId-' + pillId + '.territory-' + territory + '.now-' + now);
                        }
                    });
            });
        }
    });
}

function addFailureMessage(obj) {
    console.log('Inside addFailureMessage.Details - ' + obj);
    var schema = obj.schema;
    var userId = obj.userID;
    var feedId = obj.feedID;
    var pillId = obj.pillID;
    var territory = obj.territory;
    var now = new Date();

    return new Promise(function (callback, reject) {
        pool = new pg.Pool(config.pg);
        pool.connect(function (err, client, done) {
            if (err) {
                console.log('Error in pool.connectpool.connect. Error -' + err);
                reject({Success: false, error: err});
            }
            client.query('INSERT INTO ' + schema + '.feeddeliveryfail (territory, userid, feed, pillid,deliverytime,createdate) VALUES ($1, $2, $3, $4, $5,$6);',
                [territory, userId, feedId, pillId, now, now], function (err, result) {
                    done();
                    if (err) {
                        console.log('Issue in inserting in feeddeliveryfail.Error -' + err);
                        reject({Success: false, error: err});
                    } else {
                        console.log('Successfully added to feeddeliveryfail. details.' + result.rows);
                    }
                    callback({Success: true, result: result.rows});
                });
        });
    });

}

function pushToIos(deviceToken, messageContent, Obj, callback) {
    var apnProvider = new apn.Provider(options);
    //console.log('Inside pushtoIos.Details: Device token-' +deviceToken +' - message content -' +messageContent + 'Object -' + Obj);
    var note = new apn.Notification();
    note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
    var alert = {};
    alert.action = "pill";
    alert.id = messageContent.pillId;
    alert.body = "\uD83D\uDCE7 \u2709 You have a new feed on Rolla App. Visit now.";
    note.sound = "ping.aiff";
    note.alert = alert;
    note.payload = {'id': messageContent.pillId};
    note.topic = "com.companyname.rollaapp";
    console.log('PushToIOS Note for user -' + Obj.userId + '. -> ' + JSON.stringify(note));
    apnProvider.send(note, deviceToken).then((result) => {
        console.log('PushToIOS Result :' + JSON.stringify(result));
        return callback();
    }).catch(function () {
        console.log('Error in iOS send for user');
        return callback();
    });
}

function pushToIos2(deviceToken, messageContent, Obj, callback) {
    var apnProvider = new apn.Provider(options);
    var random = makeid();
    //console.log('Inside pushtoIos2.Details: Device token-' +deviceToken +' - message content -' +messageContent + 'Object -' + Obj);
    var note = new apn.Notification();
    note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
    note.contentAvailable = true;
    note.sound = "";
    note.payload = {'action': 'Pill', 'id': messageContent.pillId, 'random': random};
    note.topic = "com.companyname.rollaapp";
    console.log('PushToIOS Note2 for user -' + Obj.userId + '. -> ' + JSON.stringify(note));
    apnProvider.send(note, deviceToken).then((result) => {
        console.log('PushToIOS Result :' + JSON.stringify(result));
        return callback();
    }).catch(function () {
        console.log('Error in iOS send2.');
        return callback();
    });
}

function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 10; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}
