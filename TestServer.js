var rfb = require('rfb3.8');

var r = new rfb();

var password = 'savant';

r.connect('192.168.56.101','5902',password);

r.events.on('connected',function(data){
    console.log('client -> Authentication success');
    console.log(data);
    
    r.info.pixel_format.big_endian_flag = 1;
    r.info.pixel_format.true_colour_flag =　1;
    
    r.SetPixelFormat();
    r.SetEncodings();
    r.FramebufferUpdateRequest(0,0,0,r.info.width,r.info.height);
});

r.events.on('data',function(data){
    console.log(data.length+':',data);
    var fs = require('fs');
    fs.writeFile('data.txt', data , function (err) {
        console.log(err);
    });
});


