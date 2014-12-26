var util = require('util');
var crypto = require('crypto');

var ciphers = crypto.getCiphers();
console.log(ciphers);

var options = {
        host:'192.168.56.101',
        port:'5902'
    };
 
var password = new Buffer('savant','binary');
 
var net = require('net');
var client = new net.Socket();

client.setEncoding('utf8');
client.connect(options, function(){
  console.log('client-> connected to server');
  //client.write('Who needs a browser to communicate?');
});

 
client.on('connect', function(){
  console.log('connected');
  
});

var mode = 0;
var buf;
client.on('data', function(data){
    buf = new Buffer(data);
    console.log("["+mode+"]Message -> "+util.inspect(data,false,null));
    switch(mode){
        case 0:
            if (data == 'RFB 003.008\n') {
              client.write('RFB 003.008\n');
              mode++;
            }          
            break;
        case 1:
            if (buf[0] > 0) {
                for(var i=1;i<buf.length;i++){
                    if (buf[i] == 2) {
                        client.write('\u0002');
                        mode++;
                    }
                }
            }else{
                console.log("["+mode+"]Error:"+data);
            }
            break;
        case 2:
            var cipher = crypto.createCipher('des', password);
            cipher.update(data);
            var test = cipher.update(data)+cipher.final('hex');
            console.log("DES:"+util.inspect(test,false,null));
            
            var decipher = crypto.createDecipher('des', password);
            decipher.update(test, 'hex', 'utf8');
            var dec = decipher.final('utf8');
            console.log("charrenge:"+util.inspect(dec,false,null));
            //client.write(test);
            mode++;
            break;
    }
});

client.on('error', function(data){
  console.log('error-> ' + data);
});
/*
client.on('end', function(data){
  console.log('end-> ' + data);
});
*/
client.on('close', function(){
  console.log('client-> connection is closed');
});