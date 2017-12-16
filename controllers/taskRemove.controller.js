const config = require('../config/config');
const kue = require("../helpers/kue");

function removeScheduledTasks(req, res, next) {

    const jobids = req.body.jobIds;

    kue.removeScheduledTasks(jobids,onSuccess);
    function onSuccess(response){
        return res.json({ jobids: jobids});
    }
}

module.exports = {removeScheduledTasks};