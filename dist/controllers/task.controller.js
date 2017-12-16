"use strict";

var config = require('../config/config');
var kue = require("../helpers/kue");

function addPillScheduleTask(req, res, next) {

  var feedId = req.body.feedScheduleId;

  var schema = req.body.schema;

  kue.addPillScheduleTask(schema, feedId, onSuccess);
  function onSuccess(response) {
    return res.json({ feedId: feedId, jobIds: response });
  }
}

module.exports = { addPillScheduleTask: addPillScheduleTask };