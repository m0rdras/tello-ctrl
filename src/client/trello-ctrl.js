const socket = io.connect("http://localhost:3000");

const img = new Image();

window.onload = () => {
  initWebGLUtils();

  socket.on("frame", function(data) {
    if (data.image) {
      img.onload = function() {
        renderImage(img);
      };
      img.src = "data:image/jpeg;base64," + data.buffer;
    }
  });
};
