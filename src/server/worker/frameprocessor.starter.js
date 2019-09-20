const log = require("debug")("tctrl:frameprocessor:starter");
const FrameProcessorWorker = require("./frameprocessor.worker");

log("Starting frame processor worker");
FrameProcessorWorker.start();
