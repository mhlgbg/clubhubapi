const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    avatar: {
        type: String, // URL or path to the avatar image
        default: null
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

const Class = mongoose.model('Class', classSchema);

module.exports = Class;
