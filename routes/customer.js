const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { authenticateToken } = require('../middleware/authMiddleware');  // Import đúng middleware

const customerTodoListController = require('../controllers/customerTodoListController');

// Route để lấy danh sách ToDo cho một khách hàng
router.get('/:customerId/todos', customerTodoListController.getTodosByCustomerId);

router.get('/count', customerController.getCount);

// Route để thêm ToDo mới cho một khách hàng
router.post('/:customerId/todos', authenticateToken, customerTodoListController.createTodoItem);

// Route để cập nhật ToDo
router.put('/:customerId/todos/:id', customerTodoListController.updateTodoItem);

// Route để xóa ToDo
router.delete('/:customerId/todos/:id', customerTodoListController.deleteTodoItem);



// Routes for customers
router.get('/', customerController.getCustomers);

// Route thêm mới hoặc cập nhật khách hàng, bao gồm upload ảnh avatar
router.post('/', customerController.uploadAvatar, authenticateToken, customerController.createOrUpdateCustomer);
router.put('/:id', customerController.uploadAvatar, authenticateToken, customerController.createOrUpdateCustomer);

// Route xóa khách hàng
router.delete('/:id', customerController.deleteCustomer);

router.get('/birthday-report', customerController.getBirthdayReport);
router.get('/birthday-from-aday', customerController.getBirthdayFromADay);

router.get('/customer-statistics', customerController.getCustomerStatistics);


module.exports = router;
