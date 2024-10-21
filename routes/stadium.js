const express = require('express');
const stadiumController = require('../controllers/stadiumController');
const { authenticateToken } = require('../middleware/authMiddleware');  // Import đúng middleware

const router = express.Router();

const upload = require('../middleware/upload');  // Import module upload

// Lấy thông tin BQL Sân
//router.get('/:stadiumId', stadiumController.getStadiumInfo);

// Upload avatar
//router.put('/:stadiumId/upload-avatar', upload.single('avatar'), stadiumController.uploadAvatar);

// Thêm ảnh gallery
//router.put('/:stadiumId/add-image', upload.single('image'), stadiumController.addGalleryImage);

// Xóa ảnh gallery
//router.delete('/:stadiumId/delete-image', stadiumController.deleteGalleryImage);

router.get('/user-stadiums', authenticateToken, stadiumController.getUserManagedStadiums);
// Route upload avatar
router.put('/:stadiumId/upload-avatar', upload.single('avatar'), stadiumController.uploadAvatar);

// Route thêm ảnh gallery
router.put('/:stadiumId/add-image', upload.single('image'), stadiumController.addGalleryImage);

// Route xóa ảnh gallery
router.delete('/:stadiumId/delete-image', stadiumController.deleteGalleryImage);



router.get('/stadiums-paginated', stadiumController.getPaginatedStadiums);

router.get('/stadiums-by-ids', stadiumController.getStadiumsByIds);
// Routes for Stadium Management

router.get('/:stadiumId/timeslots', stadiumController.getTimeSlots);
router.get('/:id', stadiumController.getStadiumById); // Get a stadium by ID
router.get('/', stadiumController.getAllStadiums); // Get all stadiums

router.post('/', authenticateToken, stadiumController.createStadium); // Create a new stadium
router.put('/:id', authenticateToken, stadiumController.updateStadium); // Update a stadium by ID
router.delete('/:id', stadiumController.deleteStadium); // Delete a stadium by ID
// Get managers of a stadium
router.get('/:id/managers', stadiumController.getStadiumManagers);

// Add manager to a stadium
router.post('/:id/add-manager', stadiumController.addManagerToStadium);

// Remove manager from a stadium
router.delete('/:id/remove-manager/:managerId', stadiumController.removeManagerFromStadium);



module.exports = router;
