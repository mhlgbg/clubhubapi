const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload'); // Middleware multer

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

router.post('/upload', upload.single('thumbnailImage'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    // Trả lại đường dẫn file sau khi upload
    const filePath = `/uploads/${req.file.filename}`;
    res.status(200).json({ url: filePath });
  });

  
module.exports = router;
