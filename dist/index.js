"use strict";

var app = require("./config/express");
require("./processors/index.processor");

//http://mherman.org/blog/2015/02/12/postgresql-and-nodejs/#.WInSRIh95Nx

module.exports = app;

// var express = require('express')
// var app = express()
// var router = express.Router();
// var bodyParser = require('body-parser');
//
// app.use(bodyParser.json()); // support json encoded bodies
// app.use(bodyParser.urlencoded({ extended: true }));
//
//
// router.post('/putInsert', function (req, res) {
//
//   res.send({name:req.body.name});
// })
//
//
// app.use('/api', router);
// app.listen(3010, function () {
//   console.log('Example app listening on port 3000!')
// })