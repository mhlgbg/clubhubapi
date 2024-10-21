const express = require('express');
const router = express.Router();

const { authenticateToken } = require('../middleware/authMiddleware');  // Import đúng middleware

const { createArticle, getArticleById, getArticles, updateArticle, deleteArticle } = require('../controllers/articleController');
const { getContents, createContent, updateContent, deleteContent, getArticlesWidthContents } = require('../controllers/articleContentController');

// Route cho các bài viết

router.get('/', getArticles);
router.get('/:id', getArticleById);
router.post('/', authenticateToken, createArticle);  // Sử dụng middleware authenticateToken
router.put('/:id', updateArticle);
router.delete('/:id', deleteArticle);


// Route quản lý nội dung

router.get('/:articleId/contents', getContents);
router.get('/article/:key/contents', getArticlesWidthContents);
router.post('/:articleId/contents', createContent);
router.put('/contents/:id', updateContent);
router.delete('/contents/:id', deleteContent);


module.exports = router;
