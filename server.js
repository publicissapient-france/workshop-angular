var express = require('express'),
    path = require('path'),
    app = express(),
    allowCrossDomain = function(req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type');
        next();
    },
    data = require('./data/apache-log.json'),
    offset = 15;


app.use(express.static(__dirname + "/app"));
app.use(express.bodyParser());
app.use(allowCrossDomain);


app.get('/logs', function(req, res) {
    res.send(require('./data/log-list.json'));
});

app.get('/logs/:id', function(req, res) {
    res.send(require('./data/log-' + req.params.id + '.json'));
});

app.get('/apache/logs', function(req, res) {
    var page = req.query["page"];
    if (page == undefined || page < 1) page = 1;
    res.send(data.slice((page-1) * offset, page * offset));
});

app.get('/apache/logs/:id', function(req, res) {
    var id;
    try {
        id = parseInt(req.params.id);
    } catch(err) {
        id = 1;
    }

    for (var i in data) {
        if (data[i].id == id) {
            res.send(data[i]);
            return;
        }
    }
});


app.listen(3000);
console.log('Server started on port 3000');