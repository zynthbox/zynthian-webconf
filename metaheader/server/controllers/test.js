const libopenmptModule = require('./libs/libopenmpt.js');

console.log(libopenmptModule);

async function initLibOpenMPT() {
    return new Promise((resolve, reject) => {
        libopenmptModule({
            locateFile: (file) => path.resolve(__dirname, "libs", file), // Locate .wasm file
            onRuntimeInitialized: function () {
                console.log("✅ libopenmpt.js initialized!");
                resolve(this); // 'this' is the initialized Module
            },
        }).catch((err) => reject(err));
    });
}

// const openmpt =  initLibOpenMPT();
// console.log(openmpt);
