const express = require('express');
const router = express.Router();
const issueCategoryController = require('../controllers/issueCategoryController');

// Route để lấy tất cả danh mục
router.get('/', issueCategoryController.getAllIssueCategories);

// Route để lấy một danh mục cụ thể
router.get('/:id', issueCategoryController.getIssueCategoryById);

// Route để tạo mới một danh mục
router.post('/', issueCategoryController.createIssueCategory);

// Route để cập nhật một danh mục
router.put('/:id', issueCategoryController.updateIssueCategory);

// Route để xóa một danh mục
router.delete('/:id', issueCategoryController.deleteIssueCategory);

module.exports = router;
