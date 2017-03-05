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

  write () {
  }

  close () {
    this.isClosed = true;
  }

  list (callback) {

  }
}

global.sinon = sinon;
global.expect = expect.clone()
  .use(unexpectedEventEmitter)
  .use(unexpectedSinon);
