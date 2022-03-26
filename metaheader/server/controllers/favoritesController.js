const fs = require('fs');

const rootFolder = "/home/pi/zynthian-my-data/"

exports.getFavorites = (req,res) => {
    let jsonArray = []
    fs.readdirSync(`${rootFolder}preset-favorites/`).forEach(f => {
      var file = fs.readFileSync(`${rootFolder}preset-favorites/${f}`);
      var json = JSON.parse(file);
      jsonArray.push({name:f.split('.')[0],json:json})
    });
    res.json(jsonArray)
}