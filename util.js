module.exports.forEachFile = function (directory, callback){
// Find all files in my dir.
  var items = require('fs').readdirSync(directory);
  // Look at each individual file.
  for (var i=0; i<items.length; i++) callback(items[i]);
}

module.exports.ripRoom = function(usr, oriurl, srv){
  var url = oriurl.substring(oriurl.indexOf('/')+1);
  url = url.substring(0, url.indexOf('/'));
  for(var k = 0; k < srv.rooms.length; k++)
    if(srv.rooms[k].name == url)
      return srv.rooms[k];
  if(url.length<2)
    return;
  // No Room, make Temp.
  srv.makeRoom(url, true);
  return module.exports.ripRoom(usr,oriurl,srv);
}

// Make a generic UID
module.exports.genUID = function(sock){
  // Set a basic raw name from their address
  var addressName = genIPID(sock.remoteAddress).toString(36).toUpperCase();
  var portName = sock.socket.remotePort.toString(36).toUpperCase();
  return addressName+'~'+portName;
  // UID contains '~' means non-logged in
  // UID contains '$' means logged in (registered)
}
function genIPID(name){
  // Check if it's in IPv4 format
  if(name.indexOf('.')>0){// We're IPv4
    // Split the bytes of the IP out.
    var rema = name.split('.');
    return (rema[3]+256*(rema[1]+256*(rema[2]+256*rema[0]))).toString(36).toUpperCase();
  }
}

// Make a display name from url or IPv4
module.exports.genNameBasic = function(sock, url){
  if(!sock.UID)module.exports.genUID(sock);
  //console.log('nam:'+url);
  //url = url.substring(1);// purge leading '/'
  var res = '';
  //console.log('nam('+url+')');
  var lio = url.lastIndexOf('/')+1;
  if(lio>0){
    url = url.substring(lio);
    lio = url.indexOf('$');
    if(lio > 0){
      var colour = url.substring(lio+1);
      url = url.substring(0, lio);
      res = '<span style=\'font-weight:bold;color:#'+colour.charAt(0)+'7'+colour.charAt(1)+'7'+colour.charAt(2)+'7\'>'+url+'</span>';
      console.log('Client('+sock.UID+') is naming themselves: '+res); return res;
    } else {
      res = '<span style=\'font-weight:bold;\'>'+url+'</span>';
      console.log('Client('+sock.UID+') is naming themselves: '+res); return res;
    }
  }
  
  // At this point, we know there's no name in the url.
  
  // Set a basic raw name from their address
  var name = sock.remoteAddress
  var port = sock.socket.remotePort.toString(36).toUpperCase();
  // Check if it's in IPv4 format
  if(name.indexOf('.')>0){// We're IPv4
    // Split the bytes of the IP out.
    var rema = name.split('.');
    //
    // Bits via numbers [256, 128, 64, 32, 16, 8, 4, 2]
    //                  [  8,   7,  6,  5,  4, 3, 2, 1]
    //
    // Use up the bytes && bits that we aren't using for the colour.
    var num = ((((256*rema[3])+rema[2])*128)+(rema[1]%128)).toString(36).toUpperCase();
    // Make our makeshift colour with 3 bits per channel
    var cNum= rema[0] + (2*(rema[1]-(rema[1]%128)));
    // Get our individual channels
    var red,green,blue = 0;
    // Rip our blue && Shift.
    blue = cNum%8; cNum=cNum/8;
    // Rip our green && Shift.
    green= cNum%8; cNum=cNum/8;
    // Rip our red, last bit of cNum should be used here but be safe.
    red  = cNum%8;
    // Colours are three bit numbers
    // Validate turns them in 8 bit numbers.
    var validate = function (cv){
      // make (4 bit)+1 (we want alittle bit of a number so 0 isn't 0 and full isn't full.)
      cv=(cv*2)+1;
      // make 8 bits && return.
      return cv*16;
    }
    // Validate all the channels.
    blue=validate(blue);
    green=validate(green);
    red=validate(red);
    // Debug line to make sure numbers are decent.
    // rem+='('+red+','+green+','+blue+'):'+num;
    // make our user name with pretty colours.
    res = '<span style=\'font-weight:bold;color:rgb('+red+','+green+','+blue+')\'>Guest('+num+'@'+port+')</span>';
    console.log('Client('+sock.UID+') is naming themselves: '+res); return res;
  }
  // Return the name as fancy as we could make it.
  res = name+'@'+port;
  console.log('Client('+sock.UID+') is naming themselves: '+res); return res;
}