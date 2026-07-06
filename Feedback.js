const mongoose = require('mongoose');
const jsonDb = require('../config/jsonDb');

const FeedbackSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  username: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  voiceUrl: { type: String, default: '' }
}, { timestamps: true });

let MongoFeedback;
try {
  MongoFeedback = mongoose.model('Feedback', FeedbackSchema);
} catch (e) {
  MongoFeedback = mongoose.model('Feedback');
}

const FeedbackAdapter = {
  find: (query) => global.dbConnected ? MongoFeedback.find(query).sort({ createdAt: -1 }) : jsonDb.Feedback.find(query).then(arr => [...arr].reverse()),
  findOne: (query) => global.dbConnected ? MongoFeedback.findOne(query) : jsonDb.Feedback.findOne(query),
  findById: (id) => global.dbConnected ? MongoFeedback.findById(id) : jsonDb.Feedback.findById(id),
  create: (doc) => global.dbConnected ? MongoFeedback.create(doc) : jsonDb.Feedback.create(doc),
  findByIdAndUpdate: (id, update, options) => global.dbConnected ? MongoFeedback.findByIdAndUpdate(id, update, options) : jsonDb.Feedback.findByIdAndUpdate(id, update, options),
  findByIdAndDelete: (id) => global.dbConnected ? MongoFeedback.findByIdAndDelete(id) : jsonDb.Feedback.findByIdAndDelete(id)
};

module.exports = FeedbackAdapter;
