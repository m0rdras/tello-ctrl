const express = require("express");
const SocketConnection = require("./socket");
const Camera = require("./camera");
const log = require("debug")("tctrl:server");
const http = require("http");
const socketio = require("socket.io");
const path = require("path");

const DEFAULT_FPS = 15;

const port = process.env.PORT || 3000;

const app = express();

const staticFolder = path.join(__dirname, "..", "client");
const assetFolder = path.join(__dirname, "..", "..", "assets");

app.use("/", express.static(staticFolder));
app.use("/assets", express.static(assetFolder));

const server = http.createServer(app);
server.listen(port, function() {
  log("HTTP server listening on port " + port);
});

const cam = new Camera();
const socket = new SocketConnection(socketio(server));

const update = async () => {
  try {
    const frame = await cam.captureJpeg();
    socket.send({
      image: true,
      buffer: frame.toString("base64")
    });
  } catch (err) {
    log("Error while capturing frame, continuing");
  }
};

const startCapture = fps => {
  setInterval(update, 1000 / (fps || DEFAULT_FPS));
};

module.exports.app = app;
module.exports.startCapture = startCapture;
