// Simple Echo Server
module.exports={
  // Our name
  name:'echo',
  disp:'Echo Connection',
  connect:function(connection, url){
    // Get a basic display name for the connection
    connection.displayName = require('/app/util.js').genNameBasic(connection, url);
    // Handler for messages from our client.
    connection.on('message', function(message) {
      if (message.type === 'utf8') {// If text
        // Log
        console.log('Echo: Received Message('+connection.displayName+'): ' + message.utf8Data);
        // Echo
        connection.sendUTF(''+connection.displayName+':  '+message.utf8Data+'<hr>');
      } else if (message.type === 'binary') {// If data
        // Log size
        console.log('Echo: Received Binary Message of ' + message.binaryData.length + ' bytes');
        // Echo
        connection.sendBytes(message.binaryData);
      }
    });
    // When we get a closed
    connection.on('close', function(reasonCode, description) {
      // Log it? ¯\_(ツ)_/¯
      console.log('Echo: Peer ' + connection.displayName + ' disconnected.');
    });
  }
}