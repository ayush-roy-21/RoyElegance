const mongoose = require('mongoose');

const loginEventSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  timestamp: { type: Date, default: Date.now },
  ip: { type: String }
});

module.exports = mongoose.model('LoginEvent', loginEventSchema); 