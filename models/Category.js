const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String, // URL to the thumbnail image
    required: false
  },
  description: {
    type: String,
    required: false
  }
}, {
  timestamps: true // This will add `createdAt` and `updatedAt` fields automatically
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
