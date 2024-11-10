const mongoose = require('mongoose');
const { Schema } = mongoose;

const userTaskCommentSchema = new Schema({
    userTaskId: {
        type: Schema.Types.ObjectId,
        ref: 'UserTask', // Reference to the UserTask model
        required: true
    },
    userCommentId: {
        type: Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model for the person making the comment
        required: true
    },
    contentType: { type: String, enum: ['text', 'html', 'image', 'video'], required: true }, // Loại nội dung (Text thô, HTML (Rich text), Image URL, Video URL)

    content: {
        type: String,
        required: true
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

const UserTaskComment = mongoose.model('UserTaskComment', userTaskCommentSchema);

module.exports = UserTaskComment;
