const mongoose = require('mongoose');


const articleContentSchema = new mongoose.Schema({
    articleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Article', required: true }, // Thông báo Id
    contentTitle: { type: String, required: true }, // Tiêu đề nội dung
    contentType: { type: String, enum: ['text', 'html', 'image', 'video'], required: true }, // Loại nội dung (Text thô, HTML (Rich text), Image URL, Video URL)
    contentValue: { type: String, required: true }, // Giá trị nội dung (text, URL cho hình ảnh hoặc video)
    displayOrder: { type: Number, default: 0 } // Thứ tự hiển thị
  });
  
  module.exports = mongoose.model('ArticleContent', articleContentSchema); // Export mô hình với tên 'Notification'
