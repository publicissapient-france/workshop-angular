var express = require('express'),
    path = require('path'),
    app = express(),
    allowCrossDomain = function(req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type');
        next();
    }


app.use(express.static(__dirname + "/app"));
app.use(express.bodyParser());
app.use(allowCrossDomain);


app.get('/logs', function(req, res) {
    res.send(require('./data/log-list.json'));
});

app.get('/logs/:id', function(req, res) {
    res.send(require('./data/log-' + req.params.id + '.json'));
});


app.listen(3000);
console.log('Server started on port 3000');