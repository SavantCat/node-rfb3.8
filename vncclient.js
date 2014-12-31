var util = require('util');
var crypto = require('crypto');
//var png = require('./node_modules/png/build/Release/png');
//var ciphers = crypto.getCiphers();
//console.log(ciphers);

var options = {
        host:'192.168.56.101',
        port:'5902'
};
 
var password = 'savant';
 
var net = require('net');
var client = new net.Socket();
var bufs = [];
function ShiftByte(text) {
    var buf = new Buffer(text.length);
    for(var i=0;i<text.length;i++){
        var a = text.charCodeAt(i).toString(2);
        //console.log("a:"+a);
        var b = parseInt(a+'0',2);
        //console.log("b:"+b);
        buf[i] = b;
    }
    return buf;
}

function ReverseByte(text) {
        if (text.length < 8) {
                for(var i=0;i<=(8-text.length);i++){
                        text += '\0';       
                }
        }

        var buf = new Buffer(text.length);
        for(var i=0;i<text.length;i++){
            var b1 = text.charCodeAt(i).toString(2);
            var tmp = '';
            for(var t=0;t<b1.length;t++){
                tmp += b1[b1.length-1-t];
            }
            var b2 = parseInt(tmp+'0',2);
            //console.log(b1 +' -> '+b2.toString(2));
            buf[i] = b2;
        }
        return buf;
}

function MakeResponse(password,challenge) {
        var pass = ShiftByte(password);
        var cipher = crypto.createCipher('DES-ECB', pass);
        cipher.setAutoPadding(auto_padding=false);
    
        var a = challenge.slice(0, 8);
        var b = challenge.slice(8, 16);
        var response1 = cipher.update(a,'binary');    
        var response2 = cipher.update(b,'binary');
        var response = Buffer.concat([response1,response2]);
        
        console.log(
                    'Password : '+pass.length+':'+util.inspect(new Buffer(password),false,null)+' [Shift]-> '+util.inspect(pass,false,null)+'\n'+
                    'challenge:'+challenge.length+':'+util.inspect(challenge,false,null)+'\n'+
                    '[0-08]   :'+a.length+':'+util.inspect(a,false,null)+' -> '+util.inspect(response1,false,null)+'\n'+
                    '[8-16]   :'+b.length+':'+util.inspect(b,false,null)+' -> '+util.inspect(response2,false,null)+'\n'+
                    'DES      :'+response.length+':'+util.inspect(response,false,null)
                    );
    

    
   // console.log("0-08:"+util.inspect(response1,false,null));
    //console.log("8-16:"+util.inspect(response2,false,null));
        
    return response;
}

function MakeResponse2(password,challenge) {
        var pass = ReverseByte(password);
        //var pass = new Buffer(password);
        
        var cipher = crypto.createCipher('DES-ECB', pass);
        cipher.setAutoPadding(auto_padding=false);
        
        var response = new Buffer(cipher.update(challenge,'binary'));
        //console.log(cipher.final('binary'));
        
        console.log(
                    'Password : '+pass.length+':'+util.inspect(new Buffer(password),false,null)+' [Shift]-> '+util.inspect(pass,false,null)+'\n'+
                    'challenge:'+challenge.length+':'+util.inspect(challenge,false,null)+'\n'+
                    'DES      :'+response.length+':'+util.inspect(response ,false,null)
                    );
        /*
        var decipher = crypto.createDecipher('des-ecb', pass);
        decipher.setAutoPadding(auto_padding=false);
        var dec = decipher.update(response , 'binary');
        var text = new Buffer(dec);
        console.log('text     :'+text.length+':'+util.inspect(text,false,null));
        */
        //var result = "";
        //for(var i=0;i<response.length;i++){
        //       result += ('\\u00' + response[i].toString(16));
        //}
        //console.log(response);
        return response;
}

function MakeResponse3(password,challenge) {
        var pass = ReverseByte(password);
        var cipher = crypto.createCipheriv('des-ecb', pass, '');
        cipher.setAutoPadding(false);
        var response = new Buffer(cipher.update(challenge,'binary'));        
        console.log(
                    'Password : '+pass.length+':'+util.inspect(Buffer(password),false,null)+' [Shift]-> '+util.inspect(pass,false,null)+'\n'+
                    'challenge:'+challenge.length+':'+util.inspect(challenge,false,null)+'\n'+
                    'DES      :'+response.length+':'+util.inspect(response ,false,null)
                    );
        return response;
}

client.connect(options, function(){
  console.log('client-> connected to server');
  //client.write('Who needs a browser to communicate?');
});

 
client.on('connect', function(){
  console.log('connected');
});

var mode = 0;
var buf;

var vncserver = {};
var pixel_data;



