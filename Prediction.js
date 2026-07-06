const mongoose = require('mongoose');
const jsonDb = require('../config/jsonDb');

const PredictionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  soilMetrics: {
    nitrogen: { type: Number, required: true },
    phosphorus: { type: Number, required: true },
    potassium: { type: Number, required: true },
    temperature: { type: Number, required: true },
    humidity: { type: Number, required: true },
    pH: { type: Number, required: true },
    rainfall: { type: Number, required: true },
    soil_type: { type: String, default: 'Loamy' }
  },
  predictedCrop: { type: String, required: true },
  confidence: { type: Number, required: true },
  processingTimeMs: { type: Number, default: 0 }
}, { timestamps: true });

let MongoPrediction;
try {
  MongoPrediction = mongoose.model('Prediction', PredictionSchema);
} catch (e) {
  MongoPrediction = mongoose.model('Prediction');
}

const PredictionAdapter = {
  find: (query) => global.dbConnected ? MongoPrediction.find(query).sort({ createdAt: -1 }) : jsonDb.Prediction.find(query).then(arr => arr.reverse()),
  findOne: (query) => global.dbConnected ? MongoPrediction.findOne(query) : jsonDb.Prediction.findOne(query),
  findById: (id) => global.dbConnected ? MongoPrediction.findById(id) : jsonDb.Prediction.findById(id),
  create: (doc) => global.dbConnected ? MongoPrediction.create(doc) : jsonDb.Prediction.create(doc),
  findByIdAndUpdate: (id, update, options) => global.dbConnected ? MongoPrediction.findByIdAndUpdate(id, update, options) : jsonDb.Prediction.findByIdAndUpdate(id, update, options),
  findByIdAndDelete: (id) => global.dbConnected ? MongoPrediction.findByIdAndDelete(id) : jsonDb.Prediction.findByIdAndDelete(id),
  deleteOne: (query) => global.dbConnected ? MongoPrediction.deleteOne(query) : jsonDb.Prediction.deleteOne(query)
};

module.exports = PredictionAdapter;
