const fs = require("fs");
const wav = require("wav-decoder");



// 1... wav-decoder not working
async function readWavFile(filePath) {
    const buffer = fs.readFileSync(filePath);
    const decoded = await wav.decode(buffer);
    
    console.log("Sample Rate:", decoded.sampleRate);
    console.log("Number of Channels:", decoded.channelData.length);
    console.log("Audio Data:", decoded.channelData[0]); // Float32Array of first channel

    return decoded;
}

exports.readSndFile = (req,res) => {
    let snd = req.params.path.split('+++').join('/');
    readWavFile(snd)
    .then((data) => {
        console.log(data);
        return res.status(200).json(data) 
        })
    .catch((err) => {console.error("Error decoding WAV file:", err);    
        res.json(err)
    });    
}

