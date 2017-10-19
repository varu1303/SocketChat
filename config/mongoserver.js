const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/CHAT', { useMongoClient: true });

module.exports = mongoose.connection;