'use strict';

const Nextion = require('nextion');
// const nextion = require('../dist/index');

Nextion.create()
  .then(nextion => {
    console.log('Listening...');

    nextion.on('touchEvent', data => {
      console.log(data);
    });
  });
