const mongoose = require('mongoose');
const { Schema } = mongoose;

const companySchema = new Schema({
  name: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true,
    unique: true
  },
  foundedDate: {
    type: Date,
    required: false
  },
  taxCode: {
    type: String,
    required: false
  },
  registrationNumber: {
    type: String,
    required: false
  },
  address: {
    type: String,
    required: false
  },
  website: {
    type: String,
    required: false
  },
  notes: {
    type: String,
    required: false
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true
  }
}, {
  timestamps: true // This will add `createdAt` and `updatedAt` fields automatically
});

const Company = mongoose.model('Company', companySchema);

module.exports = Company;
