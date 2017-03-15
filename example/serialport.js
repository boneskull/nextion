'use strict';

const Nextion = require('nextion');

// CH340G usually shows up at this path on macOS
Nextion.fromPort('/dev/tty.SLAB_USBtoUART')
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
