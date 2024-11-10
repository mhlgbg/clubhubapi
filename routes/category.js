const express = require('express');
const categoryController = require('../controllers/categoryController');
const upload = require('../middleware/upload'); // Middleware multer
const { authenticateToken } = require('../middleware/authMiddleware');  // Import đúng middleware



const router = express.Router();

// Routes for Category
router.get('/', categoryController.getCategories); // Lấy danh sách categories với phân trang
router.get('/:id', categoryController.getCategoryById); // Lấy chi tiết 1 category theo ID
router.post('/', categoryController.createCategory); // Tạo mới category
router.put('/:id', categoryController.updateCategory); // Cập nhật category
router.delete('/:id', categoryController.deleteCategory); // Xóa category


// Quản lý bài báo trong category
router.get('/:categoryId/articles', categoryController.getCategoryArticles);
router.post('/:categoryId/articles', authenticateToken, categoryController.addArticleToCategory);
router.delete('/:categoryId/articles/:articleId', categoryController.removeArticleFromCategory);
router.get('/cat/:key/articles', categoryController.getCategoryArticlesByKey);


router.post('/upload', upload.single('thumbnail'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    // Trả lại đường dẫn file sau khi upload
    const filePath = `/uploads/${req.file.filename}`;
    res.status(200).json({ url: filePath });
  });

  

module.exports = router;
