# nextion

> Communicate with ITEAD's Nextion HMI Devices

![pic of nextion device](https://cldup.com/clEx6-8m6M.png)

## Status

- [x] Support all non-success/error [return values](https://www.itead.cc/wiki/Nextion_Instruction_Set#Format_of_Device_Return_Data)
- [ ] Support all success/error messages
- [ ] Send [operation commands](https://www.itead.cc/wiki/Nextion_Instruction_Set#Classification_I:_Operation_Commands_of_Component_and_System)
- [ ] Reasonable API
- [x] Tessel 2 support

## Usage

### COM Port, USB-to-UART adapter, etc.

```js
const nextion = require('nextion');

// CH340G usually shows up at this path on macOS;
// omit "port" property for flimsy auto-detection
nextion.createConnection({
  port: '/dev/tty.SLAB_USBtoUART',
  baudRate: 9600
})
  .then(hmi => {
    console.log('Listening...');

    hmi.on('touchEvent', data => {
      console.log(data);
    });
  });
```

### Tessel 2

```js
const tessel = require('tessel');
const nextion = require('nextion');

const uart = new tessel.port.A.UART({
  baudrate: 9600
});

nextion.createConnection({port: uart})
  .then(hmi => {
    console.log('Listening...');

    hmi.on('touchEvent', data => {
      console.log(data);
    });
  });
```

## Events

The `Nextion` instance (`hmi`) in above examples is an `EventEmitter`.  It will emit the following events w/ any data, if present.

This will be updated as events are implemented.  And I need to describe the shape of the data for some of these.

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

## Motivation

- Send & receive events over UART to a [Nextion](https://www.itead.cc/display/nextion.html) device ([hardware reference](https://www.itead.cc/wiki/Nextion_Instruction_Set))
- Support USB-to-UART serial adapters
- Support Tessel 2

Future:

- Support Raspberry Pi & Beaglebone Black
- Interface into GUI designer commands
- Johnny-Five support?

## Notes

Johnny-Five support is problematic, because:

- Only "enhanced" Nextion models have any GPIO pins (8 PWM-capable pins)
- All communication w/ the device is over UART, so an IO plugin would be extremely wonky 
- No ADC (afaik)
- Any I2C or SPI communications would probably need to be handled by a daughter board

## License

:copyright: 2017 [Christopher Hiller](https://github.com/boneskull).  Licensed MIT.
