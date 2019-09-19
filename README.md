# tello-ctrl

node.js server that captures video from a Ryze Tello drone and sends it to a HTML frontend via websockets (socket.io).

* Video is sent as individual frames, encoded as JPG via opencv4nodejs
* Backend includes tellojs, though not really 'wired' yet
* Server listens on `localhost:3000` by default

Starting the server: `npm start`

Running tests: `npm run tests`
