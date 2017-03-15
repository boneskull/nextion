# nextion E2E Tests

## How To Run These Things

These tests require a Nextion device connected via serial port.

Specify the path to the serial port via the `NEXTION_TEST_PORT` environment variable, and run the `test:e2e` script:

```shell
$ NEXTION_TEST_PORT=/dev/tty.SLAB_USBtoUART yarn test:e2e
# or with npm
$ NEXTION_TEST_PORT=/dev/tty.SLAB_USBtoUART npm run test:e2e
```
