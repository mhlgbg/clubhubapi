const Department = require('../models/Department');
const DepartmentCustomer = require('../models/DepartmentCustomer');
const Customer = require('../models/Customer');
const upload = require('../middleware/upload'); // Import upload middleware
const mongoose = require('mongoose');

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
// Lấy danh sách khách hàng của một phòng ban với phân quyền và phân trang
// Lấy danh sách khách hàng của một phòng ban với phân quyền và phân trang
exports.getDepartmentCustomers = async (req, res) => {
  try {
    console.log("getDepartmentCustomers params", req.params);
    console.log("getDepartmentCustomers query", req.query);

    const { departmentId } = req.params;
    const userId = req.user.id;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    // Tạo pipeline để tìm và populate dữ liệu khách hàng
    const customerPipeline = [
      {
        $match: { departmentId: new mongoose.Types.ObjectId(departmentId) } // Áp dụng bộ lọc departmentId ngay từ đầu
      },
      {
        $lookup: {
          from: 'customers',
          localField: 'customerId',
          foreignField: '_id',
          as: 'customerInfo'
        }
      },
      {
        $unwind: '$customerInfo' // Giải nén customerInfo để tạo cấu trúc phẳng
      },
      {
        $lookup: {
          from: 'companies',
          localField: 'customerInfo.company',
          foreignField: '_id',
          as: 'customerCompany'
        }
      },
      {
        $addFields: {
          company: { $arrayElemAt: ['$customerCompany', 0] } // Đưa company ra ngoài customerInfo
        }
      },
      {
        $project: { // Chỉ trả các trường cần thiết
          'customerInfo._id': 1,
          'customerInfo.customerCode': 1,
          'customerInfo.fullName': 1,
          'customerInfo.gender': 1,
          'customerInfo.phone': 1,
          'customerInfo.email': 1,
          'customerInfo.status': 1,
          'customerInfo.birthday': 1,
          'customerInfo.avatar': 1,
          'customerInfo.note': 1,
          company: { _id: '$company._id', name: '$company.name' }
        }
      }
    ];

    // Thêm điều kiện tìm kiếm nếu có từ khóa, sau khi $lookup
    if (search) {
      customerPipeline.push({
        $match: {
          $or: [
            { 'customerInfo.fullName': { $regex: search, $options: 'i' } },
            { 'customerInfo.customerCode': { $regex: search, $options: 'i' } },
            { 'company.name': { $regex: search, $options: 'i' } }
          ]
        }
      });
    }

    // Đếm tổng số khách hàng phù hợp điều kiện
    const countPipeline = [...customerPipeline, { $count: 'total' }];
    const countResult = await DepartmentCustomer.aggregate(countPipeline);
    const totalCustomers = countResult[0]?.total || 0;

    // Lấy danh sách khách hàng với phân trang
    customerPipeline.push({ $skip: skip }, { $limit: limit });
    const customers = await DepartmentCustomer.aggregate(customerPipeline);

    // Trả về danh sách và số trang
    return res.status(200).json({
      totalCustomers,
      totalPages: Math.ceil(totalCustomers / limit),
      currentPage: page,
      customers: customers.map(c => ({
        ...c.customerInfo,
        company: c.company ? { _id: c.company._id, name: c.company.name } : null
      }))
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error', error });
  }
};


// Thêm khách hàng mới
exports.addCustomer = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const { fullName, gender, phone, email, birthday, status, note, company } = req.body;

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
      gender,
      phone,
      email,
      birthday,
      createdBy, // Người dùng hiện tại
      status,
      createdBy,
      note,
      company
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
    const { customerCode, fullName, gender, phone, email, birthday, status, note, company } = req.body;

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
    customer.gender = gender,
    customer.phone = phone;
    customer.email = email;
    customer.birthday = birthday;
    customer.status = status;
    customer.note = note;
    customer.company = company

    await customer.save();

    res.status(200).json({ message: 'Thông tin khách hàng đã được cập nhật' });
  } catch (error) {
    console.log("updateCustomer error", error);
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