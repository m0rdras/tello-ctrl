const log = require("debug")("tctrl:socket");

class SocketConnection {
  constructor(socket) {
    this.socket = socket;
    socket.on("connection", this.onConnection);
  }

  onConnection(con) {
    log("New client connected");
  }

  send(data) {
    this.socket.emit("frame", data);
  }
}

module.exports = SocketConnection;
