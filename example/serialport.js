'use strict';

const nextion = require('nextion');
// const nextion = require('../dist/index');

// CH340G usually shows up at this path on macOS
nextion.createConnection({
  port: '/dev/tty.SLAB_USBtoUART',
  baudRate: 9600
})
  .then(hmi => {
    console.log('Listening...');

    hmi.on('touchEvent', data => {
      console.log(data);
    });
  });
