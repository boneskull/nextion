import _ from 'lodash/fp';

export const codes = {
  0x00: 'invalidInstruction',
  0x01: 'success',
  0x02: 'invalidComponentID',
  0x03: 'invalidPageID',
  0x04: 'invalidPictureID',
  0x05: 'invalidFontID',
  0x11: 'invalidBaudRate',
  0x65: 'touchEvent',
  0x66: 'pageId',
  0x67: 'touchCoordinate',
  0x68: 'wake',
  0x70: 'stringData',
  0x71: 'numericData',
  0x87: 'autoSleep',
  0x88: 'autoWake',
  0x89: 'cardUpgrade',
  0xfd: 'transmitFinished',
  0xfe: 'transmitReady'
};

export const codesByName = _.pipe(_.invert, _.mapValues(_.toNumber))(codes);
