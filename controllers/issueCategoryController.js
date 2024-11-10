const IssueCategory = require('../models/IssueCategory');

// Lấy tất cả các danh mục
exports.getAllIssueCategories = async (req, res) => {
    try {
        const issueCategories = await IssueCategory.find();
        res.json(issueCategories);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching issue categories', error });
    }
};

// Lấy một danh mục theo ID
exports.getIssueCategoryById = async (req, res) => {
    try {
        const issueCategory = await IssueCategory.findById(req.params.id);
        if (!issueCategory) {
            return res.status(404).json({ message: 'Issue category not found' });
        }
        res.json(issueCategory);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching issue category', error });
    }
};

// Tạo mới một danh mục
exports.createIssueCategory = async (req, res) => {
    try {
        const newIssueCategory = new IssueCategory({
            name: req.body.name,
            description: req.body.description,
        });
        const savedIssueCategory = await newIssueCategory.save();
        res.status(201).json(savedIssueCategory);
    } catch (error) {
        res.status(500).json({ message: 'Error creating issue category', error });
    }
};

// Cập nhật một danh mục
exports.updateIssueCategory = async (req, res) => {
    try {
        const updatedIssueCategory = await IssueCategory.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                description: req.body.description,
            },
            { new: true }
        );
        if (!updatedIssueCategory) {
            return res.status(404).json({ message: 'Issue category not found' });
        }
        res.json(updatedIssueCategory);
    } catch (error) {
        res.status(500).json({ message: 'Error updating issue category', error });
    }
};

// Xóa một danh mục
exports.deleteIssueCategory = async (req, res) => {
    try {
        const deletedIssueCategory = await IssueCategory.findByIdAndDelete(req.params.id);
        if (!deletedIssueCategory) {
            return res.status(404).json({ message: 'Issue category not found' });
        }
        res.json({ message: 'Issue category deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting issue category', error });
    }
};
