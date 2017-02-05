# nextion

> Communicate with ITEAD's Nextion HMI Devices

![pic of nextion device](https://cldup.com/clEx6-8m6M.png)

## Status

- [x] Support all [return values](https://www.itead.cc/wiki/Nextion_Instruction_Set#Format_of_Device_Return_Data)
- [ ] Send [operation commands](https://www.itead.cc/wiki/Nextion_Instruction_Set#Classification_I:_Operation_Commands_of_Component_and_System)
- [ ] Reasonable API

## Motivation

- Send & receive events over UART to a [Nextion](https://www.itead.cc/display/nextion.html) device ([hardware reference](https://www.itead.cc/wiki/Nextion_Instruction_Set))
- Support USB-to-UART serial adapters
- Support Tessel 2

Future:

- Support Raspberry Pi & Beaglebone Black
- Interface into GUI designer commands

## Usage (Untested)

```js
const connect = require('nextion');

// connection API is up for debate, but the object returned is an EventEmitter.
// you can also omit the port and we'll make a guess, or pass a `serialport`
// property with a previously created serialport object.
// see https://npmjs.com/package/serialport
const nextion = await connect('/dev/ttyUSB0');

nextion.listen()
  .on('touchEvent', ({page_id, button_id, release_event}) => {
    console.log(`button ${button_id} ${release_event ? 'released' : 'pressed'}`);
  })
  
```

## License

:copyright: 2017 [Christopher Hiller](https://github.com/boneskull).  Licensed MIT.
