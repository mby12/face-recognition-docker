// Console logging
console.log("Using /descriptors routes");
const canvas = require("canvas");
const { Canvas, Image, ImageData } = canvas;
const faceapi = require("face-api.js");
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });
console.log("loaded faceapi", faceapi.tf.version_core);
const middleware_options = require("../middleware/middleware_options");
const middleware_canvas = require("../middleware/middleware_canvas");
const middleware_detection = require("../middleware/middleware_detection");
const middleware_draw = require("../middleware/middleware_draw");
// Import express
let express = require("express");
let router = express.Router();
const fs = require("fs");
// Import Multer
var multer = require("multer");
const load_descriptors = require("../helpers/load_descriptors");
const mongo_database = require("../helpers/mongo_database");
var upload = multer();

const faceCollection = mongo_database.collection("faces");

router.post(
  "/descriptors",
  upload.single("img"),
  middleware_options,
  middleware_canvas,
  middleware_detection,
  middleware_draw,
  async function (request, response) {
    try {
      const { name = "test" } = request.body || {};
      /**
       * @type {Express.Multer.File[]}
       */
      const file = request.file;
      let descriptors = [];
      let labelled_descriptors = [];
      if (!file) return response.json({ message: "empty files" });
      
      // Debug
      console.log("- Started processing ");

      // Read file from system
      const file_data = file.buffer;

      // Create a new image to run detection on
      const img = new Image();
      img.src = file_data;

      // Make a forward pass of each network for the detections
      const detections = await faceapi
        .detectSingleFace(img)
        .withFaceLandmarks()
        .withFaceDescriptor();

      console.log("detected face", typeof detections);

      if (!detections) throw new Error("No Face Detected");
      descriptors.push(detections.descriptor);

      let captured_face_detected = undefined;

      if (request.query.return_img && request.drawn_canvas) {
        captured_face_detected = Buffer.from(
          request.drawn_canvas.toBuffer()
        ).toString("base64");
      }

      const ld = new faceapi.LabeledFaceDescriptors(name, descriptors);
      await faceCollection.deleteMany({
        label: name,
      });
      const mongoInsertResult = await faceCollection.insertOne({
        label: ld.label,
        descriptors: ld.descriptors.map((d) => Array.from(d)),
        captured_face: Buffer.from(file_data).toString("base64"),
        captured_face_detected,
      });

      // const mongoInsertResult = true;
      await load_descriptors();
      return response.json({
        code: 200,
        mongoInsertResult,
        ld,
        labelled_descriptors,
      });
    } catch (error) {
      return response.json({
        code: 500,
        message: error?.message || "Unknown Error",
      });
    }
  }
);

module.exports = router;
