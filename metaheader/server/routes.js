
var FilesController = require('./controllers/filesController.js');
var sketchEditorController = require('./controllers/sketchEditorController.js');
var favoritesController = require('./controllers/favoritesController.js');
var songExportController = require('./controllers/songExportController.js');

module.exports = function (app) {
    
    app.get('/', (req, res) => {
        //  res.send('Webconf Files Manager App Server.')
        // for local test server only
        res.sendFile('./views/index.html',{root:__dirname});
    })  

    // FILES
    app.get('/json/:path',FilesController.getJsonFile)
    app.get('/mydata',FilesController.getAllFiles)
    app.get('/mydata/:folder',FilesController.getAllFiles)
    app.get('/folder/',FilesController.getFilesInFolder)
    app.get('/folder/:folder',FilesController.getFilesInFolder)
    app.post('/rename',FilesController.renameFile)
    app.post('/createfolder',FilesController.createFolder)
    app.post('/delete',FilesController.deleteFiles)
    app.post('/copypaste',FilesController.copyPaste)
    app.post('/upload/:folder',FilesController.uploadFiles)
    app.post('/download',FilesController.downloadFiles)

    // SAMPLE EDITOR
    app.get('/sketchinfo/',sketchEditorController.getSketchInfo)
    app.get('/sketchlist/', sketchEditorController.getSketchList)
    app.get('/sketch/:path', sketchEditorController.getSketch)
    app.get('/track/:id', sketchEditorController.getTrack)
    app.post('/track/:id', sketchEditorController.updateTrack)
    app.get('/sample/:id', sketchEditorController.getSample)
    app.get('/clip/:id', sketchEditorController.getClip)
    app.post('/sample/:id', sketchEditorController.removeSample)

    // FAVORITES
    app.get('/favorites', favoritesController.getFavorites)

    // SONG EXPORTS
    app.get('/songexports', songExportController.getSongExports)

};
