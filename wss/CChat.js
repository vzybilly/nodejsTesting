var utilz = require('/app/util.js');

// Simple Single Chat room Server
module.exports={
  name:'cchat',
  disp:'Chat with Commands!',
  rooms:[],
  makeRoom:function(roomName, temp){
    console.log('CChat: making room ('+roomName+'), temp?'+temp);
    return this.rooms.push({
      autoRemove:temp,
      name:roomName,
      clients:[],
      broadcast:function (msg, trace){
        if(!(trace.indexOf('('+this.name+':')<0)){
          // We're already in the trace
          // which means if we broadcast, we make an infinite loop of broadcasts.
          // So, we just...
          return;
        }
        for(var k = 0; k < this.clients.length; k++) this.clients[k].broadcast(msg, '('+this.name+':'+trace+')');
      }
    });
  },
  connect:function(client, url){
    var serv = this;
    client.room = null;
    client.UID = utilz.genUID(client);
    // On Login, UID becomes something like a salted hash of token.
    //   (which is their login, so we hash, else we tell everyone their login.)
    client.on('message', function (msg){
      console.log('CChat: peer '+client.UID+' sent a ('+msg.type+') message with a room of ('+client.room+').');
      if(client.room===null){
        if(msg.type==='binary'){
          client.broadcast('Echoing Binary message back: '+msg.binaryData.toString('hex'));
          console.log('CChat: Echoing Binary message back to '+client.UID+' -> '+msg.binaryData.toString('hex'));
          client.sendBytes(Buffer.from(msg.binaryData));//Echoing.
        } else {
          console.log('UnExpected Type.');
        }
      } else {
        if(msg.type==='utf8'){
          client.room.broadcast(client.displayName+':  '+msg.utf8Data+'<hr>', '<'+client.UID+'>');
          console.log('CChat('+client.room.name+'): '+client.UID+': '+msg.utf8Data);
        } else if(msg.type==='binary'){
          client.room.broadcast(client.displayName+' has used CMD #'+msg.binaryData[0], '<'+client.UID+'>');
          console.log('CChat('+client.room.name+'): Command from: '+client.UID+', '+msg.binaryData[0]);
        } else {
          console.log('CChat, How the fuck did we get here?');
        }
      }
    });
    client.broadcast = function(msg, trace){
      // trace example:
      //   (User room:(other room:(other other room:<source>)))
      client.sendUTF(msg);
    }
    client.leaveRoom = function(){
      if(!client.room){
        console.log('CChat: peer '+client.UID+' disconnected from Server.limbo');
        return;
      }
      console.log('CChat: Peer '+client.UID+' disconnected from room('+client.room.name+'), room user count:'+(client.room.clients.length-1)+'.');
      client.room.broadcast('<i>'+client.displayName+'</i> has <b>left</b>.<hr>', '<Server:('+client.UID+')>');
      // Remove the client from our clients.
      var at = client.room.clients.indexOf(client);
      if(at<0)
        console.log('CChat('+client.room.name+'): Can\'t find peer to remove them!');
      else
        client.room.clients.splice(at, 1);
      if(client.room.autoRemove==true)
        if(client.room.clients.length==0){
          console.log('CChat: Removing empty temp room: '+client.room.name);
          at = serv.rooms.indexOf(client.room);
          if(at<0)
            console.log('CChat: Can\'t find room('+client.room.name+') to remove it!');
          else
            serv.rooms.splice(at, 1);
        }
        client.room = null;
    }
    client.joinRoom = function(room){
      if(!room){
        // **
        // Clean this up with better error handling.
        //client.close(1007, 'No room in a Room only server!');
        console.log('CChat: Peer '+client.UID+' doesn\'t have a new room to join.');
        // **
        return;
      }
      if(client.room!=null)
        client.leaveRoom();
      client.room = room;
      room.clients.push(client);
      console.log('CChat: '+client.UID+' has joined room ('+room.name+'), room count:'+room.clients.length+'.');
      room.broadcast('<i>'+client.displayName+'</i> has <b>joined</b>.<hr>', '<Server:('+client.UID+')>');
    }
    client.on('close', function (reason, meaning){client.leaveRoom();});
    // Allow Server CMDs
    // Wait for user to join a room
    // **
    // Replace these with a holding area that gives Server command access. (Set Display name, Login, Join room, etc...)
    client.displayName = utilz.genNameBasic(client, url);
    client.joinRoom(utilz.ripRoom(client, url, serv));
    // **
  }
}