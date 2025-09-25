const express = require('express')
const path = require("path")
const fs = require('fs');
var cors = require('cors');
const { Server } = require("socket.io");
const app = express()
const port = 3000
// const https = require('https');

const FIFO_READ_FROM = '/tmp/webconf-reads-from-this-fifo'
const FIFO_WRITES_TO = '/tmp/webconf-writes-to-this-fifo'

// Load SSL key and certificate
// const options = {
//   key: fs.readFileSync('path/to/key.pem'),
//   cert: fs.readFileSync('path/to/cert.pem')
// };

const { execSync } = require("child_process");
// Ensure FIFO file exists
try {
    execSync(`mkfifo ${FIFO_READ_FROM}`);
    execSync(`mkfifo ${FIFO_WRITES_TO}`);
    console.log(`FIFO file created at ${FIFO_READ_FROM}`);
    console.log(`FIFO file created at ${FIFO_WRITES_TO}`);
} catch (err) {
  if (!err.message.includes("File exists")) {
      console.error("Error creating FIFO:", err);
      process.exit(1);
  }
}


// const rootFolder = "./"
const rootFolder = "/home/pi/zynthian-my-data/"

// cors
app.use(cors());

// Body Parser
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static('/home/pi/')); 
app.use('/tmp',express.static('/zynthian/zynthian-my-data/tmp/webconf/tracker/uploads/')); 

app.use(function(req, res, next) {
  if (!req.user) {
      res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      res.header('Expires', '-1');
      res.header('Pragma', 'no-cache');
  }
  next();
});

var routes = require('./server/routes.js')(app);


const server = app.listen(port,() => {
  console.log(`webconf metaheader file-browser app-server listening on port ${port}`)
})

// Instead of app.listen, use https.createServer
// const server = https.createServer(options, app).listen(port, () => {
//   console.log(`webconf metaheader file-browser app-server (HTTPS) listening on port ${port}`);
// });

// Attach Socket.IO and enable CORS
const io = new Server(server,{
  cors: {
      origin: "*", // Allow all domains to connect (change this for more security)
  },
});

// WebSocket Connection
io.on("connection", (socket) => {
  console.log("Client connected");
});

// // Watch FIFO File
function watchFIFO() {
  fs.open(FIFO_READ_FROM, "r", (err, fd) => {
      if (err) {
          console.error("Error opening FIFO:", err);
          setTimeout(watchFIFO, 1000); // Retry after 1 sec if error
          return;
      }

      const buffer = Buffer.alloc(1024);

      function readLoop() {
          fs.read(fd, buffer, 0, buffer.length, null, (err, bytesRead) => {
              if (err) {
                  console.error("Read error:", err);
                  return;
              }
              if (bytesRead > 0) {
                  const message = buffer.toString("utf8", 0, bytesRead).trim();
                  //console.log("FIFO Received>>>>>>>>>>>>>>>>:", message);                 
                  // Send data to WebSocket clients
                  io.emit("fifoChanged", message);
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