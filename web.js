var express = require('express');
var fs = require('fs');

var outputfile = "index.html";
buf = new Buffer(fs.readFileSync(outputfile), "utf-8");
var outputdata = buf.toString('utf-8');

var app = express.createServer(express.logger());

app.get('/', function(request, response) {
  response.send(outputdata);
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
