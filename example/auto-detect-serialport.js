'use strict';

const Nextion = require('nextion');

// we'll make a WAG at what port it's on
Nextion.create()
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
