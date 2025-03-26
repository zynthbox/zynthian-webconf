const express = require('express')
const path = require("path")
const fs = require('fs');
var cors = require('cors');
const { Server } = require("socket.io");
const app = express()
const port = 3000

const FIFO_PATH = "/tmp/my_fifo"; // Path to FIFO file
const { execSync } = require("child_process");
// Ensure FIFO file exists
// try {
//   execSync(`mkfifo ${FIFO_PATH}`);
//   console.log(`FIFO file created at ${FIFO_PATH}`);
// } catch (err) {
//   if (!err.message.includes("File exists")) {
//       console.error("Error creating FIFO:", err);
//       process.exit(1);
//   }
// }


// const rootFolder = "./"
const rootFolder = "/home/pi/zynthian-my-data/"

// cors
app.use(cors());

// Body Parser
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static('/home/pi/')); 

app.use(function(req, res, next) {
  if (!req.user) {
      res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      res.header('Expires', '-1');
      res.header('Pragma', 'no-cache');
  }
  next();
});

var routes = require('./server/routes.js')(app);

const server = app.listen(port, () => {
  console.log(`webconf metaheader file-browser app-server listening on port ${port}`)
})

// Attach Socket.IO to the Express app's HTTP server
const io = new Server(server);

// WebSocket Connection
io.on("connection", (socket) => {
  console.log("Client connected");
});

// Watch FIFO File
function watchFIFO() {
  fs.open(FIFO_PATH, "r", (err, fd) => {
      if (err) {
          console.error("Error opening FIFO:", err);
          setTimeout(watchFIFO, 1000); // Retry after 1 sec if error
          return;
      }

      console.log("Watching FIFO...");

      const buffer = Buffer.alloc(1024);

      function readLoop() {
          fs.read(fd, buffer, 0, buffer.length, null, (err, bytesRead) => {
              if (err) {
                  console.error("Read error:", err);
                  return;
              }
              if (bytesRead > 0) {
                  const message = buffer.toString("utf8", 0, bytesRead).trim();
                  console.log("FIFO Received:", message);

                  // Send data to WebSocket clients
                  io.emit("message", message);

                  readLoop(); // Continue reading
              } else {
                  setTimeout(readLoop, 100); // Poll again if no data
              }
          });
      }

      readLoop();
  });
}

watchFIFO();