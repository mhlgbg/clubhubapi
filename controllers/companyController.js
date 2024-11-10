const Company = require('../models/Company');

// Get all companies with pagination and search
exports.getAllCompaniesPage = async (req, res) => {
    try {
      // Lấy thông tin phân trang và tìm kiếm từ query
      const { page = 1, limit = 5, search = '' } = req.query;
  
      // Chuyển đổi `page` và `limit` thành số nguyên
      const pageNumber = parseInt(page);
      const limitNumber = parseInt(limit);
  
      // Tạo query tìm kiếm theo tên hoặc mã công ty
      const query = search
        ? { $or: [{ name: { $regex: search, $options: 'i' } }, { code: { $regex: search, $options: 'i' } }] }
        : {};
  
      // Lấy dữ liệu công ty theo phân trang và tìm kiếm
      const companies = await Company.find(query)
        .populate('createdBy', 'fullName')
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber);
  
      // Đếm tổng số công ty (sau khi áp dụng điều kiện tìm kiếm)
      const totalCompanies = await Company.countDocuments(query);
  
      // Trả về dữ liệu với thông tin phân trang
      res.status(200).json({
        companies,
        totalPages: Math.ceil(totalCompanies / limitNumber),
        currentPage: pageNumber,
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching companies', error });
    }
  };
//Get all
// Lấy tất cả các môn thể thao
exports.getAllCompanies = async (req, res) => {
    try {
        const companies = await Company.find();
        res.json(companies);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single company by ID
exports.getCompanyById = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id).populate('createdBy', 'name');
    if (!company) return res.status(404).json({ message: 'Company not found' });
    res.status(200).json(company);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching company', error });
  }
};

// Create a new company
exports.createCompany = async (req, res) => {
  try {
    const company = new Company({ ...req.body, createdBy: req.user.id });
    await company.save();
    res.status(201).json(company);
  } catch (error) {
    res.status(400).json({ message: 'Error creating company', error });
  }
};

// Update a company by ID
exports.updateCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!company) return res.status(404).json({ message: 'Company not found' });
    res.status(200).json(company);
  } catch (error) {
    res.status(400).json({ message: 'Error updating company', error });
  }
};

// Delete a company by ID
exports.deleteCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);
    if (!company) return res.status(404).json({ message: 'Company not found' });
    res.status(200).json({ message: 'Company deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting company', error });
  }
};
