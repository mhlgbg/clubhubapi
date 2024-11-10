const express = require('express');
const router = express.Router();
const clubUserController = require('../controllers/clubUserController');

// Routes for managing Club-User relationships
router.get('/', clubUserController.getClubUsers);
router.post('/', clubUserController.createClubUser);
router.put('/:id', clubUserController.updateClubUser);
router.delete('/:id', clubUserController.deleteClubUser);

module.exports = router;
