var express    = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var config = require('./config');
const apiRouter = require("../routes/index.route");
var jwt = require("jsonwebtoken");
var expressValidation = require("express-validation");
const APIError = require("../helpers/APIError");
const httpStatus = require('http-status');

//Here configure the express
var app = express();
var server = require("http").Server(app);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//all route assign here
app.use('/',apiRouter);

//Here handle an error when next with error
app.use(function (err, req, res, next) {
    console.log("inside next err call");
    if (err instanceof expressValidation.ValidationError) {
        console.log(err);
        const errorMessage = err.errors.map(error => error.messages.join('. ')).join(' and ');
        return res.status(err.status).json({
            error: errorMessage
        });
    }else if (err instanceof APIError) {
        console.log(err);
        return res.status(err.status || httpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: err.message
        });
    } else{
        next(err);
    }
});

// if api not found then send message
app.use(function (req, res, next) {
    console.log("inside not found");
    return res.status(404).json({ success: false, message: 'API not found.' });
});

//Listening port
app.set('port',process.env.PORT || config.webPort);

server.listen(3000,function(){
    console.log('Server listing at port ' + 3010);
});

module.exports = app;
