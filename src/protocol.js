'use strict';

const {createProtocol} = require('bin-protocol');
const {commands} = require('./commands');
const _ = require('lodash');

const NextionProtocol = createProtocol(function () {
  const reset = this.reader.reset;
  this.reader.reset = function (buf) {
    if (buf.slice(buf.length - 3)
        .equals(Buffer.from([
          0xff,
          0xff,
          0xff
        ]))) {
      return reset.call(this, buf.slice(0, -3));
    }
    return reset.call(this, buf);
  };
});

const definitions = {
  byte: {
    read (name) {
      this.UInt8(name);
    }
  },
  response: {
    read () {
      this.commandName();
      const {command} = this.context;
      if (!_.isFunction(this[command])) {
        throw new ReferenceError(`Unknown command "${command}"`);
      }
      this[command]('data');
      return {
        command,
        data: this.context.data
      };
    }
  },
  commandName: {
    read () {
      this.byte('command_value');
      if (!commands[this.context.command_value]) {
        throw new Error('Unknown command');
      }
      this.context.command = commands[this.context.command_value];
    }
  },
  touchEvent: {
    read () {
      this.byte('page_id')
        .byte('button_id')
        .byte('release_event');
      this.context.release_event = Boolean(this.context.release_event);
    }
  },
  pageId: {
    read () {
      this.byte('page_id');
    }
  },
  touchCoordinate: {
    read () {
      this.byte('x_high')
        .byte('x_low')
        .byte('y_high')
        .byte('y_low')
        .touchEvent();
    }
  },
  wake: {
    read (name) {
      this.touchCoordinate(name);
    }
  },
  stringData: {
    read () {
      this.context.value = this.buffer.toString();
    }
  },
  numericData: {
    read () {
      this.Int16LE('value');
    }
  },
  autoSleep: {
    read () {
    }
  },
  autoWake: {
    read () {
    }
  },
  cardUpgrade: {
    read () {
    }
  },
  transmitFinished: {
    read () {
    }
  },
  transmitReady: {
    read () {
    }
  },
  startup: {
    read () {
    }
  }
};

Object.keys(definitions)
  .forEach(name => {
    NextionProtocol.define(name, definitions[name]);
  });

exports.NextionProtocol = NextionProtocol;
