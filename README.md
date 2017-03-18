# nextion

> Communicate with ITEAD's Nextion HMI Devices

![pic of nextion device](https://cldup.com/clEx6-8m6M.png)

## Status

- [x] Support [return data](https://www.itead.cc/wiki/Nextion_Instruction_Set#Format_of_Device_Return_Data)
- [ ] Support [operation commands](https://www.itead.cc/wiki/Nextion_Instruction_Set#Classification_I:_Operation_Commands_of_Component_and_System)
- [ ] Reasonable, high-level API; don't require user to send raw commands
  - [ ] System-level abstraction
  - [ ] Component-level abstraction
- [x] Tessel 2 support
- [ ] Remove `serialport` dependency

## Basic Usage

### COM Port, USB-to-UART adapter, etc.

```js
const Nextion = require('nextion');

// CH340G usually shows up at this path on macOS
Nextion.fromPort('/dev/tty.SLAB_USBtoUART')
  .then(nextion => {
    console.log('Listening...');

    nextion.on('touchEvent', data => {
      console.log(data);
    });
  });
```

For port auto-detection, try:

```js
const Nextion = require('nextion');

Nextion.create()
  .then(nextion => {
    // do exciting stuff here
  });
```

### Tessel 2

```js
const tessel = require('tessel');
const Nextion = require('nextion/minimal');

const uart = new tessel.port.A.UART({
  baudrate: 9600
});

Nextion.fromSerial(uart)
  .then(nextion => {
    // Yipper McCheese!
  });
```

The `nextion/minimal` module is for resource-constrained systems; it's compressed and does not include source maps.

### Compatibility

As long as the argument passed into `Nextion.fromSerial` is a [Duplex stream](https://nodejs.org/api/stream.html#stream_class_stream_duplex) or a duck-typed one (a la [serialport](https://www.npmjs.com/package/serialport)), you should be able to use it.  Hack away!

## [API docs](https://doc.esdoc.org/github.com/boneskull/nextion/)

## Events

The `Nextion` instance (`nextion`) in above examples is an `EventEmitter`.  If the device sends any of these over the UART channel, the `Nextion` instance will emit a corresponding event (w/ data, if any).

- [Events](https://www.itead.cc/wiki/Nextion_Instruction_Set#Format_of_Device_Return_Data) (Table 2)
  - `0x65` - `touchEvent`: Touch event return data
  - `0x66` - `pageId`: Current page ID
  - `0x67` - `touchCoordinate`: Touch coordinate data
  - `0x68` - `touchCoordinateOnWake`: Touch coordinate data (on wake)
  - `0x70` - `stringData`: String variable data
  - `0x71` - `numericData`: Numeric variable data
  - `0x86` - `autoSleep`: Device automatically enters sleep mode
  - `0x87` - `autoWake`: Device automatically wakes from sleep mode
  - `0x88` - `startup`: Successful system startup
  - `0x89` - `cardUpgrade`: Start SD card upgrade
  - `0xfd` - `transmitFinished`: Data transmit finished
  - `0xfe` - `transmitReady`: Ready to receive data transmission

> TODO: Describe shape of data for data-emitting events.

## Motivation

- Send & receive events over UART to a [Nextion](https://www.itead.cc/display/nextion.html) device ([hardware reference](https://www.itead.cc/wiki/Nextion_Instruction_Set))
- Support Tessel 2
- Support USB-to-UART serial adapters for debugging
- **Endgame:** combine a Tessel 2 w/ a Nextion to design/implement a (mainly) JS-based home environmental control panel/dashboard.

Future:

- Ensure support on popular ARMv6/7/8
- Ensure support on popular (non-Tessel) MIPS devices
- Interface into GUI designer commands

## Development

- Use environment variable `DEBUG=nextion*` for debug output.
- To run end-to-end tests against a connected device, read `test/e2e/README.md`, then execute `yarn test:e2e`.
- For serial port debugging, use `DEBUG=nextion*,serialport`.

## Notes

### ARM

If the [serialport](https://www.npmjs.com/package/serialport) module supports the architecture, this module *should* work out-of-the-box, meaning RPi's and BBB's are theoretically covered.

### MIPS

This shouldn't be too bad, because the Tessel 2 is MIPS-based, *but* we require Node.js v4.  Other MIPS-based boards I've used have had trouble getting it compiled, packaged, or running at a respectable speed.

## License

:copyright: 2017 [Christopher Hiller](https://github.com/boneskull).  Licensed MIT.
