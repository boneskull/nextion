'use strict';

const nextion = require('nextion');
// const nextion = require('../dist/index');

nextion.createConnection()
  .then(hmi => {
    console.log('Listening...');

    hmi.on('touchEvent', data => {
      console.log(data);
    });
  });
