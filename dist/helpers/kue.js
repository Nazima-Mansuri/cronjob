'use strict';

var settings = require('../config/config');
var pg = require('pg');
var moment = require('moment');
var pool = new pg.Pool(settings.pg);
var config = require('../config/config');
var kue = require('kue');
var fs = require('fs');
var path = require('path');
var gcm = require('node-gcm');
var apn = require('apn');

var queue = kue.createQueue({
    prefix: 'q',
    redis: settings.redis
});

module.exports = {
    addPillScheduleTask: newAddPillScheduleTask,
    removeScheduledTasks: removeScheduledTasks,
    addTestScheduler: addTestScheduler
};

function getFeedScjedule(schema, feedId) {
    console.log('Inside Get Feed Schedule data. Schema - ' + schema + '-feedScheduleId- ' + feedId);
    return new Promise(function (callback, reject) {
        pool = new pg.Pool(config.pg);
        pool.connect(function (err, client, done) {
            if (err) {
                console.log('error in pool.connect. Error -' + err);
                reject({ Success: false, error: err });
            }
            client.query('SELECT * FROM ' + schema + '.feedschedule where id = ' + feedId, function (err, result) {
                done();
                if (err) {
                    console.log('error in getting feed schedule data. Error -' + err);
                    reject({ Success: false, error: err });
                } else {
                    console.log('Successfully get data from feed schedule. Data -' + result.rows);
                    callback({ Success: true, result: result.rows });
                }
            });
        });
    });
}
function getPillScjedule(schema, feedID) {
    console.log('Inside getPillSchedule. Schema- ' + schema + '-FeedScheduleId -' + feedID);
    return new Promise(function (callback, reject) {
        pool = new pg.Pool(config.pg);
        pool.connect(function (err, client, done) {

            if (err) {
                console.log('Error in pool connection. Error - ' + err);
                reject({ Success: false, error: err });
            }
            client.query('SELECT pills FROM ' + schema + '.feeds where id = ' + feedID, function (err, result) {
                done();
                if (err) {
                    console.log('Error in getting data from feeds.Error Detail - ' + err);
                    reject({ Success: false, error: err });
                }
                console.log('Successfully get data of feed->Pill - ' + result.rows);
                callback({ Success: true, result: result.rows });
            });
        });
    });
}
function addPillScheduleTask(schema, feedId, cb) {
    console.log('Inside App Pill Schedule task.');
    var JobIds = [];
    getFeedScjedule(schema, feedId).then(onSuccess);
    function onSuccess(response) {
        console.log('Get data from feed scheduler. FeedScheduleId ' + feedId);
        var resultData = response.result && response.result || [];

        if (resultData.length > 0) {
            var onResultSuccess = function onResultSuccess(rResult) {
                console.log('get data from PillSchedule. -' + rResult);
                var pillResultSet = rResult.result && rResult.result || [];
                var pills = pillResultSet[0].pills;

                var taskName = "PillSchedule";
                if (startTime.length == endTime.length && endTime.length == noOfPills.length && pills.length > 0) {

                    if (numberOfDays == 0) {
                        console.log('Inside number of days =0');
                        for (var i = 0; i < startTime.length; i++) {
                            if (noOfPills[i] == 1) {
                                var time = startTime[0].split(":");
                                var setDateTime = moment(startDate).set({
                                    hour: time[0],
                                    minute: time[1],
                                    second: time[2]
                                });
                                var duration = moment.duration(moment(setDateTime).diff(moment(Date.now())));

                                var taskName = "PillSchedule";

                                var promise = new Promise(function (resolve, reject) {
                                    var messageTask = queue.create(taskName, {
                                        pillID: pills[0],
                                        userID: userID,
                                        schema: schema,
                                        territory: territory,
                                        feedID: feedScheduleId
                                    }).delay(duration._milliseconds).removeOnComplete(true).save(function (err) {
                                        if (err) {
                                            console.log('Not able to generate task.Detail - ' + err);
                                            reject(Error("It broke"));
                                        } else {
                                            console.log('duration milisecond- ' + duration._milliseconds.toString());
                                            JobIds.push(messageTask.id);
                                            console.log('Added job to redis database. Job Id' + messageTask.id);
                                            resolve("Stuff worked!");
                                        }
                                    });
                                });
                                dataToBeInserted.push(promise);
                            }
                        }

                        if (noOfPills[i] > 1) {
                            console.log('Inside no.of pills >1');
                            var startTimestamp = startTime[i].split(":");
                            var EndTimestamp = endTime[i].split(":");
                            var StartDateStartTime = moment(startDate).set({
                                hour: startTimestamp[0],
                                minute: startTimestamp[1],
                                second: startTimestamp[2]
                            });
                            var setStartDateEndTime = moment(startDate).set({
                                hour: EndTimestamp[0],
                                minute: EndTimestamp[1],
                                second: EndTimestamp[2]
                            });
                            var diffMinutes = moment.duration(moment(endTime[i], "HH:mm:ss").diff(moment(startTime[i], "HH:mm:ss")));
                            var addMinutesDiff = Math.round(diffMinutes._milliseconds / 1000 / 60 / noOfPills[i + 1]);

                            var totalAddToStartTime = 0;
                            var pindex = 0;
                            for (var jk = 0; jk < noOfPills[i]; jk++) {
                                var time = startTime[i].split(":");
                                var setDateTime = moment(startDate).set({
                                    hour: time[0],
                                    minute: time[1],
                                    second: time[2]
                                });
                                var newStartDateTime = moment(setDateTime).add(totalAddToStartTime, "minutes");
                                totalAddToStartTime += addMinutesDiff;
                                var duration = moment.duration(moment(newStartDateTime).diff(moment(Date.now())));

                                var taskName = "PillSchedule";

                                var promise = new Promise(function (resolve, reject) {

                                    var messageTask = queue.create(taskName, {
                                        pillID: pills[pindex],
                                        userID: userID,
                                        schema: schema,
                                        territory: territory,
                                        feedID: feedOfId
                                    }).delay(duration._milliseconds).removeOnComplete(true).save(function (err) {
                                        if (err) {
                                            console.log('job failed to add - ' + err);
                                            reject(Error("It broke"));
                                        } else {
                                            console.log('duration milisecond- ' + duration._milliseconds.toString());
                                            JobIds.push(messageTask.id);
                                            resolve("Stuff worked!");
                                        }
                                    });
                                });
                                dataToBeInserted.push(promise);

                                if (pills[jk + 1]) {
                                    pindex += 1;
                                    continue;
                                } else {
                                    if (!rotate) {
                                        if (pills[pindex + 1]) {
                                            pindex += 1;
                                            continue;
                                        } else {
                                            pindex = 0;
                                        }
                                    } else {
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
                if (numberOfDays > 0) {
                    console.log('Inside no. of day > 1');
                    for (var j = 0; j <= numberOfDays; j++) {
                        for (var i = 0; i < startTime.length; i++) {
                            if (noOfPills.length == 1) {

                                var NewStartDate = moment(startDate).add(j, "day");
                                var time = startTime[i].split(":");
                                var setDateTime = moment(NewStartDate).set({
                                    hour: time[0],
                                    minute: time[1],
                                    second: time[2]
                                });
                                var duration = moment.duration(moment(setDateTime).diff(moment(Date.now())));
                                if (duration._milliseconds > 0) {
                                    var promise = new Promise(function (resolve, reject) {
                                        var messageTask = queue.create(taskName, {
                                            pillID: pills[0],
                                            userID: userID,
                                            schema: schema,
                                            territory: territory,
                                            feedID: feedOfId
                                        }).delay(duration._milliseconds).removeOnComplete(true).save(function (err) {
                                            if (err) {
                                                reject(Error("It broke"));
                                            } else {
                                                console.log('duration milisecond- ' + duration._milliseconds.toString());
                                                JobIds.push(messageTask.id);
                                                resolve("Stuff worked!");
                                            }
                                        });
                                    });
                                    dataToBeInserted.push(promise);
                                }
                            }
                            if (noOfPills[i] > 1) {
                                var NewStartDate = moment(startDate).add(j, "day");

                                var startTimestamp = startTime[i].split(":");
                                var EndTimestamp = endTime[i].split(":");
                                var StartDateStartTime = moment(NewStartDate).set({
                                    hour: startTimestamp[0],
                                    minute: startTimestamp[1],
                                    second: startTimestamp[2]
                                });
                                var setStartDateEndTime = moment(NewStartDate).set({
                                    hour: EndTimestamp[0],
                                    minute: EndTimestamp[1],
                                    second: EndTimestamp[2]
                                });

                                var diffMinutes = moment.duration(moment(endTime[i], "HH:mm:ss").diff(moment(startTime[i], "HH:mm:ss")));
                                var addMinutesDiff = Math.round(diffMinutes._milliseconds / 1000 / 60 / noOfPills[i]);

                                var totalAddToStartTime = 0;
                                var pindex = 0;
                                for (var jk = 0; jk < noOfPills[i]; jk++) {

                                    var time = startTime[i].split(":");
                                    var setDateTime = moment(NewStartDate).set({
                                        hour: time[0],
                                        minute: time[1],
                                        second: time[2]
                                    });
                                    var newStartDateTime = moment(setDateTime).add(totalAddToStartTime, "minutes");
                                    totalAddToStartTime += addMinutesDiff;
                                    var duration = moment.duration(moment(newStartDateTime).diff(moment(Date.now())));

                                    var promise = new Promise(function (resolve, reject) {
                                        var messageTask = queue.create(taskName, {
                                            pillID: pills[pindex],
                                            userID: userID,
                                            schema: schema,
                                            territory: territory,
                                            feedID: feedOfId
                                        }).delay(duration._milliseconds).removeOnComplete(true).save(function (err) {
                                            if (err) {
                                                reject(Error("It broke"));
                                            } else {
                                                console.log('duration milisecond- ' + duration._milliseconds.toString());
                                                JobIds.push(messageTask.id);
                                                resolve("Stuff worked!");
                                            }
                                        });
                                    });
                                    dataToBeInserted.push(promise);

                                    if (pills[jk + 1]) {
                                        pindex += 1;
                                        continue;
                                    } else {
                                        if (!rotate) {
                                            if (pills[pindex + 1]) {
                                                pindex += 1;
                                                continue;
                                            } else {
                                                pindex = 0;
                                            }
                                        } else {

                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                Promise.all(dataToBeInserted).then(function () {
                    console.log('Yuppie..... ' + JobIds);
                    cb(JobIds);
                });
            };

            var data = resultData[0];
            var startTime = data.feedstarttime;
            var noOfPills = data.numberofpillperday;
            var endTime = data.feedendtime;
            var userID = data.userid;
            var startDate = moment(data.feedstartdate).add(0, "day");
            var endDate = moment(data.feedenddate).add(0, "day");
            var numberOfDays = moment(moment(endDate).format('YYYY-MM-DD')).diff(moment(startDate).format('YYYY-MM-DD'), 'days');
            var feedOfId = resultData[0].feedid;
            var rotate = resultData[0].rotate;
            var territory = resultData[0].territories;
            var jobids = resultData[0].jobids;
            var feedScheduleId = feedId;

            if (jobids != undefined && jobids != null && jobids.length > 0) {
                console.log('Remove jobIds before updating it');
                jobids.forEach(function (id) {
                    kue.Job.get(id, function (err, job) {
                        job.remove(function (err) {
                            if (!err) console.log('removed completed job #%d', job.id);
                        });
                    });
                });
            }

            getPillScjedule(schema, feedOfId).then(onResultSuccess);
            var dataToBeInserted = [];
        }
    }
}
function removeScheduledTasks(taskIds, cb) {

    var dataToBeDeleted = [];
    console.log('Need to delete this - ' + taskIds);
    var jobids = taskIds.split(',').map(Number);

    if (jobids != undefined && jobids != null && jobids.length > 0) {
        jobids.forEach(function (id) {
            var promise = new Promise(function (resolve, reject) {
                kue.Job.get(id, function (err, job) {
                    job.remove(function (err) {
                        if (!err) {
                            resolve('Job Deleted !');
                            console.log('Removed completed job #%d', job.id);
                        } else {
                            reject('Error in job deletion process!');
                        }
                    });
                });
            });
            dataToBeDeleted.push(promise);
        });

        Promise.all(dataToBeDeleted).then(function () {
            cb(jobids);
        });
    }
}
function newAddPillScheduleTask(schema, feedScheduleID, cb) {
    console.log('Pill Scheduling adding to database process start. Schema-' + schema + '.FeedScheduleId-' + feedScheduleID);
    var JobIds = [];
    var PillIds = [];
    getFeedScjedule(schema, feedScheduleID).then(onSuccess).catch(function (error) {
        console.log(JSON.stringify(error));
    });
    function onSuccess(response) {
        console.log('Get data from feed scheduler. FeedScheduleId ' + feedScheduleID);
        var resultData = response.result && response.result || [];

        if (resultData.length > 0) {
            //  var dataToBeInserted = [];

            var onResultSuccess = function onResultSuccess(rResult) {
                var pillResultSet = rResult.result && rResult.result || [];
                var p = 0;
                console.log('Pill Ids for this -' + pillResultSet[0].pills);
                PillIds = pillResultSet[0].pills;
                var pills = pillResultSet[0].pills;
                var totalNoOfPills = pills.length;
                var taskName = "PillSchedule";
                var duration = 0;

                if (startTime.length == endTime.length && endTime.length == noOfPills.length && pills.length > 0) {
                    console.log('Total scheduled days -' + numberOfDays);
                    console.log('Total scheduled time per day -' + startTime.length);

                    var dataToBeInserted = [];

                    for (var i = 0; i <= numberOfDays; i++) {
                        for (var j = 0; j < startTime.length; j++) {

                            var pill4this = noOfPills[j];
                            var diff = moment.duration(moment(endTime[j], "HH:mm:ss").diff(moment(startTime[j], "HH:mm:ss")));
                            console.log('diff-' + diff);
                            var addMinutesDiff = diff._milliseconds / 1000 / 60 / pill4this;
                            console.log('AddMinutediff-' + addMinutesDiff);

                            console.log('session details - Starttime- ' + startTime[j] + '.Endtime-' + endTime[j] + '.noOfPill-' + noOfPills[j]);

                            var stime = startTime[j].split(":");
                            var etime = endTime[j].split(":");

                            var setStartDateTime = moment(startDate).set({
                                hour: stime[0],
                                minute: stime[1],
                                second: stime[2]
                            });

                            for (var k = 0; k < pill4this; k++) {

                                if (p > totalNoOfPills - 1) {
                                    if (!rotateP) {
                                        break;
                                    } else {
                                        p = 0;
                                    }
                                }
                                console.log('P ->' + p);

                                //var newStartDateTime = moment(setStartDateTime).add(((k + 1) * addMinutesDiff), "minutes");
                                //console.log('new startdatetime->' + newStartDateTime)


                                var promise = new Promise(function (resolve, reject) {

                                    var d = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
                                    var newDate = new Date(setStartDateTime._d.getTime() + addMinutesDiff * k * 60000);
                                    var duration1 = moment.duration(moment(newDate).diff(moment(new Date(d))));
                                    console.log("New Date : - " + newDate + " : Current Date : " + new Date(d));
                                    var messageTask = queue.create(taskName, {
                                        pillID: pills[p],
                                        userID: userID,
                                        schema: schema,
                                        territory: territory,
                                        feedID: feedScheduleId
                                    }).delay(duration1._milliseconds).removeOnComplete(true).save(function (err) {
                                        if (err) {
                                            console.log('job failed to add - ' + err);
                                            reject(Error("It broke"));
                                        } else {
                                            console.log('JobId -' + messageTask.id + '.duration milisecond- ' + duration1._milliseconds.toString());
                                            JobIds.push(messageTask.id);
                                            resolve("Stuff worked!");
                                        }
                                    });
                                });
                                p++;
                                dataToBeInserted.push(promise);
                            }

                            dataToBeInserted.push(promise);
                        }

                        startDate = moment(startDate).add(1, "day");
                    }
                } else {
                    console.log('Required data are not available or data is not accurate. Start Time -' + startTime + '.Endtime-' + endTime + '.noOfPills-' + noOfPills);
                    return;
                }

                Promise.all(dataToBeInserted).then(function () {
                    console.log('Yuppie..... ' + JobIds);
                    cb(JobIds);
                });
            };

            var data = resultData[0];
            var startTime = data.feedstarttime;
            var noOfPills = data.numberofpillperday;
            var endTime = data.feedendtime;
            var userID = data.userid;
            var startDate = moment(data.feedstartdate).add(0, "day");
            var endDate = moment(data.feedenddate).add(0, "day");
            var numberOfDays = moment(moment(endDate).format('YYYY-MM-DD')).diff(moment(startDate).format('YYYY-MM-DD'), 'days');
            var feedOfId = resultData[0].feedid;
            var rotateP = resultData[0].rotate;
            var territory = resultData[0].territories;
            var jobids = resultData[0].jobids;
            var feedScheduleId = feedScheduleID;

            if (jobids != undefined && jobids != null && jobids.length > 0) {
                console.log('Remove jobIds before updating it');
                jobids.forEach(function (id) {
                    kue.Job.get(id, function (err, job) {
                        job.remove(function (err) {
                            if (!err) console.log('removed completed job #%d', job.id);
                        });
                    });
                });
            }

            getPillScjedule(schema, feedOfId).then(onResultSuccess);
        } else {
            console.log('No result found for this feed schedule id. Feed Schedule Id -' + feedScheduleID);
            return;
        }
    }
}
function addTestScheduler(schema, testId, cb) {}