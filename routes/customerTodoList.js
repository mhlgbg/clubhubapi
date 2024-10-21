const express = require('express');
const router = express.Router();
const todoListController = require('../controllers/customerTodoListController');

// Routes for customer todo lists
router.post('/', todoListController.createTodoItem);
router.get('/:customerId', todoListController.getTodosByCustomerId);
router.put('/:id', todoListController.updateTodoItem);
router.delete('/:id', todoListController.deleteTodoItem);

module.exports = router;
