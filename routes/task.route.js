const express = require("express");
const router = express.Router();
const taskCtrl = require("../controllers/task.controller");
const Joi = require("joi");
const validate = require("express-validation");

//apply validation on request body
const taskValidation = {
    createPill: {
        body: {
            feedScheduleId: Joi.number().required()
        }
    }
};

router.route('/')
    .post(validate(taskValidation.createPill),taskCtrl.addPillScheduleTask);

module.exports = router;
