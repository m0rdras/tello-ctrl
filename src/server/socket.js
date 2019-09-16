const log = require("debug")("tctrl:socket");

class SocketConnection {
  constructor(socket) {
    this.socket = socket;
    socket.on("connection", socket => this.onConnection);
  }

  onConnection(con) {
    log("new connection", con);
  }

  send(data) {
    this.socket.emit("frame", data);
  }
}

module.exports = SocketConnection;
