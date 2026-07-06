const mongoose = require('mongoose');
const jsonDb = require('../config/jsonDb');

const ImageAnalysisSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  imageUrl: { type: String, required: true },
  cropType: { type: String, required: true },
  detectedDisease: { type: String, required: true },
  severity: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  confidence: { type: Number, required: true },
  treatments: { type: [String], default: [] }
}, { timestamps: true });

let MongoImageAnalysis;
try {
  MongoImageAnalysis = mongoose.model('ImageAnalysis', ImageAnalysisSchema);
} catch (e) {
  MongoImageAnalysis = mongoose.model('ImageAnalysis');
}

const ImageAnalysisAdapter = {
  find: (query) => global.dbConnected ? MongoImageAnalysis.find(query).sort({ createdAt: -1 }) : jsonDb.ImageAnalysis.find(query).then(arr => arr.reverse()),
  findOne: (query) => global.dbConnected ? MongoImageAnalysis.findOne(query) : jsonDb.ImageAnalysis.findOne(query),
  findById: (id) => global.dbConnected ? MongoImageAnalysis.findById(id) : jsonDb.ImageAnalysis.findById(id),
  create: (doc) => global.dbConnected ? MongoImageAnalysis.create(doc) : jsonDb.ImageAnalysis.create(doc),
  findByIdAndUpdate: (id, update, options) => global.dbConnected ? MongoImageAnalysis.findByIdAndUpdate(id, update, options) : jsonDb.ImageAnalysis.findByIdAndUpdate(id, update, options),
  findByIdAndDelete: (id) => global.dbConnected ? MongoImageAnalysis.findByIdAndDelete(id) : jsonDb.ImageAnalysis.findByIdAndDelete(id),
  deleteOne: (query) => global.dbConnected ? MongoImageAnalysis.deleteOne(query) : jsonDb.ImageAnalysis.deleteOne(query)
};

module.exports = ImageAnalysisAdapter;
