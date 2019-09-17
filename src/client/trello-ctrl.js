const socket = io.connect("http://localhost:3000");

const img = new Image();

function blobToImage(imageData) {
  if (Blob && "undefined" != typeof URL) {
    const blob = new Blob([imageData], { type: "image/png" });
    return URL.createObjectURL(blob);
  } else if (imageData.base64) {
    return "data:image/png;base64," + imageData.data;
  } else {
    return "about:blank";
  }
}

let lastFrame;

window.onload = () => {
  initWebGLUtils();

  socket.on("frame", function(data) {
    if (data.image) {
      if (lastFrame && "undefined" != typeof URL) {
        URL.revokeObjectURL(lastFrame);
      }
      img.src = blobToImage(data.buffer);
      lastFrame = img.src;
      img.onload = function() {
        renderImage(img);
      };
    }
  });
};
