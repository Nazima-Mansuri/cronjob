"use strict";

var express = require("express");
var router = express.Router();
var taskCtrl = require("../controllers/task.controller");
var Joi = require("joi");
var validate = require("express-validation");

//apply validation on request body
var taskValidation = {
    createPill: {
        body: {
            feedScheduleId: Joi.number().required()
        }
    }
};

router.route('/').post(validate(taskValidation.createPill), taskCtrl.addPillScheduleTask);

module.exports = router;