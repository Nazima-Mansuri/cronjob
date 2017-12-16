"use strict";

var express = require("express");
var router = express.Router();
var taskRemoveCtrl = require("../controllers/taskRemove.controller");
var Joi = require("joi");
var validate = require("express-validation");

//apply validation on request body
var taskRemoveValidation = {
    RemoveTask: {
        body: {
            jobIds: Joi.required()
        }
    }
};

router.route('/').post(validate(taskRemoveValidation.RemoveTask), taskRemoveCtrl.removeScheduledTasks);

module.exports = router;