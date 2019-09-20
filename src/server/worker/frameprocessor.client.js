const log = require("debug")("tctrl:frameprocessor:client");
const cv = require("opencv4nodejs");

const { fork } = require("child_process");
const path = require("path");

/**
 * Client API to start a processing client and communicate with it.
 * Frame data can be sent via #sendFrame. The processor returns a result message that is cached by the
 * Client instance (#currentResult). The result message can be processed by overwriting #processMessage.
 */
class FrameProcessorClient {
    /** Image format to use for communication between server/child */
    static TX_IMG_FORMAT = ".jpg";
    /** Default interval in ms for processing tasks */
    static DEFAULT_PROCESSING_INTERVAL = 300;

    constructor(
        workers,
        detectionInterval = FrameProcessorClient.DEFAULT_PROCESSING_INTERVAL
    ) {
        this.result = null;
        this.lastRequest = 0;
        this.sentFrameId = 0;
        this.receivedFrameId = -1;
        this.nextWorkerId = 0;
        this.detectionInterval = detectionInterval;
        this.workers = workers;

        this.workers.forEach(worker =>
            worker.on("message", msg => this.onWorkerMessage(msg))
        );
    }

    get currentResult() {
        return this.result;
    }

    /**
     * Overwrite to process the result message from a worker.
     */
    async processMessage(msg) {
        log("Default FrameProcessorClient.processMessage called");
        return msg.hasOwnProperty('result') ? msg.result : null;
    }

    /**
     * Receives a result message from a worker
     * @param msg
     * @returns {Promise<void>}
     */
    async onWorkerMessage(msg) {
        if (msg.hasOwnProperty('id') && msg.id > this.receivedFrameId) {
            this.receivedFrameId = msg.id;
            this.result = await this.processMessage(msg);
        }
    }

    /**
     * Converts frame to encoding format and sends it to a worker
     * @param frame
     */
    sendFrame(frame) {
        const now = Date.now();
        const sinceLastDetection = now - this.lastRequest;
        if (sinceLastDetection < this.detectionInterval) {
            return;
        }

        const worker = this.workers[this.nextWorkerId++ % this.workers.length];

        cv.imencodeAsync(FrameProcessorClient.TX_IMG_FORMAT, frame).then(frameData =>
            worker.send({
                frame: {
                    data: frameData,
                    width: frame.cols,
                    height: frame.rows,
                    type: frame.type,
                    id: this.sentFrameId++
                }
            })
        );
    }

    static start(numProcesses = 1) {
        log(`Starting ${numProcesses} frame processor(s)`);
        const workers = [];
        for (let i = 0; i < numProcesses; i++) {
            const workerProcess = fork(
                path.join(__dirname, "frameprocessor.starter.js")
            );
            workers.push(workerProcess);
        }
        return new FrameProcessorClient(workers);
    }
}

module.exports = FrameProcessorClient;
