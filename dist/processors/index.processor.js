'use strict';

var _ = require('lodash');

var processors = ['pillSchedule'];

processors = _.map(processors, function (processor) {

    return require('./' + processor + '.processor.js');
});

module.exports = processors;