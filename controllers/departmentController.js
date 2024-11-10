const Department = require('../models/Department');
const User = require('../models/User');

exports.getDepartmentsOfUser = async (req, res) => {
  try {
    const departments = await Department.find({ 'users.userId': req.params.userId })
      .select('name users.role')  // Chỉ chọn tên phòng ban và vai trò
      .populate('users.userId', 'username');  // Lấy thông tin người dùng theo `userId`

    res.json({ departments });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi tải danh sách phòng ban của người dùng.' });
  }
};

exports.updateDepartmentOfUser = async (req, res) => {
  const { departmentId, role } = req.body; // Lấy departmentId và role từ body
  console.log('updateDepartmentOfUser', req.body, '\n', req.params.userId)
  try {
    // Tìm phòng ban theo departmentId
    let department = await Department.findById(departmentId);

    if (department) {
      // Kiểm tra nếu người dùng đã tồn tại trong danh sách users của phòng ban
      const userIndex = department.users.findIndex(u => u.userId.equals(req.params.userId));

      if (userIndex > -1) {
        // Nếu người dùng đã tồn tại, cập nhật vai trò
        department.users[userIndex].role = role;
      } else {
        // Nếu người dùng chưa tồn tại, thêm mới
        department.users.push({
          userId: req.params.userId,
          role: role
        });
      }

      // Lưu thay đổi vào database
      await department.save();

      res.json({ message: 'Cập nhật phân quyền phòng ban thành công.' });
    } else {
      res.status(404).json({ message: 'Phòng ban không tồn tại.' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi cập nhật phân quyền phòng ban.' });
  }
};


// Xóa phòng ban của người dùng
exports.removeDepartmentFromUser = async (req, res) => {
  try {
    const department = await Department.findById(req.params.departmentId);

    if (department) {
      // Lọc bỏ người dùng khỏi danh sách users của phòng ban
      department.users = department.users.filter(user => !user.userId.equals(req.params.userId));

      // Lưu thay đổi
      await department.save();
      res.json({ message: 'Người dùng đã được xóa khỏi phòng ban.' });
    } else {
      res.status(404).json({ message: 'Phòng ban không tồn tại.' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi xóa người dùng khỏi phòng ban.' });
  }
};



// Lấy danh sách người dùng và vai trò trong phòng ban
exports.getDepartmentUsers = async (req, res) => {
  try {
    const department = await Department.findById(req.params.departmentId).populate('users.userId', 'email');
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    res.status(200).json({ users: department.users });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Thêm người dùng vào phòng ban
exports.addUserToDepartment = async (req, res) => {
  try {
    const { email, role } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const department = await Department.findById(req.params.departmentId);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    // Kiểm tra xem người dùng đã được thêm chưa
    const userExists = department.users.some((u) => u.userId.equals(user._id));
    if (userExists) {
      return res.status(400).json({ message: 'User already in department' });
    }

    department.users.push({ userId: user._id, role });
    await department.save();
    res.status(200).json({ message: 'User added to department' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Xóa người dùng khỏi phòng ban
exports.removeUserFromDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.departmentId);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    department.users = department.users.filter(
      (u) => !u.userId.equals(req.params.userId)
    );
    await department.save();
    res.status(200).json({ message: 'User removed from department' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.getDepartments = async (req, res) => {
  try {
    const { page = 1, limit = 12, search = '' } = req.query;

    const searchQuery = {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ]
    };



    const totalDepartments = await Department.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalDepartments / limit);

    const departments = await Department.find(searchQuery)
      .limit(parseInt(limit))
      .skip((page - 1) * limit);

    res.status(200).json({
      departments,
      currentPage: parseInt(page),
      totalPages
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving customers', error });
  }
};


// Get all departments
exports.getAllDepartments = async (req, res) => {

  try {
    const departments = await Department.find();
    //console.log('getAllDepartments', departments);
    res.status(200).json(departments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching departments', error });
  }
};

// Get a department by ID
exports.getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    res.status(200).json(department);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching department', error });
  }
};

// Create a new department
exports.createDepartment = async (req, res) => {
  const { code, name, description } = req.body;

  try {
    const newDepartment = new Department({
      code,
      name,
      description
    });
    await newDepartment.save();
    res.status(201).json(newDepartment);
  } catch (error) {
    res.status(500).json({ message: 'Error creating department', error });
  }
};

// Update an existing department
exports.updateDepartment = async (req, res) => {
  const { code, name, description } = req.body;

  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    department.code = code || department.code;
    department.name = name || department.name;
    department.description = description || department.description;

    await department.save();
    res.status(200).json(department);
  } catch (error) {
    res.status(500).json({ message: 'Error updating department', error });
  }
};

// Delete a department
exports.deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    await department.remove();
    res.status(200).json({ message: 'Department deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting department', error });
  }
};
