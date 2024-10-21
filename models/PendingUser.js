const mongoose = require('mongoose');

const pendingUserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    trim: true,
    default: null // Optional phone number
  },
  activationToken: {
    type: String,
    required: true
  },
  tokenExpirationDate: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  status: {
    type: String,
    required: true
  },
  roles: {
    type: String,
    required: true
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

const PendingUser = mongoose.model('PendingUser', pendingUserSchema);

module.exports = PendingUser;
