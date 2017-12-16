"use strict";

var config = require('../config/config');
var kue = require("../helpers/kue");

function removeScheduledTasks(req, res, next) {

    var jobids = req.body.jobIds;

    kue.removeScheduledTasks(jobids, onSuccess);
    function onSuccess(response) {
        return res.json({ jobids: jobids });
    }
}

module.exports = { removeScheduledTasks: removeScheduledTasks };