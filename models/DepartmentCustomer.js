const mongoose = require('mongoose');

const departmentCustomerSchema = new mongoose.Schema({
  departmentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Department', 
    required: true 
  },
  customerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Customer', 
    required: true 
  }
}, {
  timestamps: true // Tự động thêm các trường `createdAt` và `updatedAt`
});

const DepartmentCustomer = mongoose.model('DepartmentCustomer', departmentCustomerSchema);

module.exports = DepartmentCustomer;
