const ArticleContent = require('../models/ArticleContent');
const Article = require('../models/Article');
//
const getArticlesWidthContents = async (req, res) => {
    console.log("getArticlesWidthContents: ", req.params.key);
    try {
        const article = await Article.findOne({ key: req.params.key })
            .populate('contents') // Populate để lấy dữ liệu từ ArticleContent
            .exec();

        if (!article) {
            return res.status(404).json({ message: 'Bài viết không tồn tại' });
        }

        res.json(article);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Lấy tất cả nội dung của một bài viết
const getContents = async (req, res) => {
    console.log("getContents: ", req.params.articleId);
    try {
        const contents = await ArticleContent.find({ articleId: req.params.articleId });
        res.json(contents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Tạo mới nội dung cho bài viết
const createContent = async (req, res) => {
    const { contentTitle, contentType, contentValue, displayOrder } = req.body;
    console.log('createContent', req.body);
    try {
        const newContent = new ArticleContent({
            articleId: req.params.articleId,
            contentTitle,
            contentType,
            contentValue,
            displayOrder
        });

        const savedContent = await newContent.save();

        // Cập nhật danh sách nội dung vào bài viết
        await Article.findByIdAndUpdate(req.params.articleId, { $push: { contents: savedContent._id } });

        res.status(201).json(savedContent);
    } catch (error) {
        console.log('createContent', error);
        res.status(400).json({ message: error.message });
    }
};

// Cập nhật nội dung của bài viết
const updateContent = async (req, res) => {
    console.log("updateContent: ");
    const { contentTitle, contentType, contentValue, displayOrder } = req.body;

    try {
        const updatedContent = await ArticleContent.findByIdAndUpdate(
            req.params.id,
            {
                contentTitle,
                contentType,
                contentValue,
                displayOrder
            },
            { new: true }
        );

        res.json(updatedContent);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Xóa nội dung của bài viết
const deleteContent = async (req, res) => {
    try {
        const content = await ArticleContent.findById(req.params.id);

        if (!content) {
            return res.status(404).json({ message: 'Content not found' });
        }

        // Xóa nội dung khỏi bài viết
        await Article.findByIdAndUpdate(content.articleId, { $pull: { contents: content._id } });

        // Xóa nội dung từ database
        await content.deleteOne();

        res.json({ message: 'Content deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getContents,
    createContent,
    updateContent,
    deleteContent,
    getArticlesWidthContents,
};
