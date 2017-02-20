export const name = 'unexpected-eventemitter';
export const version = '0.0.0';

export function installInto (expect) {
  expect.addAssertion('<function> [not] to emit from <EventEmitter> <string>',
    (expect, subject, eventEmitter, eventName) => {
      let emitted = false;

      expect.errorMode = 'nested';

      eventEmitter.once(eventName, () => {
        emitted = true;
      });

      try {
        subject();
        if (expect.flags.not) {
          expect(emitted, 'not to be truthy');
        } else {
          expect(emitted, 'to be truthy');
        }
      } catch (err) {
        expect.fail({
          output (output) {
            output.error('threw: ').appendErrorMessage(err);
          },
          originalError: err
        });
      }
    });

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
}
