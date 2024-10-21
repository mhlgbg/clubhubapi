const Department = require('../models/Department');
const DepartmentCustomer = require('../models/DepartmentCustomer');
const Customer = require('../models/Customer');
const upload = require('../middleware/upload'); // Import upload middleware

// Lấy danh sách phòng ban mà người dùng được phân công
exports.getUserDepartments = async (req, res) => {
  try {

    const userId = req.user.id; // Người dùng hiện tại
    const departments = await Department.find({ 'users.userId': userId });

    if (departments.length === 0) {
      return res.status(404).json({ message: 'Bạn không được phân công quản lý phòng ban nào' });
    }

    res.status(200).json(departments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Lấy danh sách khách hàng của một phòng ban với phân quyền và phân trang
exports.getDepartmentCustomers = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const userId = req.user.id;

    // Lấy thông tin phân trang từ query
    const page = parseInt(req.query.page) || 1; // Trang hiện tại
    const limit = parseInt(req.query.limit) || 12; // Số lượng khách hàng trên mỗi trang
    const skip = (page - 1) * limit;

    // Tìm phòng ban và kiểm tra quyền của người dùng
    const department = await Department.findById(departmentId).select('users').populate('users.userId', 'email');
    if (!department) {
      return res.status(404).json({ message: 'Phòng ban không tồn tại' });
    }

    const userRole = department.users.find(user => user.userId.equals(userId))?.role;
    if (!userRole) {
      return res.status(403).json({ message: 'Bạn không có quyền truy cập vào phòng ban này' });
    }

    // Tìm tất cả các khách hàng của phòng ban đó
    const query = { departmentId };
    const totalCustomers = await DepartmentCustomer.countDocuments(query); // Tổng số khách hàng

    const customers = await DepartmentCustomer.find(query)
      .populate('customerId')
      .skip(skip) // Bỏ qua các bản ghi của các trang trước
      .limit(limit); // Giới hạn số lượng bản ghi mỗi trang

    // Định dạng dữ liệu khách hàng trả về
    const allCustomers = customers.map(c => ({
      id: c.customerId._id,
      customerCode: c.customerId.customerCode,
      fullName: c.customerId.fullName,
      phone: c.customerId.phone,
      email: c.customerId.email,
      status: c.customerId.status,
      birthday: c.customerId.birthday,
      avatar: c.customerId.avatar,
      note: c.customerId.note
    }));

    // Trả về kết quả với tổng số khách hàng và dữ liệu phân trang
    return res.status(200).json({
      totalCustomers,
      totalPages: Math.ceil(totalCustomers / limit),
      currentPage: page,
      customers: allCustomers
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Thêm khách hàng mới
exports.addCustomer = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const { fullName, phone, email, birthday, status, note } = req.body;

    // Tìm mã code của phòng ban
    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ message: 'Phòng ban không tồn tại' });
    }

    const codeD = department.code; // Mã phòng ban

    // Tìm tất cả các khách hàng có mã bắt đầu bằng codeD
    const customersWithSameCode = await Customer.find({ customerCode: { $regex: `^${codeD}` } });

    // Lấy phần số lớn nhất phía sau codeD
    let maxNumber = 0;
    customersWithSameCode.forEach(customer => {
      const codePart = customer.customerCode.replace(codeD, ''); // Loại bỏ phần codeD
      const numberPart = parseInt(codePart, 10); // Chuyển phần còn lại sang số
      if (numberPart > maxNumber) {
        maxNumber = numberPart; // Cập nhật số lớn nhất
      }
    });

    // Sinh mã khách hàng mới, format số thành 3 chữ số
    const newCustomerCode = `${codeD}${String(maxNumber + 1).padStart(3, '0')}`;
    //console.log('addCustomer', newCustomerCode);
    const createdBy = req.user.id;

    
    // Thêm khách hàng mới
    const newCustomer = new Customer({
      customerCode: newCustomerCode, // Mã khách hàng sinh từ thuật toán
      fullName,
      phone,
      email,
      birthday,
      createdBy, // Người dùng hiện tại
      status,
      createdBy,
      note
    });
    if (req.file) {
      newCustomer.avatar = 'uploads/avatars/' + req.file.filename;
    }
    await newCustomer.save();

    // Tạo quan hệ giữa phòng ban và khách hàng
    const departmentCustomer = new DepartmentCustomer({
      departmentId,
      customerId: newCustomer._id
    });

    await departmentCustomer.save();

    res.status(201).json({ message: 'Khách hàng đã được thêm thành công', customerCode: newCustomerCode });
  } catch (error) {
    //console.log('addCustomer', error);

    res.status(500).json({ message: 'Server error', error });
  }
};


// Sửa thông tin khách hàng
exports.updateCustomer = async (req, res) => {
  console.log("updateCustomer", req.params);
  console.log("updateCustomer", req.body);
  try {
    const { customerId } = req.params;
    const { customerCode, fullName, phone, email, birthday, status, note } = req.body;

    // Chỉ cho phép sửa nếu trạng thái là 'pending'
    const customer = await Customer.findById(customerId);
    if (!customer || customer.status !== 'pending') {
      return res.status(403).json({ message: 'Bạn không thể sửa khách hàng này' });
    }
    if (req.file) {
      customer.avatar = 'uploads/avatars/' + req.file.filename;
    }
    customer.customerCode = customerCode;
    customer.fullName = fullName;
    customer.phone = phone;
    customer.email = email;
    customer.birthday = birthday;
    customer.status = status;
    customer.note = note;

    await customer.save();

    res.status(200).json({ message: 'Thông tin khách hàng đã được cập nhật' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Xóa khách hàng (chỉ cho phép với trạng thái 'pending')
exports.deleteCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;

    const customer = await Customer.findById(customerId);
    if (!customer || customer.status !== 'pending') {
      return res.status(403).json({ message: 'Bạn không thể xóa khách hàng này' });
    }

    await Customer.findByIdAndDelete(customerId);
    await DepartmentCustomer.deleteMany({ customerId });

    res.status(200).json({ message: 'Khách hàng đã được xóa thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
exports.uploadAvatar = upload.single('avatar');  // Sử dụng middleware upload