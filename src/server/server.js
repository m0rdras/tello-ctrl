const express = require("express");
const SocketConnection = require("./socket");
const Camera = require("./camera");
const log = require("debug")("tctrl:server");
const http = require("http");
const socketio = require("socket.io");
const path = require("path");

const port = process.env.PORT || 3000;

const app = express();

const staticFolder = path.join(__dirname, "..", "ui");

app.use("/", express.static(staticFolder, { fallthrough: false }));

const server = http.createServer(app);
server.listen(port, function() {
  log("HTTP server listening on port " + port);
});

const cam = new Camera();
const socket = new SocketConnection(socketio(server));

const update = async () => {
  const frame = await cam.captureJpeg();
  if (frame) {
    socket.send({
      image: true,
      buffer: frame.toString("base64")
    });
  }
};

module.exports.app = app;
module.exports.update = update;
