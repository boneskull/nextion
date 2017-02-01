const {EventEmitter} = require('events');
const {NextionProtocol} = require('./protocol');
const _ = require('lodash');

class Nextion extends EventEmitter {
  constructor (serialport) {
    super();
    this.serialport = serialport;
    this.protocol = new NextionProtocol();

    if (_.isFunction(serialport.isOpen) && !serialport.isOpen()) {
      serialport.on('open', () => {
        this.listen();
      });
    } else {
      this.listen();
    }

    serialport.on('error', err => {
      this.emit('error', err);
    });
  }

  listen () {
    serialport.on('data', data => {
      let result;
      try {
        result = protocol.read(Buffer.from(data))
          .response().result;
      } catch (err) {
        this.emit('error', err);
      }
      const {command, data} = result;
      this.emit(command, data);
    })
  }
}

exports.Nextion = Nextion;
