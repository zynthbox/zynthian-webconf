
var FilesController = require('./controllers/filesController.js');
var sampleEditorController = require('./controllers/sketchEditorController.js');
var favoritesController = require('./controllers/favoritesController.js');

module.exports = function (app) {
    
    app.get('/', (req, res) => {
        res.send('Webconf Files Manager App Server.')
    })  

    // FILES
    app.get('/json/:path',FilesController.getJsonFile)
    app.get('/mydata',FilesController.getAllFiles)
    app.get('/folder/',FilesController.getFilesInFolder)
    app.get('/folder/:folder',FilesController.getFilesInFolder)
    app.post('/rename',FilesController.renameFile)
    app.post('/createfolder',FilesController.createFolder)
    app.post('/delete',FilesController.deleteFiles)
    app.post('/copypaste',FilesController.copyPaste)
    app.post('/upload/:folder',FilesController.uploadFiles)
    app.post('/download',FilesController.downloadFiles)

    // SAMPLE EDITOR
    app.get('/sketchinfo/',sampleEditorController.getSketchInfo)
    app.get('/sketchlist/', sampleEditorController.getSketchList)
    app.get('/sketch/:path', sampleEditorController.getSketch)
    app.get('/track/:id', sampleEditorController.getTrack)
    app.post('/track/:id', sampleEditorController.updateTrack)
    app.get('/sample/:id', sampleEditorController.getSample)
    app.get('/clip/:id', sampleEditorController.getClip)
    app.post('/sample/:id', sampleEditorController.removeSample)

    // FAVORITES
    app.get('/favorites', favoritesController.getFavorites)

};
