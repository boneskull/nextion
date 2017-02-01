'use strict';

const chai = require('chai');
const {EventEmitter} = require('events');
const sinon = require('sinon');

class MockSerialPort extends EventEmitter {
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

exports.MockSerialPort = MockSerialPort;

global.expect = chai.use(require('sinon-chai')).expect;
global.sinon = sinon;

