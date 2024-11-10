const mongoose = require('mongoose');

const playgroundSchema = new mongoose.Schema({
  stadiumManagementId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StadiumManagement',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  orientation: {
    type: String, // Orientation of the playground (e.g., North-South, East-West)
    required: true
  },
  status: {
    type: String,
    enum: ['Sẵn sàng cho thuê', 'Không sẵn sàng cho thuê'],
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

const Playground = mongoose.model('Playground', playgroundSchema);

module.exports = Playground;
