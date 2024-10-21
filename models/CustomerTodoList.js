const mongoose = require('mongoose');

const customerTodoListSchema = new mongoose.Schema({
    customerId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Customer', 
        required: true 
    },
    title: { 
        type: String, 
        required: true 
    },
    dueDate: { 
        type: Date, 
        required: true 
    },
    notes: { 
        type: String, 
        default: null 
    }
});

const CustomerTodoList = mongoose.model('CustomerTodoList', customerTodoListSchema);

module.exports = CustomerTodoList;
