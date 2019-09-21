const log = require("debug")("tctrl:tello");
const sdk = require("tellojs");

class Tello {
  static VS_UDP_IP = "0.0.0.0";
  static VS_UDP_PORT = 11111;
  static get VS_UDP_ADDRESS() {
    return `udp://${Tello.VS_UDP_IP}:${Tello.VS_UDP_PORT}?overrun_nonfatal=1&fifo_size=5000`;
  }

  constructor() {
    this.connection = null;
    this.state = null;
  }

  connect() {
    log("Connecting to Tello");
    if (this.connection) {
      return this.connection;
    }
    return (this.connection = sdk.control.connect().then(() => {
      this.stateEmitter = sdk.receiver.state.bind();
      this.stateEmitter.on("message", state => this.onReceiveState(state));
    }));
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

  onReceiveState(state) {
    this.state = state;
  }
}

module.exports = Tello;
