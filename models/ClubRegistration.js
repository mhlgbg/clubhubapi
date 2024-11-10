const mongoose = require('mongoose');

const clubRegistrationSchema = new mongoose.Schema({
    sportId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sport',
        required: true
    },
    clubName: {
        type: String,
        required: true,
        trim: true
    },
    avatar: {
        type: String, // URL or path to the club's avatar image
        trim: true,
        default: null // Can be null
    },
    location: {
        type: String, // Club's operating location
        trim: true,
        default: null // Can be null
    },
    operatingHours: {
        type: String, // Club's operating hours
        trim: true,
        default: null // Can be null
    },
    currentPresidentName: {
        type: String, // Full name of the current president
        trim: true,
        default: null // Can be null
    },
    managerName: {
        type: String, // Full name of the manager
        required: true,
        trim: true
    },
    managerTitle: {
        type: String, // Manager's title
        required: true,
        trim: true
    },
    managerEmail: {
        type: String,
        required: true,
        trim: true
    },
    managerPhoneNumber: {
        type: String,
        required: true,
        trim: true
    },
    foundedDate: {
        type: Date, // Date the club was founded
        default: null // Can be null
    },
    status: {
        type: String,
        enum: ['Đề nghị thành lập CLB', 'Trả lại hồ sơ', 'Được chấp nhận'], // Các trạng thái có thể
        default: 'Đề nghị thành lập CLB' // Giá trị mặc định
    },
    createdAt: {
        type: Date,
        default: Date.now // Timestamp when the record was created
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

const ClubRegistration = mongoose.model('ClubRegistration', clubRegistrationSchema);

module.exports = ClubRegistration;
