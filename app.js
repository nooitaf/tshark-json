
var spawn = require('child_process').spawn,
   colors = require('colors'),
       fs = require('fs'),
	      _ = require('underscore'),
   tshark = spawn('tshark',['-i','en0','-c','10']);
 //tshark = spawn('tshark',['-i','en1']);


console.log('started');


var crap = '';
var chunkParts = [];


// ---------------------------------------------- tshark on data
tshark.stdout.on('data', function (chunk) {

  // - - - - - - - - - - - - - - - - raw data log
  process.stdout.write(
    'data: '.yellow + 
    '\n' + 
    chunk + 
    '\n\n'
  );
 
  // - - - - - - - - - - - - - - - - miserably trying to pick the "good parts"
  crap = '' + crap + chunk;
  chunkParts = crap.split('\n');
  crap = chunkParts.pop();
  for (var i = 0; i < chunkParts.length; i++) {
  	
    // -  -  -  -  -  -  -  -  -  -  json
  	var part = chunkParts[i].split(' ');
  	while (!part[0]) part.shift();
  	//console.log(part);
  	
  	var json = {
  		time: part[0],
  		from: part[1],
  		to:   part[3],
  		type: part[4],
  		port: part[5]
   	}
  		
    console.log(JSON.stringify(json));

    // -  -  -  -  -  -  -  -  -  -  gource
  	var color = 'FFFFFF';
  	if (json.type == 'TCP') color = 'DD2200';
  	if (json.type == 'UDP') color = '666600';
  	if (json.type == 'DNS') color = 'FFFF00';
  	if (json.type == 'HTTP') color = '00FF00';
  	
    var gourceData = "";
  	gourceData = "" + 
      parseInt(json.time) + 
      new Date().getTime() + 
      "|" + 
      json.type + 
      "|M|" + 
      json.type + 
      "/" + 
      json.from.toString().replace(/\./g,"/") + 
      "/" + 
      json.to.toString().replace(/\./g,"/") + 
      "|" + 
      color 
    ;
  }

  // - - - - - - - - - - - - - - - - write chunks log
  fs.appendFile('chunks.log', chunkParts[i] + '\n', function (err) {
      if (err) throw err;
  });

  // - - - - - - - - - - - - - - - - reset chunks
  chunkParts = [];
});

// ---------------------------------------------- tshark error
tshark.stderr.on('data', function (data) {
  console.log('grep stderr: ' + data);
});

// ---------------------------------------------- tshark on exit
tshark.on('exit', function (code) {
  if (code !== 0) {
    console.log('tshark process exited with code ' + code);
  }
});

