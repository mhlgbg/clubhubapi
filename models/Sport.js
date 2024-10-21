const mongoose = require('mongoose');

const sportSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  avatar: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

const Sport = mongoose.model('Sport', sportSchema);

module.exports = Sport;
