'use strict';

const tessel = require('tessel');
const input = new tessel.port.A.UART({
  baudrate: 57600
});
const output = new tessel.port.B.UART({
  baudrate: 57600
});

input.pipe(output).pipe(input);
