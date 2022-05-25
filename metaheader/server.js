const express = require('express')
const path = require("path")
const fs = require('fs');
var cors = require('cors');

const app = express()
const port = 3000

// const rootFolder = "./"
const rootFolder = "/home/pi/zynthian-my-data/"

// cors
app.use(cors());

// Body Parser
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static('/home/pi/')); 

var routes = require('./server/routes.js')(app);

app.listen(port, () => {
  console.log(`webconf metaheader file-browser app-server listening on port ${port}`)
})
