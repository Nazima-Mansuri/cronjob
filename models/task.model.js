var mongoose = require("mongoose");
var Schema = mongoose.Schema;
const _ = require("lodash");
const boom = require("boom");
const APIError = require("./../helpers/APIError");
const httpStatus = require('http-status');

const Task = new Schema({
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

Task.method({

});

//get task by task Id
Task.statics.getByTaskId = function (taskId) {
    return this.findById(taskId)
        .exec()
        .then(function (task) {
            if (task) {
                return task;
            }
            const err = new APIError('Task not found"', httpStatus.NOT_FOUND);
            return Promise.reject(err);
        });
};

module.exports = mongoose.model("Task", Task);