const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
  date: {
    type: Date, // Only the date part is needed
    required: true
  },
  playgroundId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Playground',
    required: true
  },
  fromHour: {
    type: Number,
    required: true,
    min: 0,
    max: 23
  },
  fromMinute: {
    type: Number,
    required: true,
    min: 0,
    max: 59
  },
  toHour: {
    type: Number,
    required: true,
    min: 0,
    max: 23
  },
  toMinute: {
    type: Number,
    required: true,
    min: 0,
    max: 59
  },
  status: {
    type: String,
    enum: ['rỗi', 'bận'], // Status of the time slot
    required: true
  },
  rentedBy: {
    type: mongoose.Schema.Types.ObjectId, // Reference to User who rented the slot
    ref: 'User',
    default: null // Can be null if not rented
  },
  notes: {
    type: String, // Any additional notes for the time slot
    default: null
  },
  rentalPricePerHour: {
    type: Number, // Price per hour for renting the playground
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

const TimeSlot = mongoose.model('TimeSlot', timeSlotSchema);

module.exports = TimeSlot;
