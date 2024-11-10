const Category = require('../models/Category');
const CategoryArticle = require('../models/CategoryArticle');
const Article = require('../models/Article');

  
// Lấy danh sách categories với phân trang
exports.getCategories = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';

    const query = search ? { name: { $regex: search, $options: 'i' } } : {}; // Tìm kiếm theo tên

    const totalCategories = await Category.countDocuments(query); // Đếm tổng số categories
    const categories = await Category.find(query)
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      totalPages: Math.ceil(totalCategories / limit),
      currentPage: page,
      categories,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Lấy chi tiết category theo ID
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.status(200).json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Tạo mới category
exports.createCategory = async (req, res) => {
  try {
    const { code, name, thumbnail, description } = req.body;

    // Kiểm tra nếu mã code đã tồn tại
    const existingCategory = await Category.findOne({ code });
    if (existingCategory) {
      return res.status(400).json({ message: 'Category code already exists' });
    }

    const category = new Category({
      code,
      name,
      thumbnail,
      description,
    });

    await category.save();

    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Cập nhật category
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, thumbnail, description } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    category.code = code || category.code;
    category.name = name || category.name;
    category.thumbnail = thumbnail || category.thumbnail;
    category.description = description || category.description;

    await category.save();

    res.status(200).json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Xóa category
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    await category.remove();

    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.getCategoryArticlesByKey = async (req, res) => {
    const { key } = req.params; // Key của phân loại
    const page = parseInt(req.query.page) || 1; // Trang hiện tại, mặc định là 1
    const limit = parseInt(req.query.limit) || 12; // Số bài viết mỗi trang, mặc định là 12
  
    try {
      // Tìm phân loại dựa trên key
      const category = await Category.findOne({ code: key });
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
  
      // Tìm các bài viết liên kết với phân loại này
      const categoryArticles = await CategoryArticle.find({ categoryId: category._id })
        .populate({
          path: 'articleId',          
          select: 'key title summary thumbnailImage releaseDate', // Chọn các trường cần thiết
          options: { sort: { releaseDate: -1 } } // Sắp xếp giảm dần theo releaseDate
        });
  
      // Lấy danh sách các bài viết đã được populate và loại bỏ các giá trị null
      const articles = categoryArticles
        .map((item) => item.articleId)
        .filter((article) => article !== null);
  
      // Phân trang dữ liệu
      const totalArticles = articles.length;
      const totalPages = Math.ceil(totalArticles / limit);
      const paginatedArticles = articles.slice((page - 1) * limit, page * limit);
  
      // Trả về dữ liệu
      res.json({
        categoryName: category.name,
        articles: paginatedArticles,
        currentPage: page,
        totalPages,
        totalArticles,
      });
    } catch (error) {
      console.error('Error fetching category articles:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  

  
// Lấy các bài báo thuộc category
exports.getCategoryArticles = async (req, res) => {
    const { categoryId } = req.params;
    const { page = 1, limit = 12 } = req.query;
  
    try {
      const totalArticles = await CategoryArticle.countDocuments({ categoryId });
      const articles = await CategoryArticle.find({ categoryId })
        .populate('articleId')
        .skip((page - 1) * limit)
        .limit(parseInt(limit));
  
      res.status(200).json({
        articles: articles.map(a => a.articleId), // Trả về các bài báo đã được populate
        totalPages: Math.ceil(totalArticles / limit),
        currentPage: page,
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching category articles', error });
    }
  };
  
  // Thêm bài báo vào category
exports.addArticleToCategory = async (req, res) => {
    const { categoryId } = req.params;
    const { key } = req.body; // Key của bài báo cần thêm
  
    try {
      // Tìm bài báo theo key
      const article = await Article.findOne({ key });
      if (!article) return res.status(404).json({ message: 'Article not found' });
  
      // Kiểm tra xem bài báo đã tồn tại trong category chưa
      const existingCategoryArticle = await CategoryArticle.findOne({
        categoryId,
        articleId: article._id,
      });
  
      if (existingCategoryArticle) {
        return res.status(400).json({ message: 'Article already exists in this category' });
      }
  
      // Nếu bài báo chưa tồn tại trong category thì thêm mới
      const categoryArticle = new CategoryArticle({
        categoryId,
        articleId: article._id,
        createdBy: req.user.id, // Assuming req.user contains the logged in user's ID
      });
  
      await categoryArticle.save();
      res.status(201).json({ message: 'Article added to category' });
    } catch (error) {
      res.status(500).json({ message: 'Error adding article to category', error });
    }
  };
  
  // Xóa bài báo khỏi category
  exports.removeArticleFromCategory = async (req, res) => {
    const { categoryId, articleId } = req.params;
  
    try {
      await CategoryArticle.findOneAndDelete({ categoryId, articleId });
      res.status(200).json({ message: 'Article removed from category' });
    } catch (error) {
      res.status(500).json({ message: 'Error removing article from category', error });
    }
  };