const log = require("debug")("tctrl:server");
const fpsLog = require("debug")("tctrl:server:fps");

const http = require("http");
const path = require("path");

const SocketConnection = require("./socket");
const Camera = require("./camera");
const FrameProcessorClient = require('./worker/frameprocessor.client');
const Tello = require("./tello");

const express = require("express");
const socketio = require("socket.io");

const DEFAULT_FPS = 60;
const FRAME_W = 800;
const FRAME_H = 600;

class Server {
  static DEFAULT_PORT = 3000;
  static WORKER_PROCESSES = 1;

  constructor(fps = DEFAULT_FPS) {
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

    this.cam = new Camera(0);
    this.socket = new SocketConnection(socketio(this.httpServer));
    this.processor = FrameProcessorClient.start(Server.WORKER_PROCESSES);
    this.tello = new Tello();
  }

  getDiffNs(start) {
    const NS_PER_SEC = 1e9;
    const diff = process.hrtime(start);
    return diff[0] * NS_PER_SEC + diff[1];
  }

  async update() {
    try {
      let start = process.hrtime();
      const frame = await this.cam.capture();
      const captureTime = this.getDiffNs(start);

      this.processor.sendFrame(frame);

      start = process.hrtime();
      const img = await this.cam.convertFrameToJpeg(frame, FRAME_W, FRAME_H);
      const conversionTime = this.getDiffNs(start);

      start = process.hrtime();
      this.socket.send({
        image: true,
        buffer: img
      });
      const sendTime = this.getDiffNs(start);

      fpsLog(`timings: capture ${captureTime} conversion ${conversionTime} sending ${sendTime}`);
    } catch (err) {
      log("Error while capturing frame, continuing", err);
    }
  }

  async scheduleUpdate() {
    const startTime = Date.now();
    await this.update();
    const duration = Date.now() - startTime;
    const target = 1000 / this.fps;
    const deltaToNext = Math.max(1, Math.floor(target - duration));

    fpsLog(
      `update complete, duration ${duration}ms, target ${target.toFixed()}ms, next in ${deltaToNext}ms`
    );

    setTimeout(() => this.scheduleUpdate(), deltaToNext);
  }

  startCapture() {
    this.scheduleUpdate();
  }
}

module.exports = Server;
