const CustomerTodoList = require('../models/CustomerTodoList');

// Create a new customer todo item
exports.createTodoItem = async (req, res) => {
    try {
        const customerId = req.params.customerId; // Lấy customerId từ URL
        const todoItem = new CustomerTodoList({
            ...req.body,
            customerId: customerId  // Thêm customerId vào todoItem
        });
        await todoItem.save();
        res.status(201).json(todoItem);
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: 'Error creating todo item', error });
    }
};
// Get all todo items for a specific customer
exports.getTodosByCustomerId = async (req, res) => {    
    try {
        const todos = await CustomerTodoList.find({ customerId: req.params.customerId });
        console.log("getTodosByCustomerId ", todos);
        res.status(200).json(todos);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving todo items', error });
    }
};

// Update a todo item
exports.updateTodoItem = async (req, res) => {
    try {
        const todoItem = await CustomerTodoList.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!todoItem) {
            return res.status(404).json({ message: 'Todo item not found' });
        }
        res.status(200).json(todoItem);
    } catch (error) {
        res.status(400).json({ message: 'Error updating todo item', error });
    }
};

// Delete a todo item
exports.deleteTodoItem = async (req, res) => {
    try {
        const todoItem = await CustomerTodoList.findByIdAndDelete(req.params.id);
        if (!todoItem) {
            return res.status(404).json({ message: 'Todo item not found' });
        }
        res.status(200).json({ message: 'Todo item deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting todo item', error });
    }
};
