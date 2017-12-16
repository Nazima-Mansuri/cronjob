"use strict";

var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var _ = require("lodash");
var boom = require("boom");
var APIError = require("./../helpers/APIError");
var httpStatus = require('http-status');

var Task = new Schema({
    name: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

Task.method({});

//get task by task Id
Task.statics.getByTaskId = function (taskId) {
    return this.findById(taskId).exec().then(function (task) {
        if (task) {
            return task;
        }
        var err = new APIError('Task not found"', httpStatus.NOT_FOUND);
        return Promise.reject(err);
    });
};

module.exports = mongoose.model("Task", Task);