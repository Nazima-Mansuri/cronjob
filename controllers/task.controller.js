const config = require('../config/config');
const kue = require("../helpers/kue");

function addPillScheduleTask(req, res, next) {

  const feedId = req.body.feedScheduleId;

  const schema = req.body.schema;

  kue.addPillScheduleTask(schema,feedId,onSuccess);
  function onSuccess(response){
    return res.json({ feedId: feedId, jobIds:response});
  }
}

module.exports = {addPillScheduleTask};
