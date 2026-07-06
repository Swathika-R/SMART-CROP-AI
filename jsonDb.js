const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function getFilePath(collection) {
  return path.join(DATA_DIR, `${collection}.json`);
}

function readData(collection) {
  const filePath = getFilePath(collection);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([], null, 2));
    return [];
  }
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error(`Error reading ${collection} collection:`, err);
    return [];
  }
}

function writeData(collection, data) {
  const filePath = getFilePath(collection);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(`Error writing ${collection} collection:`, err);
  }
}

class JsonModel {
  constructor(collectionName) {
    this.collection = collectionName;
  }

  async find(query = {}) {
    const items = readData(this.collection);
    return items.filter(item => {
      for (const key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });
  }

  async findOne(query = {}) {
    const items = readData(this.collection);
    return items.find(item => {
      for (const key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    }) || null;
  }

  async findById(id) {
    const items = readData(this.collection);
    return items.find(item => item._id === id) || null;
  }

  async create(doc) {
    const items = readData(this.collection);
    const newDoc = {
      _id: Math.random().toString(36).substring(2, 11),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...doc
    };
    items.push(newDoc);
    writeData(this.collection, items);
    return newDoc;
  }

  async findByIdAndUpdate(id, update, options = {}) {
    const items = readData(this.collection);
    const index = items.findIndex(item => item._id === id);
    if (index === -1) return null;

    items[index] = {
      ...items[index],
      ...update,
      updatedAt: new Date().toISOString()
    };
    writeData(this.collection, items);
    return items[index];
  }

  async findByIdAndDelete(id) {
    const items = readData(this.collection);
    const index = items.findIndex(item => item._id === id);
    if (index === -1) return null;

    const deleted = items.splice(index, 1)[0];
    writeData(this.collection, items);
    return deleted;
  }

  async deleteOne(query = {}) {
    const items = readData(this.collection);
    const index = items.findIndex(item => {
      for (const key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });
    if (index === -1) return { deletedCount: 0 };
    items.splice(index, 1);
    writeData(this.collection, items);
    return { deletedCount: 1 };
  }
}

module.exports = {
  dbType: 'JSON_FILE_FALLBACK',
  User: new JsonModel('users'),
  Prediction: new JsonModel('predictions'),
  ImageAnalysis: new JsonModel('image_analyses'),
  MarketData: new JsonModel('market_data'),
  Feedback: new JsonModel('feedbacks')
};
