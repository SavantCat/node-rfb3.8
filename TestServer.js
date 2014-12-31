var rfb = require('rfb3.8');

var r = new rfb();

var password = 'savant';

r.connect('192.168.56.101','5902',password);

r.events.on('connected',function(data){
    console.log('client -> Authentication success');
    console.log(data);
    r.SetPixelFormat();
    r.SetEncodings();
    r.FramebufferUpdateRequest(0,0,0,r.info.width,r.info.height);
});



