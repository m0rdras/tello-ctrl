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
      log("captured frame");
      return frame;
    } catch (err) {
      log(err);
      return null;
    }
  }
}
module.exports = Camera;
