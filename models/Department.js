const mongoose = require('mongoose');

// Tạo enum cho các vai trò người dùng
const rolesEnum = ['Quản lý', 'Nhập liệu'];

const departmentSchema = new mongoose.Schema({
    code: { 
        type: String, 
        required: true, 
        unique: true 
    },
    name: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String, 
        default: null 
    },
    users: [{
        userId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User', 
            required: true 
        },
        role: { 
            type: String, 
            enum: rolesEnum, 
            required: true 
        }
    }]
}, {
    timestamps: true  // Tự động thêm các trường `createdAt` và `updatedAt`
});

const Department = mongoose.model('Department', departmentSchema);

module.exports = Department;
