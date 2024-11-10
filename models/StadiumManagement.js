const mongoose = require('mongoose');

const stadiumManagementSchema = new mongoose.Schema({
    sportId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sport',
        required: true
    },
    stadiumName: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    googleMapLink: {
        type: String
    },
    contactPhone: {
        type: String,
        required: true
    },
    avatar: {
        type: String, // URL or path to the stadium's avatar image
        default: null
    },
    imageLinks: {
        type: [String], // Array of image links (optional)
        default: []
    },
    youtubeLink: {
        type: String, // Link to a YouTube video about the stadium (optional)
        default: null
    },
    representativeName: {
        type: String, // Full name of the representative
        required: true
    },
    managers: [{
        type: mongoose.Schema.Types.ObjectId, // Reference to the User model
        ref: 'User',
        required: true
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId, // Reference to the user who last updated the record
        ref: 'User',
        default: null
    },
    introduction: {
        type: String, // Introduction or description about the stadium
        trim: true
    },
    pricingTable: {
        type: String, // HTML content for the pricing table
        trim: true
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

const StadiumManagement = mongoose.model('StadiumManagement', stadiumManagementSchema);

module.exports = StadiumManagement;
