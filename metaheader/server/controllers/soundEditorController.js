const fs = require("fs");
const { exec } = require('child_process');
exports.zynthbox_snd_metadata_extractor =(req, res)=>{
    // python3 /zynthian/zynthbox-qml/zynthbox_snd_metadata_extractor "/zynthian/zynthian-my-data/sounds/my-sounds/EightiesMemoriestest.snd" 
    let snd = req.params.path.split('+++').join('/');     
    exec(`python3 /zynthian/zynthbox-qml/zynthbox_snd_metadata_extractor "${snd}"`, (error, stdout, stderr) => {

        console.log(`>>>> python3 /zynthian/zynthbox-qml/zynthbox_snd_metadata_extractor "${snd}"`);
        if (error) {
          console.error(`exec error: ${error}`);
          return;
        }
        if (stderr) {
          console.error(`stderr: ${stderr}`);
          return;
        }

        const fileinfo = `${stdout}`;
        return res.status(200).json(fileinfo)                       
      });
}