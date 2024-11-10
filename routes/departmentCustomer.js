const express = require('express');
const router = express.Router();
const departmentCustomerController = require('../controllers/departmentCustomerController');
const { authenticateToken } = require('../middleware/authMiddleware');  // Import đúng middleware

// Lấy danh sách các phòng ban mà người dùng được phân công
router.get('/departments', authenticateToken, departmentCustomerController.getUserDepartments);

// Lấy danh sách khách hàng của một phòng ban với phân quyền
router.get('/departments/:departmentId/customers', authenticateToken, departmentCustomerController.getDepartmentCustomers);

// Thêm khách hàng mới
router.post('/departments/:departmentId/customers', departmentCustomerController.uploadAvatar, authenticateToken, departmentCustomerController.addCustomer);

// Sửa thông tin khách hàng (chỉ cho phép với trạng thái 'pending')
router.put('/departments/customers/:customerId', departmentCustomerController.uploadAvatar, authenticateToken, departmentCustomerController.updateCustomer);

// Xóa khách hàng (chỉ cho phép với trạng thái 'pending')
router.delete('/departments/:departmentId/customers/:customerId', departmentCustomerController.deleteCustomer);

module.exports = router;
