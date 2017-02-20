'use strict';

const tessel = require('tessel');
const Nextion = require('nextion');
// const nextion = require('../dist/index');

const uart = new tessel.port.A.UART({
  baudrate: 9600
});

Nextion.fromSerial(uart)
  .then(nextion => {
    console.log('Listening...');

    nextion.on('touchEvent', data => {
      console.log(data);
    });
  });
