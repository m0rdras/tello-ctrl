const log = require("debug")("tctrl:frameprocessor:worker");
const cv = require("opencv4nodejs");

/**
 * Worker process that receives message from the server and processes them. Overwrite #process to do some heavy lifting.
 * The result of #process is serialized and sent back to the server (see #FrameProcessorClient.processMessage).
 */
class FrameProcessorWorker {
  constructor() {
    process.on("message", msg => this.onServerMessage(msg));
  }

  async process(frame) {
    log("Default FrameProcessorWorker.process called.");
    return null;
  }

  async onServerMessage(msg) {
    if (msg.frame) {
      const { frame } = msg;
      try {
        const frameMat = await cv.imdecodeAsync(Buffer.from(frame.data));
        const result = await this.process(frameMat);
        process.send({ result, id: frame.id });
      } catch (err) {
        log("Error in received frame data", err);
      }
    }
  }

  static start() {
    return new FrameProcessorWorker();
  }
}

module.exports = FrameProcessorWorker;
