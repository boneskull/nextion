'use strict';

const tessel = require('tessel');
const nextion = require('nextion');
// const nextion = require('../dist/index');

const uart = new tessel.port.A.UART({
  baudrate: 9600
});

nextion.createConnection({port: uart})
  .then(hmi => {
    console.log('Listening...');

    hmi.on('touchEvent', data => {
      console.log(data);
    });
  });
