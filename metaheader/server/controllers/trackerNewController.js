
const fs = require('fs');
const multer = require('multer');
const path = require('path');


// Set up multer to handle file uploads
const storage = multer.memoryStorage(); // Store the file in memory for now

 exports.getTrackerInfo = (req,res) => {
    var upload = multer({storage: storage}).single('file');
    upload(req, res, function (err) {   
                
        if (!req.file) {
            return res.status(400).send('No file uploaded.');
          }
     

        const fileBuffer = req.file.buffer;       
        const fileType = detectFileType(req.file.originalname);
      
        let sampleInfo;
        
        // Call the appropriate parser based on file type
        if (fileType === 'MOD') {
          sampleInfo = parseMODFile(fileBuffer);
        } else if (fileType === 'XM') {
          sampleInfo = parseXMFile(fileBuffer);
        } else if (fileType === 'IT') {
          sampleInfo = parseITFile(fileBuffer);
        } else if (fileType === 'S3M') {
          sampleInfo = parseS3MFile(fileBuffer);
        } else {
          return res.status(400).send('Unsupported file format.'+fileType);
        }


        console.log('>>>>>>>>>>>>>>sampleInfo>>>>>>>>>>>')
        console.log(sampleInfo);
        // Return the sample information as JSON
        res.json(sampleInfo);
        // console.log("File uploaded");
        // res.end('File is uploaded')
      })  


}
// Detect the file type based on the file extension in the original filename
function detectFileType(originalName) {
    const extension = path.extname(originalName).toLowerCase();
  
    if (extension === '.mod') {
      return 'MOD';
    } else if (extension === '.xm') {
      return 'XM';
    } else if (extension === '.it') {
      return 'IT';
    } else if (extension === '.s3m') {
      return 'S3M';
    } else {
      return null; // Unsupported file type
    }
  }
// Function to parse the MOD file and list samples
function parseMODFile(fileBuffer) {
    
    const header = fileBuffer.slice(0, 1084);
    const sampleDataStart = 20;
    const sampleLength = 30;
    const numSamples = 31;
  
    const samples = [];
  
    for (let i = 0; i < numSamples; i++) {
      const sampleStart = sampleDataStart + i * sampleLength;
      const sampleBuffer = header.slice(sampleStart, sampleStart + sampleLength);
  
      const name = sampleBuffer.toString('ascii', 0, 22).trim().replace(/\0/g, '');
      const length = sampleBuffer.readUInt16LE(22);
      const volume = sampleBuffer.readUInt8(24);
      const loopStart = sampleBuffer.readUInt16LE(25);
      const loopLength = sampleBuffer.readUInt16LE(27);
        if(length>0){
            samples.push({
                name,
                length,
                volume,
                loopStart,
                loopLength
            });
        }
    }
  
    return samples;
  }

  // Function to parse an XM file
function parseXMFile(fileBuffer) {
    // Implement XM parsing logic here
    return [];
  }
  
  // Function to parse an IT file
  function parseITFile(fileBuffer) {
    // Implement IT parsing logic here
    return [];
  }
  
  // Function to parse an S3M file
  function parseS3MFile(fileBuffer) {
    // Implement S3M parsing logic here
    return [];
  }
  