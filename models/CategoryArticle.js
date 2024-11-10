const mongoose = require('mongoose');
const { Schema } = mongoose;

const categoryArticleSchema = new Schema({
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: 'Category', // Reference to the Category model
    required: true
  },
  articleId: {
    type: Schema.Types.ObjectId,
    ref: 'Article', // Reference to the Article model
    required: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true
  }
}, {
  timestamps: true // This will add `createdAt` and `updatedAt` fields automatically
});

const CategoryArticle = mongoose.model('CategoryArticle', categoryArticleSchema);

module.exports = CategoryArticle;
