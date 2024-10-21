const mongoose = require('mongoose');

const stadiumRegistrationSchema = new mongoose.Schema({
    sportId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sport',
        required: true
    },
    stadiumName: {
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
    managerName: {
        type: String, // Full name of the manager
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
    status: {
        type: String,
        enum: ['Đề nghị phê duyệt', 'Được chấp nhận'], // Các trạng thái có thể
        default: 'Đề nghị phê duyệt' // Giá trị mặc định
    },
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

const StadiumRegistration = mongoose.model('StadiumRegistration', stadiumRegistrationSchema);

module.exports = StadiumRegistration;
