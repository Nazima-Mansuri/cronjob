"use strict";

var express = require("express");
var router = express.Router();
var taskRoute = require("./task.route");
var taskremoveRoute = require("./taskRemove.route");

//Book routes
router.use('/api/tasks', taskRoute);
router.use('/api/removetasks', taskremoveRoute);

//Test the server
router.get('/', function (req, res) {
    res.json({ message: 'hello from api test!' });
});

module.exports = router;