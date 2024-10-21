const mongoose = require('mongoose');

const coachSchema = new mongoose.Schema({
  nick: {
    type: String,
    required: true,
    trim: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  sportId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sport',
    required: true
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true
  },
  zaloLink: {
    type: String,
    trim: true
  },
  facebookLink: {
    type: String,
    trim: true
  },
  introduction: {
    type: String,
    trim: true
  },
  workingUnit: {
    type: String,
    trim: true
  },
  teachingArea: {
    type: String,
    trim: true
  },
  avatar: {
    type: String, // Assuming this is a URL or file path to the avatar image
    trim: true
  },
  systemJoinedAt: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Coach = mongoose.model('Coach', coachSchema);

module.exports = Coach;
