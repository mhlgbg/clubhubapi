const Article = require('../models/Article');

// Lấy tất cả các bài viết
/*
const getArticles = async (req, res) => {
    try {
        const articles = await Article.find().populate('createdBy').populate('lastUpdatedBy').populate('contents');
        res.json(articles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
*/
const getArticles = async (req, res) => {
    const { page = 1, limit = 10, search = '' } = req.query;

    try {
        // Tạo bộ lọc tìm kiếm theo tiêu đề bài viết
        const query = search ? { title: { $regex: search, $options: 'i' } } : {};

        // Lấy tổng số bài viết theo điều kiện tìm kiếm
        const total = await Article.countDocuments(query);

        // Tìm các bài viết có phân trang và sắp xếp theo ngày đăng (releaseDate giảm dần)
        const articles = await Article.find(query)
            .sort({ releaseDate: -1 }) // Sắp xếp theo releaseDate (mới nhất trước)
            .limit(limit * 1) // Giới hạn số lượng bài viết mỗi trang
            .skip((page - 1) * limit) // Bỏ qua các bài viết của trang trước đó
            .populate('createdBy lastUpdatedBy contents');  // Nếu cần populate các trường liên kết

        res.json({
            articles,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// Lấy bài viết theo ID
const getArticleById = async (req, res) => {
    try {
        const article = await Article.findById(req.params.id).populate('createdBy').populate('lastUpdatedBy').populate('contents');
        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }
        res.json(article);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Tạo mới bài viết
const createArticle = async (req, res) => {
    
    console.log("createArticle: ", req.user);
    const { key, title, summary, thumbnailImage, status, releaseDate, contents } = req.body;

    // Lấy thông tin người dùng từ token (đã được xác thực trước đó)
    
    const createdBy = req.user.id;  // Giả sử bạn đã xác thực và thêm `user` vào `req`
    
    try {
        const article = new Article({ 
            key, 
            title, 
            summary, 
            thumbnailImage, 
            status, 
            releaseDate, 
            createdBy,  // Thêm createdBy từ token
            contents 
        });
        const newArticle = await article.save();
        res.status(201).json(newArticle);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
// Cập nhật bài viết
const updateArticle = async (req, res) => {
    try {
        const { key, title, summary, thumbnailImage, status, releaseDate, lastUpdatedBy, contents } = req.body;
        const article = await Article.findByIdAndUpdate(req.params.id, { key, title, summary, thumbnailImage, status, releaseDate, lastUpdatedBy, contents }, { new: true });
        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }
        res.json(article);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Xóa bài viết
const deleteArticle = async (req, res) => {
    try {
        const article = await Article.findByIdAndDelete(req.params.id);
        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }
        res.json({ message: 'Article deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getArticles, getArticleById, createArticle, updateArticle, deleteArticle };
