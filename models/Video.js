const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  sportId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sport',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  youtubeLink: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  videoDate: {
    type: Date,
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

const Video = mongoose.model('Video', videoSchema);

module.exports = Video;

