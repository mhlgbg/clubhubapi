const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema({
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
  joinCode: {
    type: String,        
  },
  uniqueUrl: {
    type: String,    
  },
  avatar: {
    type: String, // URL or path to the club's avatar image
    trim: true
  },
  foundedDate: {
    type: Date, // Date of club's establishment
    required: true
  },
  operatingHours: {
    type: String, // Club's operating hours (e.g., "9 AM - 5 PM")
    trim: true
  },
  location: {
    type: String, // Club's location for activities
    required: true,
    trim: true
  },
  president: {
    type: String, // Current president's name
    required: true,
    trim: true
  },
  introduction: {
    type: String, // Introduction about the club
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now // Timestamp for when the record is created
  },
  notes: {
    type: String, // Any additional notes about the club
    trim: true
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

const Club = mongoose.model('Club', clubSchema);

module.exports = Club;
