// Get the environmental variables
const use_tf = (process.env.USE_TF == 'true') || true
const weights_path = `/app/weights`
const faces_folder = `/usr/app/faces`;
const dectections_folder = process.env.DETECTION_FOLDER || `./descriptor_creator/detections`;
const descriptor_save_path = process.env.DESCRIPTOR_SAVE_PATH || `./descriptor_creator`

// Import the packages
const fs = require('fs/promises');
const fsa = require('fs');
const path = require('path');

// Import face-api.js
const canvas = require('canvas');
const faceapi = require('face-api.js')
const { Canvas, Image, ImageData } = canvas
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });
console.log('loaded faceapi', faceapi.tf.version_core);

// Load in tfjs-node if desired
if (use_tf) {
    const tf = require('@tensorflow/tfjs');
    console.log('loaded tf', tf.version_core);
}

// Load in the models
async function load_models() {
    try {
        const modelPath = weights_path;
        const ssdMobilenetv1Method = faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath)
        const faceLandmark68NetMethod = faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath)
        const faceRecognitionNetMethod = faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath)

        await ssdMobilenetv1Method
        await faceLandmark68NetMethod
        await faceRecognitionNetMethod

        return true;
    }
    catch (error) {
        console.log("Models failed to load: \n" + error)
        return false
    }
}

// Load the images and create descriptiors
async function create_descriptors() {
    // Set up globals
    let folders_processed = 0;
    let labelled_descriptors = []

    // setInterval(() => {
    //     console.log("ehe");
    // }, 2000);
    // return;

    // Walk through each folder
    const folders = await fs.readdir(faces_folder);
    if (folders.length == 0) {
        console.log("empty folder supplied");
        return;
    };

    console.log("folders", folders);
    for (const folderw of folders) {

        const join_folder = path.join(faces_folder, folderw);
        
        if (!fsa.existsSync(join_folder)){
            console.log(join_folder, "not exists, skipping");
            continue;
        }

        if(!(await fs.lstat(join_folder)).isDirectory()) {
            console.log(join_folder, "not a directory, skipping");
            continue;
        }
        let current_folder = path.join(faces_folder, folderw);

        const files = await fs.readdir(current_folder);
        if (files.length == 0) {
            console.log("empty files, skipping");
            continue;
        }
        // Read each file in the folder
        console.log('Processing faces in ' + join_folder)

        // Create a descriptors array 
        let files_processed = 0;
        let descriptors = [];

        for (const file of files) {
            // Debug 
            console.log("- Started processing " + file)

            // Read file from system 
            const file_data = await fs.readFile(path.join(current_folder, file))

            // Create a new image to run detection on
            const img = new Image;
            img.src = file_data;

            // Make a forward pass of each network for the detections
            const detections = await faceapi.detectSingleFace(img)
                .withFaceLandmarks()
                .withFaceDescriptor()
            if (detections) descriptors.push(detections.descriptor);

            // Draw the detection on the image for reference
            const detected_img = faceapi.createCanvasFromMedia(img)
            faceapi.draw.drawDetections(detected_img, detections)
            faceapi.draw.drawFaceLandmarks(detected_img, detections)

            // Save the detected image
            const saveDir = path.join(dectections_folder, join_folder);
            if (!fsa.existsSync(saveDir)) fsa.mkdirSync(saveDir, { recursive: true });

            await fs.writeFile(path.join(saveDir, "/detected-" + file), detected_img.toBuffer())

            // If the array is at the end create a labelled descriptor 
            files_processed++
            console.log("- Finsihed processing file " + file + " (" + files_processed + " out of " + files.length + ")")
            if (files_processed === files.length && descriptors.length) {
                // Create a labelled descriptor
                labelled_descriptors.push(new faceapi.LabeledFaceDescriptors(
                    join_folder,
                    descriptors
                ));

                // Save the descriptors if all folders have completed
                folders_processed++
                console.log("Finsihed processing folder " + join_folder + " (" + folders_processed + " out of " + folders.length + ")")
                if (folders_processed === folders.length && labelled_descriptors.length) {
                    console.log('Saving descriptors')
                    await fs.writeFile(path.join(descriptor_save_path, `descriptors.json`), JSON.stringify(labelled_descriptors))
                    // process.exit(0);
                    
                }
            }
        }
    }
    // files.forEach(async function (file) {

    // });
    // , (err, files) => {
    //     // Debug

    // });
    // folders.forEach(async function (folder) {
    //     // Current folder
    // });

    // fs.readdir(faces_folder, (err, folders) => {
    // });
}

// Run the main script
async function main() {
    console.log("Loading Models")
    if (await load_models()) {
        console.log("Creating Descriptors")
        await create_descriptors();
    }
}
main();