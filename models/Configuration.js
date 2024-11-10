const mongoose = require('mongoose');

const configurationSchema = new mongoose.Schema({
  configKey: {
    type: String,
    required: true,
    unique: true,
  },
  configValueType: {
    type: String,
    required: true,
  },
  configValue: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('Configuration', configurationSchema);
