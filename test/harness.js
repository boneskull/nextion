import expect from 'unexpected';
import sinon from 'sinon';
import {EventEmitter} from 'events';
import unexpectedSinon from 'unexpected-sinon';
import unexpectedEventEmitter from 'unexpected-eventemitter';

export class MockSerialPort extends EventEmitter {
  constructor (path) {
    super();
    this.path = path;
    this.isClosed = false;
  }

  write (data, callback) {
    process.nextTick(callback);
  }

  close (callback) {
    this.isClosed = true;
    process.nextTick(callback);
  }

  list (callback) {
    process.nextTick(callback);
  }

  drain (callback) {
    process.nextTick(callback);
  }
}

global.sinon = sinon;
global.expect = expect.clone()
  .use(unexpectedEventEmitter)
  .use(unexpectedSinon);
