const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');

// Route to get all departments
router.get('/', departmentController.getDepartments);
router.get('/all', departmentController.getAllDepartments);
router.get('/users/:userId/departments', departmentController.getDepartmentsOfUser);

// Route to get a specific department by ID
router.get('/:id', departmentController.getDepartmentById);

// Route to create a new department
router.post('/', departmentController.createDepartment);

// Route to update an existing department by ID
router.put('/:id', departmentController.updateDepartment);

router.put('/users/:userId/addDepartment', departmentController.updateDepartmentOfUser);


// Route to delete a department by ID
router.delete('/:id', departmentController.deleteDepartment);


router.get('/:departmentId/users', departmentController.getDepartmentUsers);

// Route để thêm người dùng vào phòng ban
router.post('/:departmentId/users', departmentController.addUserToDepartment);

// Route để xóa người dùng khỏi phòng ban
router.delete('/:departmentId/users/:userId', departmentController.removeUserFromDepartment);


router.delete('/departments/:departmentId/users/:userId', departmentController.removeDepartmentFromUser);

module.exports = router;
