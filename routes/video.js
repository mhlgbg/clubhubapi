const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');

// Get all videos with search and pagination
router.get('/videos-by-links', videoController.getVideosByLinks);
router.get('/videos-paginated', videoController.getVideosPaginated);

router.get('/videos-for-mobile', videoController.getVideosForMobile);

router.get('/', videoController.getVideos);

// Add a new video
router.post('/', videoController.addVideo);

// Get a video by ID
router.get('/:id', videoController.getVideoById);

// Update a video by ID
router.put('/:id', videoController.updateVideo);

// Delete a video by ID
router.delete('/:id', videoController.deleteVideo);



module.exports = router;
