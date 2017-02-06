'use strict';

const {EventEmitter} = require('events');
const {NextionProtocol} = require('./protocol');
const _ = require('lodash');

class Nextion extends EventEmitter {
  constructor (port, opts = {}) {
    super();
    this.port = port;
    this.protocol = new NextionProtocol();

    if (_.isFunction(port.isOpen) && !port.isOpen()) {
      port.on('open', () => {
        this.listen();
      });
    } else {
      this.listen();
    }

    port.on('error', err => {
      this.emit('error', err);
    });
  }

  listen () {
    this.port.on('data', data => {
      let result;
      try {
        result = this.protocol.read(Buffer.from(data))
          .response().result;
        this.emit(result.command, result.data);
      } catch (err) {
        this.emit('error', err);
      }
    });
  }
}

exports.Nextion = Nextion;
