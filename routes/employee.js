const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { authenticateToken } = require('../middleware/authMiddleware');  // Import đúng middleware

const multer = require('multer')

// Cấu hình multer để xử lý tải lên ảnh đại diện
const storage = multer.diskStorage({    
    destination: function (req, file, cb) {
        cb(null, 'uploads/avatar_employees/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
})
const upload = multer({ storage })

router.post('/avatar/upload', authenticateToken, upload.single('avatar'), employeeController.uploadAvatar);

// Lấy danh sách nhân viên với tìm kiếm và phân trang
router.get('/', employeeController.getEmployees);

// Lấy thông tin chi tiết của một nhân viên
router.get('/:id', employeeController.getEmployeeById);

// Tạo một nhân viên mới
router.post('/', authenticateToken, employeeController.createEmployee);

// Cập nhật thông tin nhân viên
router.put('/:id', employeeController.updateEmployee);

// Xóa nhân viên
router.delete('/:id', employeeController.deleteEmployee);

router.put('/:id/jobInfo', authenticateToken, employeeController.updateJobInfo);
router.put('/:id/personalInfo', authenticateToken, employeeController.updatePersonalInfo);
router.put('/:id/payrollInfo', authenticateToken, employeeController.updatePayrollInfo);
router.put('/:id/educationAndCertifications', authenticateToken, employeeController.updateEducationAndCertifications);
router.post('/:id/workExperience', authenticateToken, employeeController.addWorkExperience);
router.delete('/:id/workExperience/:experienceId', authenticateToken, employeeController.removeWorkExperience);

module.exports = router;
