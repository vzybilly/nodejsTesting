
var FS = require('fs');

module.exports={
  name:'Simple Folder Listing',
  cmd:'ls',
  handler:function(request, response){
    var url = request.path.substring(1);
    if(url.startsWith('ls')){
      url = url.substring(2);
      if(!url.endsWith('/'))url+='/';
      var items = FS.readdirSync('.'+url, {withFileTypes:true});
      var dirNodes = {files:[],dirs:[]};
      for (var i=0; i<items.length; i++) {
        try{var item = FS.statSync('.'+url+items[i]);}
        catch(w){
          console.log(w);
          continue;
        }
        //console.log('  -'+item+' is '+item.isDirectory()+' ('+items[i]+').');
        if(item.isDirectory()) dirNodes.dirs.push(items[i]);
        if(item.isFile()) dirNodes.files.push(items[i]);
      }
      
      var resp = '<html><head><title>~'+url+'</title></head><body><h1>~'+url+'</h1><a href="/ls'+url+'..">Up a Level.</a><hr>';
      
      resp+='<h2>Directories</h2>';
      for(i=0; i<dirNodes.dirs.length; i++) resp+='<a href="/ls'+url+dirNodes.dirs[i]+'">'+dirNodes.dirs[i]+'</a><br>';
      
      resp+='<hr><h2>Files</h2>';
      for(i=0; i<dirNodes.files.length; i++) resp+=dirNodes.files[i]+'<br>';
      
      resp+='<hr></body></html>';
      //console.log(resp);
      response.send(resp);
    }
  }
}