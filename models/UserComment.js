const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserCommentSchema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Người dùng Id
  title: { type: String, required: true },
  messageContent: { type: String, required: true },
  readTimestamp: { type: Date, default: null },
  status: { type: String, enum: ['new', 'seen', 'read'], default: 'new' },
  source: { type: String, enum: ['classroom', 'other'], required: true },
  sourceId: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UserComment', UserCommentSchema);
