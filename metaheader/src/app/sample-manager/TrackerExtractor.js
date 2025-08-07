import React, { useState, useEffect } from "react";

function TrackerExtractor() {
    const [openmptModule, setOpenmptModule] = useState(null);
    const [modPlayer, setModPlayer] = useState(null);
    const [samples, setSamples] = useState([]);
    
    useEffect(() => {
        // async function loadOpenMPT() {
        //     const module = await window.libopenmpt();
        //     setOpenmptModule(module);
        // }
        async function loadOpenMPT() {
            try {
                if (typeof window.Module === "undefined") {
                    console.error("libopenmpt.js not loaded properly!");
                    return;
                }
                
                // console.log(window.Module.onRuntimeInitialized);
                window.Module.onRuntimeInitialized = function () {
                    console.log('==============test')
                    console.log("libopenmpt.js is ready!");
                    setOpenmptModule(window.Module); // Now you can use the module
                };

                // Initialize libopenmpt.js
                // const mod = await window.Module();
                // setOpenmptModule(mod);
                // console.log("libopenmpt.js loaded!", mod);
            } catch (error) {
                console.error("Error initializing libopenmpt.js:", error);
            }
        }
        loadOpenMPT();
    }, []);

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file || !openmptModule){ 
            alert('openmptModule is null')
            return;}

        const arrayBuffer = await file.arrayBuffer();
        const modData = new Uint8Array(arrayBuffer);
        console.log('>>>>>>>>>>>openmptModule',openmptModule);
        const modInstance = new openmptModule.Module(modData);
        setModPlayer(modInstance);

        // Extract sample names
        const numSamples = parseInt(modInstance.get_metadata("num_samples"), 10);
        let sampleList = [];
        for (let i = 1; i <= numSamples; i++) {
            sampleList.push(modInstance.get_metadata(`sample_name${i}`) || `Sample ${i}`);
        }
        setSamples(sampleList);
    };

    const extractSample = (sampleIndex) => {
        if (!modPlayer) return;

        const sampleRate = 44100;
        const duration = 3; // Extract 3 seconds
        const numFrames = sampleRate * duration;
        const buffer = new Float32Array(numFrames * 2); // Stereo

        // Mute all channels
        const numChannels = parseInt(modPlayer.get_metadata("num_channels"), 10);
        for (let ch = 0; ch < numChannels; ch++) {
            modPlayer.set_channel_mute_status(ch, 1);
        }

        // Unmute the selected sample
        modPlayer.set_instrument_mute_status(sampleIndex, 0);

        // Read sample audio
        modPlayer.read_interleaved_stereo(sampleRate, numFrames, buffer);

        // Convert to WAV and download
        const wavBlob = createWavBlob(buffer, sampleRate);
        const a = document.createElement("a");
        a.href = URL.createObjectURL(wavBlob);
        a.download = `${samples[sampleIndex]}.wav`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const createWavBlob = (samples, sampleRate) => {
        const numFrames = samples.length / 2;
        const numChannels = 2;
        const bitsPerSample = 16;
        const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
        const blockAlign = numChannels * (bitsPerSample / 8);

        const wavHeader = new ArrayBuffer(44);
        const view = new DataView(wavHeader);

        // Write WAV header
        const writeString = (offset, string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };

        writeString(0, "RIFF");
        view.setUint32(4, 36 + numFrames * numChannels * 2, true);
        writeString(8, "WAVE");
        writeString(12, "fmt ");
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, numChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, byteRate, true);
        view.setUint16(32, blockAlign, true);
        view.setUint16(34, bitsPerSample, true);
        writeString(36, "data");
        view.setUint32(40, numFrames * numChannels * 2, true);

        // Convert Float32 to Int16 PCM
        const pcmData = new Int16Array(samples.length);
        for (let i = 0; i < samples.length; i++) {
            pcmData[i] = Math.max(-1, Math.min(1, samples[i])) * 32767;
        }

        return new Blob([wavHeader, new Int16Array(pcmData)], { type: "audio/wav" });
    };

    return (
        <div style={{ textAlign: "center", padding: "20px" }}>
            <h1>Tracker Module Sample Extractor</h1>
            <input type="file" accept=".mod,.xm,.it,.s3m" onChange={handleFileUpload} />
            {samples.length > 0 && (
                <div>
                    <h2>Samples</h2>
                    <ul>
                        {samples.map((name, index) => (
                            <li key={index}>
                                {name} <button onClick={() => extractSample(index)}>Download</button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default TrackerExtractor;
