'use strict';

const Nextion = require('nextion');
// const nextion = require('../dist/index');

// CH340G usually shows up at this path on macOS
Nextion.fromPort('/dev/tty.SLAB_USBtoUART')
  .then(nextion => {
    console.log('Listening...');

    nextion.on('touchEvent', data => {
      console.log(data);
    });
  });
