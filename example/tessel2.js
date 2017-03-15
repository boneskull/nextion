'use strict';

const tessel = require('tessel');
const Nextion = require('nextion');

const uart = new tessel.port.A.UART({
  baudrate: 9600
});

Nextion.fromSerial(uart)
  .then(nextion => {
    console.log('Ready!');
    nextion.system.setNoTouchSleepTimer(10000)
      .then(() => {
        console.log('Device will sleep after 10 seconds w/o user interaction.');
        nextion.on('autoSleep', () => {
          console.log('Sleeping again?');

          setTimeout(() => {
            nextion.system.wake()
              .then(() => {
                console.log('Rise and shine!');
              });
          }, 5000);
        });
      });
  });
