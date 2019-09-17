const log = require("debug")("tctrl:tello");
const sdk = require("tellojs");

class Tello {
  connect() {
    return sdk.control.connect();
  }

  get control() {
    return sdk.control;
  }

  get set() {
    return sdk.set;
  }

  get read() {
    return sdk.read;
  }

  get receiver() {
    return sdk.receiver;
  }
}

module.exports = Tello;
