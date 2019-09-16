const server = require("./src/server/server");

setInterval(server.update, 1000 / 15);
