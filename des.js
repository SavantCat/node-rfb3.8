var crypto = require('crypto');
var util = require('util');

var challenge = Buffer([
   0x0c, 0xfd, 0x6b, 0x8c,
   0x5c, 0x04, 0xb3, 0xe5,
   0x01, 0x40, 0xb9, 0xde,
   0x33, 0x9e, 0x0d, 0xdb
]);
var password = 'browsers';

//console.log("Text:"+util.inspect(challenge,false,null));
//console.log("password:"+util.inspect(password,false,null));

function ShiftByte(text) {
    var buf = new Buffer(text.length);
    for(var i=0;i<text.length;i++){
        var a = text.charCodeAt(i).toString(2);
        console.log("a:"+a);
        var b = parseInt(a+'0',2);
        console.log("b:"+b.toString(2));
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
    console.log('text : '+text.length+':'+util.inspect(Buffer(text),false,null)+' [Shift]-> '+util.inspect(buf,false,null));
    return buf;
}

MakeResponse2(password,challenge);

// 暗号化
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
        
        //var cipher = crypto.createCipher('des-ecb', pass);
        var cipher = crypto.createCipheriv('des-ecb', pass, '');
       cipher.setAutoPadding(false);
        
        var response = new Buffer(cipher.update(challenge,'binary'));
        //console.log(cipher.final('binary'));
        
        console.log(
                    'Password : '+pass.length+':'+util.inspect(Buffer(password),false,null)+' [Shift]-> '+util.inspect(pass,false,null)+'\n'+
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

                var buf = new Buffer(5);
                buf.writeUInt16BE(500, 0);
                
  
                
                console.log(buf);


/*
var flip = [ 0, 128, 64, 192, 32, 160, 96, 224, 16, 144, 80, 208, 48, 176, 112, 240,
             8, 136, 72, 200, 40, 168, 104, 232, 24, 152, 88, 216, 56, 184, 120, 248,
             4, 132, 68, 196, 36, 164, 100, 228, 20, 148, 84, 212, 52, 180, 116, 244,
             12, 140, 76, 204, 44, 172, 108, 236, 28, 156, 92, 220, 60, 188, 124, 252,
             2,  130, 66, 194, 34, 162, 98,  226, 18, 146, 82, 210, 50, 178, 114, 242,
             10, 138, 74, 202, 42, 170, 106, 234, 26, 154, 90, 218, 58, 186, 122, 250,
              6, 134, 70, 198, 38, 166, 102, 230, 22, 150, 86, 214, 54, 182, 118, 246,
             14, 142, 78, 206, 46, 174, 110, 238, 30, 158, 94, 222, 62, 190, 126, 254,
              1, 129, 65, 193, 33, 161, 97, 225, 17, 145, 81, 209, 49, 177, 113, 241,
              9, 137, 73, 201, 41, 169, 105, 233, 25, 153, 89, 217, 57, 185, 121, 249,
              5, 133, 69, 197, 37, 165, 101, 229, 21, 149, 85, 213, 53, 181, 117, 245,
             13, 141, 77, 205, 45, 173, 109, 237, 29, 157, 93, 221, 61, 189, 125, 253,
              3, 131, 67, 195, 35, 163, 99, 227, 19, 147, 83, 211, 51, 179, 115, 243,
             11, 139, 75, 203, 43, 171, 107, 235, 27, 155, 91, 219, 59, 187, 123, 251,
              7, 135, 71, 199, 39, 167, 103, 231, 23, 151, 87, 215, 55, 183, 119, 247,
             15, 143, 79, 207, 47, 175, 111, 239, 31, 159, 95, 223, 63, 191, 127, 255 ];

console.log('text:'+flip[41]);
*/
