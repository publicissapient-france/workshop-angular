var express = require('express')
  , path = require('path')
  , http = require('http');
var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3001);
  app.use(express.static(path.join(__dirname, '/../app')));
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
