import expect from 'unexpected';
import sinon from 'sinon';
import {EventEmitter} from 'events';
import unexpectedSinon from 'unexpected-sinon';

export class MockSerialPort extends EventEmitter {
  constructor (path) {
    super();
    this.path = path;
    this.isClosed = false;
  }

  write () {
  }

  close () {
    this.isClosed = true;
  }

  list (callback) {

  }
}

const ee = {
  name: 'unexpected-eventemitter',
  version: '0.0.0',
  installInto (expect) {
    expect.addType({
      base: 'any',
      name: 'EventEmitter',
      identify (obj) {
        return obj !== null && typeof obj === 'object' &&
          typeof obj.emit === 'function' && typeof obj.once === 'function' &&
          typeof obj.on === 'function';
      },
      inspect (subject, depth, output) {
        output.text('EventEmitter');
      }
    });

    expect.addAssertion('<function> [not] to emit from <EventEmitter> <string>',
      (expect, subject, eventEmitter, eventName) => {
        let emitted = false;

        eventEmitter.once(eventName, () => {
          emitted = true;
        });

        expect.errorMode = 'nested';
        expect.errorMode = 'default';
        expect(emitted, '[not] to be truthy');
      });
  }
};

global.sinon = sinon;

global.expect = expect.clone().use(ee).use(unexpectedSinon);
