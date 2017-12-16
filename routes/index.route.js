const express = require("express");
const router = express.Router();
const taskRoute = require("./task.route");
const taskremoveRoute = require("./taskRemove.route")

//Book routes
router.use('/api/tasks', taskRoute);
router.use('/api/removetasks',taskremoveRoute)

//Test the server
router.get('/', function(req, res) {
    res.json({ message: 'hello from api test!' });
});

module.exports = router;
