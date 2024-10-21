const mongoose = require('mongoose');

const IssueCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
    },
    createdDate: {
        type: Date,
        default: Date.now,
    },
});

const IssueCategory = mongoose.model('IssueCategory', IssueCategorySchema);
module.exports = IssueCategory;
