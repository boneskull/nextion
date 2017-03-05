# nextion

> Communicate with ITEAD's Nextion HMI Devices

![pic of nextion device](https://cldup.com/clEx6-8m6M.png)

## Status

- [x] Support all non-success/error [return values](https://www.itead.cc/wiki/Nextion_Instruction_Set#Format_of_Device_Return_Data)
- [ ] Support all success/error messages
- [ ] Send [operation commands](https://www.itead.cc/wiki/Nextion_Instruction_Set#Classification_I:_Operation_Commands_of_Component_and_System)
- [ ] Reasonable, high-level API; don't require user to send raw commands
- [x] Tessel 2 support

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
const Nextion = require('nextion');

const uart = new tessel.port.A.UART({
  baudrate: 9600
});

Nextion.fromSerial(uart)
  .then(nextion => {
    // Yipper McCheese!
  });
```

As long as the argument passed into `Nextion.fromSerial` is a [Duplex stream](https://nodejs.org/api/stream.html#stream_class_stream_duplex) or a duck-typed one (a la [serialport](https://www.npmjs.com/package/serialport)), you should be able to use it.  Hack away!

## API Docs

TODO

## Events

The `Nextion` instance (`nextion`) in above examples is an `EventEmitter`.  If the device sends any of these over the UART channel, the `Nextion` instance will emit a corresponding event (w/ data, if any).

- [Return Values](https://www.itead.cc/wiki/Nextion_Instruction_Set#Format_of_Device_Return_Data) (Table 2)
  - `touchEvent`: Touch event return data
  - `pageId`: Current page ID
  - `touchCoordinate`: Touch coordinate data
  - `wake`: Touch event in sleep mode
  - `stringData`: String variable data
  - `numericData`: Numeric variable data
  - `autoSleep`: Device automatically enters sleep mode
  - `autoWake`: Device automatically wakes from sleep mode
  - `startup`: Successful system startup
  - `cardUpgrade`: Start SD card upgrade
  - `transmitFinished`: Data transmit finished
  - `transmitReady`: Ready to receive data transmission

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
- [Johnny-Five](http://johnny-five.io) support?

## Notes

### Johnny-Five

Johnny-Five support is problematic, because:

- Only "enhanced" Nextion models have any GPIO pins (8 PWM-capable pins)
- All communication w/ the device is over UART, so an IO plugin would be extremely wonky 
- No ADC, as far as I know
- Any I2C or SPI communications would probably need to be handled by a daughter board

### ARM

If the [serialport](https://www.npmjs.com/package/serialport) module supports the architecture, this module *should* work out-of-the-box, meaning RPi's and BBB's are theoretically covered.

### MIPS

This shouldn't be too bad, because the Tessel 2 is MIPS-based, *but* we require Node.js v4.  Other MIPS-based boards I've used have had trouble getting it compiled, packaged, or running at a respectable speed.

## License

:copyright: 2017 [Christopher Hiller](https://github.com/boneskull).  Licensed MIT.
