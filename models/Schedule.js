const mongoose = require('mongoose');
const { Schema } = mongoose;

const scheduleSchema = new Schema({
    classId: {
        type: Schema.Types.ObjectId,
        ref: 'Class', // Reference to the Class model
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model (optional, e.g., assigned teacher)
        required: false
    },
    date: {
        type: Date,
        required: true
    },
    startHour: {
        type: Number,
        required: true
    },
    startMinute: {
        type: Number,
        required: true
    },
    duration: {
        type: Number, // Duration in minutes
        required: true
    },
    status: {
        type: String,
        enum: ['draft', 'scheduled', 'completed', 'canceled', 'postponed'], // Add more statuses as needed
        default: 'scheduled'
    },
    note: {
        type: String,
        default: ''
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model (who created the schedule)
        required: true
    },

    // Report-related fields
    teacherNotes: [
        {
            title: { type: String, required: true },
            content: { type: String, required: true }
        }
    ],
    tasks: [
        {
            taskId: { type: Schema.Types.ObjectId, ref: 'Task', required: true },
            dueDate: { type: Date, required: true }
        }
    ],
    attendance: [
        {
            userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
            status: {
                type: String,
                enum: ['no_attendance', 'present', 'absent_unexcused', 'absent_excused', 'late'],
                required: true
            }
        }
    ],
    grades: [
        {
            assessmentName: { type: String, required: true },
            maxScore: {type: Number, require: true},
            scores: [
                {
                    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
                    score: { type: Number },
                    comment: { type: String, default: '' }
                }
            ]
        }
    ],
    privateMessages: [
        {
            userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
            messageContent: { type: String, required: true }
        }
    ],
    individualTasks: [
        {
            userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
            taskId: { type: Schema.Types.ObjectId, ref: 'Task', required: true },
            dueDate: { type: Date, required: true },
            notes: {type: String}
        }
    ]
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

const Schedule = mongoose.model('Schedule', scheduleSchema);

module.exports = Schedule;

