// Simple Single Chat room Server
module.exports={
  name:'schat',
  disp:'Simple Chat',
  clients:[],
  broadcast:function (msg){for(var k = 0; k < this.clients.length; k++) this.clients[k].sendUTF(msg);},
  connect:function(client, url){
    var serv = this;
    // Get a basic display name for the connection
    client.displayName = require('/app/util.js').genNameBasic(client, url);
    serv.clients.push(client);
    console.log('SChat: '+client.displayName+' has joined the room, room count:'+serv.clients.length+'.');
    serv.broadcast('<i>'+client.displayName+'</i> has <b>joined</b>.<hr>');
    client.on('message', function (msg){
      if(msg.type==='utf8'){
        serv.broadcast(client.displayName+':  '+msg.utf8Data+'<hr>');
        console.log('SChat: '+client.displayName+': '+msg.utf8Data);
      }
    });
    client.on('close', function (reason, meaning){
      console.log('SChat: Peer '+client.displayName+' disconnected, room count:'+(serv.clients.length-1)+'.');
      serv.broadcast('<i>'+client.displayName+'</i> has <b>left</b>.<hr>');
      // Remove the client from our clients.
      var at = serv.clients.indexOf(client);
      if(at<0)return;
      serv.clients.splice(at, 1);
    });
  }
}