const fs = require("fs");
const fsextra = require('fs-extra')
const CONFIG_PLUGINS = '/zynthian/zynthbox-qml/config/plugins.json'

// TODO ...
exports.fetchSounds = async (req, res)=>{
    try{
        let zss = req.params.path.split('+++').join('/');    
        const zssJson =  await fsextra.readJson(zss);
        const pluginsNameMapping = await fsextra.readJson(CONFIG_PLUGINS);
    }catch(e){
        console.log(err);
        return res.status(404).json({error:err})    
    }
}