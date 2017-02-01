const {createProtocol} = require('bin-protocol');
const {commands} = require('./commands');
const _ = require('lodash/fp');

const NextionProtocol = createProtocol();

NextionProtocol.define('response', {
  read () {
    this.commandName('command');
    const {command} = this.context;
    this[command]('data');
    return {
      command,
      data: this.context.data
    };
  }
});

NextionProtocol.define('commandName', {
  read() {
    this.UInt8('command_value');
    if (!commands[this.context.command_value]) {
      throw new Error('Unknown command');
    }
    this.context.command = _.camelCase(commands[this.context.command_value]);
  }
});

NextionProtocol.define('touch', {
  read() {
    this.UInt8('page_id')
      .UInt8('button_id')
      .UInt8('release_event');
    this.context.release_event = Boolean(this.context.release_event);
  }
});

NextionProtocol.define('pageId', {
  read () {
    this.UInt8('page_id');
  }
});

exports.NextionProtocol = NextionProtocol;
