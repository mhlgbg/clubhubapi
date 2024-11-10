const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserGradeSchema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Người dùng Id
  assessmentDate: { type: Date, required: true },
  assessmentName: { type: String, required: true },
  maxScore: { type: Number, required: true },
  score: { type: Number, required: true },
  comment: { type: String, default: '' },
  source: { type: String, enum: ['classroom', 'exam', 'other'], required: true },
  sourceId: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UserGrade', UserGradeSchema);
