
var WebSocketServer = require('websocket').server;
var wsServer;
module.exports = {
  name:'WebSocket Servers',
  init:function(server, acceptor){
    wsServer = new WebSocketServer({
      httpServer: acceptor,
      // You should not use autoAcceptConnections for production
      // applications, as it defeats all standard cross-origin protection
      // facilities built into the protocol and the browser.  You should
      // *always* verify the connection's origin and decide whether or not
      // to accept it.
      autoAcceptConnections: false
    });
    wsServer.on('request', onRequest);
  },
  loadSubs:function(){
    require('/app/util.js').forEachFile('/app/wss/', function(file){
      console.group();
      console.log('Loading MiniServ: wss/'+file);
      var serv2B = require('/app/wss/'+file);
      console.log('Hooking MiniServ - '+serv2B.disp);
      miniServs.push(serv2B);
      console.groupEnd();
    });
  }
};

var miniServs = [];
// WebSocket Server.

// Our server:
//   https://github.com/theturtle32/WebSocket-Node/blob/master/docs/index.md

// Given the request, What server handles it?
function getServ(request) {
  console.log('New client connection:\n  -+ From: '+request.remoteAddress+'\n  -+ To: '+request.host+request.resource);
  
  // Make sure we have a resource to get.
  if(request.resource.length<1)
    return false;
  // Purge beginning '/'
  var target = request.resource.substring(1);
  // Target Server is 0 to '/', rest is data for server.
  if(target.indexOf('/')>1)
    target = target.substring(0, target.indexOf('/'));
  // Go through all servers to find target.
  for(var k = 0; k < miniServs.length; k++)
    if(target == miniServs[k].name)
      return miniServs[k];
  // Target server not found, bad request.
  return null;
}

// A New connection to our WebSocket Server.
function onRequest(request) {
  console.log('serv.wss - onRequest');
  // Get out target server.
    var targetServ = getServ(request);
  // If it's null, we don't handle.
    if (targetServ==null) {
      // Make sure we only accept requests from an allowed origin
      request.reject(483, 'Not able to handle Resource');
      console.log('Connection from origin ' + request.origin + ' rejected.');
      return;
    }
    // We can handle so accept
    var connection = request.accept('vzy-ws', request.origin);
  // Log the acception
    console.log('Connection accepted');
  
  var url = request.resource.substring(1);
  url = url.substring(url.indexOf('/')+1);
    // this is where we join chat rooms and such
    targetServ.connect(connection, url);
}