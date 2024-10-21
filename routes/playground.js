const express = require('express');
const router = express.Router();
const playgroundController = require('../controllers/playgroundController');

// Get all playgrounds
router.get('/', playgroundController.getAllPlaygrounds);

// Get playground by ID
router.get('/:id', playgroundController.getPlaygroundById);

// Create a new playground
router.post('/', playgroundController.createPlayground);

// Update a playground
router.put('/:playgroundId', playgroundController.updatePlayground);

// Delete a playground
router.delete('/:playgroundId', playgroundController.deletePlayground);

// Lấy danh sách các sân chơi theo Ban Quản Lý
router.get('/get-playgrounds/:stadiumManagementId', playgroundController.getPlaygroundsByStadium);

// Thêm, sửa, xóa sân chơi
//router.post('/playgrounds', playgroundController.createPlayground);
//router.put('/:playgroundId', playgroundController.updatePlayground);
//router.delete('/playgrounds/:playgroundId', playgroundController.deletePlayground);

module.exports = router;
