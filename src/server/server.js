const log = require("debug")("tctrl:server");
const fpsLog = require("debug")("tctrl:server:fps");

const http = require("http");
const path = require("path");

const SocketConnection = require("./socket");
const Camera = require("./camera");
const FrameProcessorClient = require("./worker/frameprocessor.client");
const Tello = require("./tello");

const express = require("express");
const socketio = require("socket.io");

const NS_PER_SEC = 1e9;

class Server {
  static DEFAULT_FPS = 40;
  static DEFAULT_PORT = 3000;
  static WORKER_PROCESSES = 1;

  constructor(fps = Server.DEFAULT_FPS) {
    log("Initializing Server, fps", fps);

    const port = process.env.PORT || Server.DEFAULT_PORT;

    this.fps = fps;

    this.app = express();

    const staticFolder = path.join(__dirname, "..", "client");
    const assetFolder = path.join(__dirname, "..", "..", "assets");

    this.app.use("/", express.static(staticFolder));
    this.app.use("/assets", express.static(assetFolder));

    this.httpServer = http.createServer(this.app);
    this.httpServer.listen(port, () => {
      log("HTTP server listening on port " + port);
    });

    this.socket = new SocketConnection(socketio(this.httpServer));
    this.processor = FrameProcessorClient.start(Server.WORKER_PROCESSES);
    this.tello = new Tello();
  }

  static getDiffNs(start) {
    const diff = process.hrtime(start);
    return diff[0] * NS_PER_SEC + diff[1];
  }

  async update() {
    try {
      let start = process.hrtime();
      const frame = await this.cam.capture();
      const captureTime = Server.getDiffNs(start);

      this.processor.sendFrame(frame);

      start = process.hrtime();
      const img = await this.cam.convertFrameToJpeg(frame);
      const conversionTime = Server.getDiffNs(start);

      start = process.hrtime();
      this.socket.send({
        image: true,
        buffer: img
      });
      const sendTime = Server.getDiffNs(start);

      fpsLog(
        `timings: capture ${captureTime} conversion ${conversionTime} sending ${sendTime}`
      );
    } catch (err) {
      log("Error while capturing frame, continuing", err);
    }
  }

  async scheduleUpdate() {
    const startTime = process.hrtime();
    await this.update();
    const duration = Server.getDiffNs(startTime) / 1e6;
    const target = 1e3 / this.fps;
    const deltaToNext = Math.max(1, Math.floor(target - duration));

    fpsLog(
      `update complete, duration ${duration}ms, target ${target.toFixed()}ms, next in ${deltaToNext}ms`
    );

    setTimeout(() => this.scheduleUpdate(), deltaToNext);
  }

  async startCapture() {
    try {
      await this.tello.connect();
    } catch (err) {
      log("Could not connect to Tello", err);
      return;
    }

    try {
      await this.tello.control.streamOn();
    } catch (err) {
      log("Could not start Tello video stream", err);
    }

    try {
      this.cam = new Camera(Tello.VS_UDP_ADDRESS);
    } catch (err) {
      log("Could not capture camera video stream", err);
    }

    this.scheduleUpdate();
  }
}

module.exports = Server;