client.on('data', function(data){
   console.log("["+mode+"]Message -> "+data.length+':',data);
    switch(mode){
        case 0:
                if (data.toString() == 'RFB 003.008\n') {
                        client.write('RFB 003.008\n');
                        mode++;
                }          
                break;
        case 1:
                if (data[0] > 0) {
                        for(var i=1;i<data.length;i++){
                                if (data[i] == 2) {
                                        client.write(new Buffer('\u0002'));
                                        mode++;
                                }
                        }
                }else{
                    console.log("["+mode+"]Error:"+data);
                }
                break;
        case 2:
                client.write(MakeResponse3(password,data));
                mode++;
                break;
        case 3:
                client.write(new Buffer('\u0001'));
                mode++;
                break;
        case 4:
                console.log(data);
                vncserver['width']  = data.slice(0,2).readUInt16BE(0);
                vncserver['height'] = data.slice(2,4).readUInt16BE(0);
                var pixel_format = data.slice(4,20);
                vncserver['pixel_format'] = {
                        'bits_per_pixel'  :data.slice( 4, 5).readUInt8(0),
                        'depth'           :data.slice( 5, 6).readUInt8(0),
                        'big_endian_flag' :data.slice( 6, 7).readUInt8(0),
                        'true_colour_flag':data.slice( 7, 8).readUInt8(0),
                        
                        'red_max'         :data.slice( 8,10).readUInt16BE(0),
                        'green_max'       :data.slice(10,12).readUInt16BE(0),
                        'blue_max'        :data.slice(12,14).readUInt16BE(0),
                        
                        'red_shift'       :data.slice(14,15).readUInt8(0),
                        'green_shift'     :data.slice(15,16).readUInt8(0),
                        'blue_shift'      :data.slice(16,17).readUInt8(0),
                        //17-20
                }
                vncserver['name_size'] = data.slice(20,24).readUInt32BE(0);
                vncserver['name'] = data.slice(24).toString();
                console.log(vncserver);
                
                var buf = new Buffer(20);//SetPixelFormat
                buf.fill(0);
                
                buf.writeUInt8(0x0,0);
                
                buf.writeUInt8(0x0,1);
                buf.writeUInt8(0x0,2);
                buf.writeUInt8(0x0,3);
                
                buf.writeUInt8(vncserver.pixel_format.bits_per_pixel,4);
                buf.writeUInt8(vncserver.pixel_format.depth,5);
                buf.writeUInt8(vncserver.pixel_format.big_endian_flag,6);
                
                vncserver.pixel_format.true_colour_flag = 0;
                
                buf.writeUInt8(vncserver.pixel_format.true_colour_flag,7);
                
                buf.writeUInt16BE(vncserver.pixel_format.red_max,8);//8-10
                buf.writeUInt16BE(vncserver.pixel_format.green_max,10);//10-12
                buf.writeUInt16BE(vncserver.pixel_format.blue_max,12);//12-14
                
                buf.writeUInt8(vncserver.pixel_format.red_shift,14);
                buf.writeUInt8(vncserver.pixel_format.green_shift,15);
                buf.writeUInt8(vncserver.pixel_format.blue_shift,16);               
                
                buf.writeUInt8(0x0,17);
                buf.writeUInt8(0x0,18);
                buf.writeUInt8(0x0,19);
                
                client.write(buf);
                console.log('SetPixelFormat:',buf);
/*
                var buf = new Buffer(8);// SetEncodings
                buf.writeUInt8(2,0);
                buf.writeUInt8(0,1);
                buf.writeUInt16BE(0,2);
                buf.writeInt32LE(0,4);       
                
                client.write(buf);
                console.log('SetEncodings:',buf);
*/
                var buf = new Buffer(10);//FramebufferUpdateRequest
                buf.writeUInt8(3,0);
                buf.writeUInt8(0,1);
                buf.writeUInt16BE(100,2);
                buf.writeUInt16BE(0,4);
                buf.writeUInt16BE(vncserver.width,6);
                buf.writeUInt16BE(vncserver.height,8);
                
                client.write(buf);
                console.log('FramebufferUpdateRequest:',buf);
                
                mode++;
                break;
        case 5:
                
                
                switch (data[0]) {
                        case 0:
                                mode = 6;
                                bufs = [];
                                break;
                        case 1:
                                mode = 7;
                                bufs = [];
                                break;
                }

                break;
        case 6:
                bufs.push(data);
                pixel_data = Buffer.concat(bufs, bufs.totalLength);
                console.log(pixel_data.length);
                break;
        case 7:
                bufs.push(data);
                pixel_data = Buffer.concat(bufs, bufs.totalLength);
                console.log(pixel_data.length);
                break;
    }
});

client.on('error', function(data){

               
});

client.on('end', function(){
  console.log('end');
});

client.on('close', function(){
  console.log('client-> connection is closed');
});

process.stdin.resume();
process.stdin.setEncoding('utf8');
// 標準入力がくると発生するイベント
process.stdin.on('data', function (chunk) {
                var buf = new Buffer(10);
                buf.writeUInt8(3,0);
                buf.writeUInt8(0,1);
                buf.writeInt16BE(0,2);
                buf.writeInt16BE(0,4);
                buf.writeInt16BE(vncserver.width,6);
                buf.writeInt16BE(vncserver.height,8);
                
                client.write(buf);
                console.log('FramebufferUpdateRequest:',buf);
});

