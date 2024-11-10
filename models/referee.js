const mongoose = require('mongoose');

const refereeSchema = new mongoose.Schema({
    sportId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sport',
        required: true
    },
    nick: {
        type: String,
        required: true,
        trim: true
    },
    avatar: {
        type: String, // URL or path to the referee's avatar image
        trim: true
    },
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    phoneNumber: {
        type: String,
        required: true,
        trim: true
    },
    zaloLink: {
        type: String, // Link to the referee's Zalo profile
        trim: true
    },
    facebookLink: {
        type: String, // Link to the referee's Facebook profile
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String, // Brief description about the referee
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now // Timestamp when the record is created
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

const Referee = mongoose.model('Referee', refereeSchema);

module.exports = Referee;
