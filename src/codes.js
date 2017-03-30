import _ from 'lodash/fp';

/**
 * Maps of instruction codes, namespaced by type.
 * @private
 */
const codes = {
  responseCodes: {
    0x00: 'invalidInstruction',
    0x01: 'success',
    0x02: 'invalidComponentID',
    0x03: 'invalidPageID',
    0x04: 'invalidPictureID',
    0x05: 'invalidFontID',
    0x11: 'invalidBaudRate',
    0x12: 'invalidCurveControl',
    0x1a: 'invalidVariableName',
    0x1b: 'invalidVariableOperation',
    0x1c: 'assignmentFailure',
    0x1d: 'eepromFailure',
    0x1e: 'invalidParameterQuantity',
    0x1f: 'ioOperationFailure',
    0x20: 'undefinedEscapeCharacter',
    0x23: 'variableNameTooLong',
    0x70: 'stringData',
    0x71: 'numericData'
  },
  eventCodes: {
    0x65: 'touchEvent',
    0x66: 'pageId',
    0x67: 'touchCoordinate',
    0x68: 'touchCoordinateOnWake',
    0x86: 'autoSleep',
    0x87: 'autoWake',
    0x88: 'startup',
    0x89: 'cardUpgrade',
    0xfd: 'transmitFinished',
    0xfe: 'transmitReady'
  }
};

/**
 * Map of "event" instruction codes
 * @private
 * @type {Map}
 */
export const eventCodeMap = new Map(_.toPairs(codes.eventCodes));

/**
 * Map of "response" instruction codes
 * @private
 * @type {Map}
 */
export const responseCodeMap = new Map(_.toPairs(codes.responseCodes));
