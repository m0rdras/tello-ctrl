const log = require("debug")("tctrl:camera");
const cv = require("opencv4nodejs");

class Camera {
  constructor(camId = 0) {
    log("Initializing video capture");
    this.cam = new cv.VideoCapture(camId);
  }

  capture() {
    return this.cam.readAsync();
  }

  convertFrameToJpeg(frame, width, height) {
    if (width) {
      return frame
        .resizeAsync(height, width)
        .then(img => cv.imencodeAsync(".jpg", img));
    }
    return cv.imencodeAsync(".jpg", frame);
  }

  get frameId() {
    return this.cam.get(cv.CAP_PROP_POS_FRAMES);
  }
}

module.exports = Camera;
