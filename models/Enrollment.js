const mongoose = require('mongoose');
const { Schema } = mongoose;

const enrollmentSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true
    },
    classId: {
        type: Schema.Types.ObjectId,
        ref: 'Class', // Reference to the Class model
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'dropped', 'pending'],
        default: 'active'
    },
    joinDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: false
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model (admin or teacher who created the record)
        required: true
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

module.exports = Enrollment;
