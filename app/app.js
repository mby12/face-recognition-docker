// Get the environmental variables 
port = process.env.PORT || 1890;
weights_path = process.env.WEIGHTS_PATH || './app/weights';
descriptor_path = process.env.DESCRIPTOR_PATH || './app/descriptors.json';
use_tf = process.env.USE_TF || 'true';

// Handle kill commands gracefully
process.on('SIGTERM', function () {
    server.close();
    process.exit(0);
});
process.on('SIGINT', function () {
    server.close();
    process.exit(0);
});

// Load Tensorflow.js 
try {
    const tf = require('@tensorflow/tfjs-node');
    console.log('Loaded tfjs-node version', tf.version_core);
}
catch (err) {
    console.warn('Unable to load tfjs-node\n', err);
}

// Import the express modules

// Import the helper modules
const load_models = require('./helpers/load_models');
const load_descriptors = require('./helpers/load_descriptors');
const parse_model_options = require('./helpers/parse_model_options');
const parse_detection_options = require('./helpers/parse_detection_options');
const globalMongoConnection = require('./helpers/mongo_connection');
const express_app = require('./helpers/express_app');
var cors = require('cors')

function init() {
    // Load in Application Variables 
    load_models(weights_path).then((result) => {
        express_app.locals.models_loaded = result;
    }).catch(err => {
        throw (err);
    })
    load_descriptors();
}

express_app.locals.model_options = parse_model_options(process.env.MODEL_OPTIONS || { model: 'ssd', minConfidence: 0.6 });
express_app.locals.detection_options = parse_detection_options(process.env.DETECTION_OPTIONS || {});
express_app.use(cors());
// Configure the routes
express_app.use(require('./routes/index'));

// Start the application
let server = express_app.listen(port, function () {
    globalMongoConnection.connect().then(function () {
        init();
        console.log("mongo connected");
        console.log(`Listening on port ${port}...`);
    });
});