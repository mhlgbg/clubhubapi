const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserTaskSchema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Người dùng Id
  taskId: { type: Schema.Types.ObjectId, ref: 'Task', required: true },
  source: { type: String, enum: ['classroom', 'other'], required: true },
  sourceId: { type: String, required: true },
  dueDate: { type: Date, required: true },
  score: { type: Number, default: null },
  teacherComment: { type: String, default: '' },
  approvalTimestamp: { type: Date, default: null },
  approverId: { type: String, default: null },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UserTask', UserTaskSchema);