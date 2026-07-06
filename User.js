const mongoose = require('mongoose');
const jsonDb = require('../config/jsonDb');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['farmer', 'advisor', 'admin'], default: 'farmer' },
  farmDetails: {
    location: { type: String, default: '' },
    size: { type: Number, default: 0 },
    cropTypes: { type: [String], default: [] }
  }
}, { timestamps: true });

let MongoUser;
try {
  MongoUser = mongoose.model('User', UserSchema);
} catch (e) {
  MongoUser = mongoose.model('User');
}

const UserAdapter = {
  find: (query) => global.dbConnected ? MongoUser.find(query) : jsonDb.User.find(query),
  findOne: (query) => global.dbConnected ? MongoUser.findOne(query) : jsonDb.User.findOne(query),
  findById: (id) => global.dbConnected ? MongoUser.findById(id) : jsonDb.User.findById(id),
  create: (doc) => global.dbConnected ? MongoUser.create(doc) : jsonDb.User.create(doc),
  findByIdAndUpdate: (id, update, options) => global.dbConnected ? MongoUser.findByIdAndUpdate(id, update, options) : jsonDb.User.findByIdAndUpdate(id, update, options),
  findByIdAndDelete: (id) => global.dbConnected ? MongoUser.findByIdAndDelete(id) : jsonDb.User.findByIdAndDelete(id),
  deleteOne: (query) => global.dbConnected ? MongoUser.deleteOne(query) : jsonDb.User.deleteOne(query)
};

module.exports = UserAdapter;
