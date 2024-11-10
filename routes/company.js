const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');

// Middleware for authentication (assuming you have a middleware function for this)
const { authenticateToken } = require('../middleware/authMiddleware');  // Import đúng middleware

// Get all companies
router.get('/all', companyController.getAllCompanies);

router.get('/', companyController.getAllCompaniesPage);



// Get a single company by ID
router.get('/:id', companyController.getCompanyById);

// Create a new company
router.post('/', authenticateToken, companyController.createCompany);

// Update a company by ID
router.put('/:id', companyController.updateCompany);

// Delete a company by ID
router.delete('/:id', companyController.deleteCompany);

module.exports = router;
