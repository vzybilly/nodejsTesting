// Imports.
var express = require('express');
var app = express();
var FS = require('fs');
// HTTP Server.

// Folder to use for website.
app.use(express.static('public'));

// I'm assuming this is the http method? it's preGen'd
app.get('/', function(request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

// Start our server.
var listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});

// This is our server list
var miniServs = [];
// Find all files in my dir.
FS.readdir('./', function(err, items) {
  console.log('Loading Mini Server Types:');
  console.group();
  // Look at each individual file.
  for (var i=0; i<items.length; i++) {
      if(items[i].startsWith('serv.')){
        // Log the file we'll attempt to add
        console.log('Adding a server from (./'+items[i]+')');
        console.group();
        // Add the server.
        var serv2B = require('./'+items[i]);
        console.log('Loading server type: '+serv2B.name);
        serv2B.init(app, listener);
        serv2B.loadSubs();
        console.log('Loaded Successfully!');
        miniServs.push(serv2B);
        console.groupEnd();
        console.log('Added~');
      }
  }
  console.groupEnd();
  console.log('Done loading Server Types.');
});
