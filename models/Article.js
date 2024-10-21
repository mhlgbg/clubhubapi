const mongoose = require('mongoose');
require('./ArticleContent');  // Import mô hình ArticleContent trước


const articleSchema = new mongoose.Schema({
  key: { type: String, required: true },
  title: { type: String, required: true },
  summary: { type: String },
  thumbnailImage: { type: String },
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  releaseDate: { type: Date },
  createdDate: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lastUpdatedDate: { type: Date },
  lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  contents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ArticleContent'
  }],  
});

module.exports = mongoose.model('Article', articleSchema);
