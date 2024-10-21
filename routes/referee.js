const express = require('express');
const router = express.Router();
const refereeController = require('../controllers/refereeController');

// Routes for managing referees
router.get('/referees/referees-for-mobile', refereeController.getRefereesForMobile);
router.get('/referees', refereeController.getReferees);
router.post('/referees', refereeController.createReferee);
router.put('/referees/:id', refereeController.updateReferee);
router.delete('/referees/:id', refereeController.deleteReferee);
router.get('/referees/referees-by-ids', refereeController.getRefereesByIds);
router.get('/referees/referees-paginated', refereeController.getPaginatedReferees);

module.exports = router;
