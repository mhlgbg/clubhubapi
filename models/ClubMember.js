const mongoose = require('mongoose');

const clubMemberSchema = new mongoose.Schema({
  clubId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  nickInClub: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['draft', 'rejected', 'approved', 'suspended'],
    required: true
  },
  joinDate: {
    type: Date,
    default: null // Can be null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true // User who created the record
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // User who last updated the record
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

const ClubMember = mongoose.model('ClubMember', clubMemberSchema);

module.exports = ClubMember;
