var app;
module.exports = {
  name:'Web Site Sub Servers',
  init:function(server, acceptor){app=server;},
  loadSubs:function(){
    require('/app/util.js').forEachFile('/app/web/', function(file){
      console.group();
      console.log('Loading MiniServ: web/'+file);
      var serv2B = require('/app/web/'+file)
      console.log('Hooking MiniServ - '+serv2B.name);
      app.get('/'+serv2B.cmd+'/*', serv2B.handler);
      miniServs.push(serv2B);
      console.groupEnd();
    });
  }
};
/*
app.get('/', function(request, response) {
  response.sendFile(__dirname + '/views/index.html');
});
*/
var miniServs = [];