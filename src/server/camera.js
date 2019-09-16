const cv = require("opencv4nodejs");
const debug = require("debug");

const log = debug("tctrl:camera");

class Camera {
  constructor(camId = 0) {
    this.cam = new cv.VideoCapture(camId);
  }

  async capture() {
    try {
      const frame = await this.cam.readAsync();
      return frame;
    } catch (err) {
      log(err);
      return null;
    }
  }

  async captureJpeg() {
    const frame = await this.capture();
    if (frame) {
      return cv.imencodeAsync(".jpg", frame);
    }
    return null;
  }
}
module.exports = Camera;
