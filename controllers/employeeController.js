const Employee = require('../models/Employee');
const path = require('path');


exports.uploadAvatar = (req, res) => {
    console.log("employee controller uploadAvatar");
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const avatarUrl = path.join('/uploads/avatar_employees', req.file.filename);

    res.status(200).json({
        success: true,
        url: avatarUrl
    });
};

// Lấy danh sách nhân viên có hỗ trợ tìm kiếm và phân trang
exports.getEmployees = async (req, res) => {
    const { page = 1, limit = 10, search = '' } = req.query;
    const query = search
        ? {
              $or: [
                  { 'personalInfo.fullName': new RegExp(search, 'i') },
                  { 'personalInfo.email': new RegExp(search, 'i') },
                  { 'jobInfo.position': new RegExp(search, 'i') },
                  { 'jobInfo.employeeCode': new RegExp(search, 'i') },
              ],
          }
        : {};

    try {
        const employees = await Employee.find(query)
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ 'personalInfo.fullName': 1 });

        const totalEmployees = await Employee.countDocuments(query);

        res.status(200).json({
            success: true,
            data: employees,
            total: totalEmployees,
            page: parseInt(page),
            pages: Math.ceil(totalEmployees / limit),
        });
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ success: false, message: 'Error fetching employees' });
    }
};

// Lấy thông tin chi tiết của một nhân viên
exports.getEmployeeById = async (req, res) => {
    console.log('getEmployeeById: ', req.params.id);
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }
        console.log('getEmployeeById: ', employee);

        res.status(200).json({ success: true, data: employee });
    } catch (error) {
        console.error('Error fetching employee:', error);
        res.status(500).json({ success: false, message: 'Error fetching employee' });
    }
};

// Tạo một nhân viên mới
exports.createEmployee = async (req, res) => {
    console.log('createEmployee:', req.body);

    try {
        const employee = new Employee({
            ...req.body,
            createdBy: req.user.id  // Gán createdBy từ thông tin người dùng đã xác thực
        });
        await employee.save();
        res.status(201).json({ success: true, data: employee });
    } catch (error) {
        console.error('Error creating employee:', error);
        res.status(500).json({ success: false, message: 'Error creating employee' });
    }
};

// Cập nhật thông tin nhân viên
exports.updateEmployee = async (req, res) => {
    try {
        const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }
        res.status(200).json({ success: true, data: employee });
    } catch (error) {
        console.error('Error updating employee:', error);
        res.status(500).json({ success: false, message: 'Error updating employee' });
    }
};

// Xóa nhân viên
exports.deleteEmployee = async (req, res) => {
    try {
        const employee = await Employee.findByIdAndDelete(req.params.id);
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }
        res.status(200).json({ success: true, message: 'Employee deleted' });
    } catch (error) {
        console.error('Error deleting employee:', error);
        res.status(500).json({ success: false, message: 'Error deleting employee' });
    }
};
exports.updateJobInfo = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedEmployee = await Employee.findByIdAndUpdate(
            id,
            { jobInfo: req.body },
            { new: true }
        );
        if (!updatedEmployee) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }
        res.status(200).json({ success: true, data: updatedEmployee });
    } catch (error) {
        console.error('Error updating job info:', error);
        res.status(500).json({ success: false, message: 'Error updating job info' });
    }
};

exports.updatePersonalInfo = async (req, res) => {
    const { id } = req.params;
    const personalData = req.body;

    try {
        const employee = await Employee.findById(id);
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }

        // Cập nhật các trường trong personalInfo
        employee.personalInfo = { ...employee.personalInfo, ...personalData };
        await employee.save();

        res.status(200).json({ success: true, message: 'Personal info updated successfully', data: employee });
    } catch (error) {
        console.error('Error updating personal info:', error);
        res.status(500).json({ success: false, message: 'Error updating personal info' });
    }
};
exports.updatePayrollInfo = async (req, res) => {
    const { id } = req.params;
    try {
        const employee = await Employee.findByIdAndUpdate(
            id,
            { payrollInfo: req.body },
            { new: true }
        );
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }
        res.status(200).json({ success: true, data: employee });
    } catch (error) {
        console.error('Error updating payroll information:', error);
        res.status(500).json({ success: false, message: 'Error updating payroll information' });
    }
};
exports.updateEducationAndCertifications = async (req, res) => {
    const { id } = req.params;
    try {
        const employee = await Employee.findByIdAndUpdate(
            id,
            { educationAndCertification: req.body },
            { new: true }
        );
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }
        res.status(200).json({ success: true, data: employee });
    } catch (error) {
        console.error('Error updating education and certifications:', error);
        res.status(500).json({ success: false, message: 'Error updating education and certifications' });
    }
};

// Cập nhật kinh nghiệm làm việc của nhân viên
exports.addWorkExperience = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        employee.workExperience.push(req.body);
        await employee.save();
        const newExperience = employee.workExperience[employee.workExperience.length - 1];
        res.status(201).json({ success: true, data: newExperience });
    } catch (error) {
        console.error('Error adding work experience:', error);
        res.status(500).json({ success: false, message: 'Error adding work experience' });
    }
};

exports.removeWorkExperience = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        employee.workExperience.id(req.params.experienceId).remove();
        await employee.save();
        res.status(200).json({ success: true, message: 'Work experience removed' });
    } catch (error) {
        console.error('Error removing work experience:', error);
        res.status(500).json({ success: false, message: 'Error removing work experience' });
    }
};
