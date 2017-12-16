'use strict';

var kue = require('kue');
var _ = require('lodash');

var settings = require('./config/config');

// connect kue
var queue = kue.createQueue({
    prefix: 'q',
    redis: settings.redis
});

module.exports = {
    instance: queue
};