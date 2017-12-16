const express = require("express");
const router = express.Router();
const taskRemoveCtrl = require("../controllers/taskRemove.controller");
const Joi = require("joi");
const validate = require("express-validation");

//apply validation on request body
const taskRemoveValidation = {
    RemoveTask: {
        body: {
            jobIds: Joi.required()
        }
    }
};

router.route('/')
    .post(validate(taskRemoveValidation.RemoveTask),taskRemoveCtrl.removeScheduledTasks);

module.exports = router;
