const cv = require("opencv4nodejs");
const log = require("debug")("tctrl:camera");

class Camera {
  constructor(camId = 0) {
    this.cam = new cv.VideoCapture(camId);
  }

  capture() {
    return this.cam.readAsync();
  }

  captureJpeg() {
    return this.capture().then(frame => {
      return cv.imencodeAsync(".jpg", frame);
    });
  }
}
module.exports = Camera;
