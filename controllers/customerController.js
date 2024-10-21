const Customer = require('../models/Customer');
const upload = require('../middleware/upload'); // Import upload middleware
const moment = require('moment');

exports.getBirthdayFromADay = async (req, res) => {
    const { page = 1, limit = 12 } = req.query; // Mặc định 10 bản ghi một trang
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // Tháng hiện tại (1-12)
    const currentDay = currentDate.getDate(); // Ngày hiện tại

    try {
        // Truy vấn tìm tất cả khách hàng có sinh nhật từ ngày hiện tại trở về sau
        const customers1 = await Customer.find({
            $or: [
                // Khách hàng sinh từ tháng hiện tại và ngày hiện tại trở đi
                {
                    $and: [
                        { $expr: { $gte: [{ $month: "$birthday" }, currentMonth] } },
                        { $expr: { $gte: [{ $dayOfMonth: "$birthday" }, currentDay] } }
                    ]
                },
                // Khách hàng sinh từ tháng sau trở đi
                {
                    $and: [
                        { $expr: { $gt: [{ $month: "$birthday" }, currentMonth] } }
                    ]
                }
            ]
        });

        // Truy vấn tìm khách hàng có sinh nhật từ tháng 1 đến trước ngày hiện tại
        const customers2 = await Customer.find({
            $or: [
                // Khách hàng sinh từ tháng 1 đến tháng hiện tại, nhưng ngày phải nhỏ hơn ngày hiện tại
                {
                    $and: [
                        { $expr: { $lt: [{ $month: "$birthday" }, currentMonth] } }
                    ]
                },
                {
                    $and: [
                        { $expr: { $eq: [{ $month: "$birthday" }, currentMonth] } },
                        { $expr: { $lt: [{ $dayOfMonth: "$birthday" }, currentDay] } }
                    ]
                }
            ]
        });

        // Kết hợp danh sách khách hàng và thực hiện phân trang
        const combinedCustomers = [...customers1, ...customers2];
        const paginatedCustomers = combinedCustomers.slice((page - 1) * limit, page * limit);

        res.status(200).json({
            success: true,
            totalCustomers: combinedCustomers.length,
            page,
            limit,
            customers: paginatedCustomers
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// Controller to handle birthday report

exports.getBirthdayReport = async (req, res) => {
    try {
        const inputDate = req.query.date ? moment(req.query.date, 'YYYY-MM-DD') : moment(); // Input date, default to today
        console.log('getBirthdayReport: ', inputDate);
        const today = inputDate.clone();
        const sevenDaysLater = today.clone().add(7, 'days');
        const thirtyDaysLater = today.clone().add(30, 'days');

        // Generate list of valid dates (month and day) within the next 7 days
        const validDates7Days = [];
        for (let i = 0; i <= 7; i++) {
            validDates7Days.push({
                day: today.clone().add(i, 'days').date(),
                month: today.clone().add(i, 'days').month() + 1, // MongoDB uses 1-indexed month
            });
        }

        // Generate list of valid dates (month and day) within the next 30 days
        const validDates30Days = [];
        for (let i = 0; i <= 30; i++) {
            validDates30Days.push({
                day: today.clone().add(i, 'days').date(),
                month: today.clone().add(i, 'days').month() + 1, // MongoDB uses 1-indexed month
            });
        }

        // Query to match birthdays within the next 7 days
        const isNext7Days = {
            $or: validDates7Days.map(date => ({
                $expr: {
                    $and: [
                        { $eq: [{ $dayOfMonth: "$birthday" }, date.day] },
                        { $eq: [{ $month: "$birthday" }, date.month] }
                    ]
                }
            }))
        };

        // Query to match birthdays within the next 30 days
        const isNext30Days = {
            $or: validDates30Days.map(date => ({
                $expr: {
                    $and: [
                        { $eq: [{ $dayOfMonth: "$birthday" }, date.day] },
                        { $eq: [{ $month: "$birthday" }, date.month] }
                    ]
                }
            }))
        };

        // Query for today's birthdays
        const matchDayMonth = (date) => ({
            $expr: {
                $and: [
                    { $eq: [{ $dayOfMonth: "$birthday" }, date.date()] },
                    { $eq: [{ $month: "$birthday" }, date.month() + 1] }
                ]
            }
        });

        // Count for today, 7 days and 30 days
        const countToday = await Customer.countDocuments(matchDayMonth(today));
        const countNext7Days = await Customer.countDocuments(isNext7Days);
        const countNext30Days = await Customer.countDocuments(isNext30Days);

        // Total number of customers
        const totalCustomers = await Customer.countDocuments();

        // Get customers with birthdays in the next 7 days, sorted by birthday (from earliest to latest)
        const customersNext7Days = await Customer.find(isNext7Days).sort({ birthday: 1 }); // Sorted in ascending order of birthday

        // Get customers with birthdays in the next 30 days, sorted by birthday (from earliest to latest)
        const customersNext30Days = await Customer.find(isNext30Days).sort({ birthday: 1 }); // Sorted in ascending order of birthday

        // Return the report including total customers and the list of customers for the next 7 and 30 days
        res.status(200).json({
            today: countToday,
            next7Days: countNext7Days,
            next30Days: countNext30Days,
            totalCustomers: totalCustomers,
            customersNext7Days: customersNext7Days, // List of customers in the next 7 days
            customersNext30Days: customersNext30Days  // List of customers in the next 30 days
        });
    } catch (error) {
        res.status(500).json({ message: "Error generating birthday report", error });
    }
};

// API xóa khách hàng
exports.getCount = async (req, res) => {
    try {
        const { type } = req.query;
        const count = await Customer.countDocuments({ customerCode: { $regex: `^${type}` } });
        res.status(200).json({ count });
    } catch (error) {
        res.status(500).json({ message: 'Error counting customers', error });
    }
};


// API tìm kiếm và phân trang khách hàng (giữ nguyên)
exports.getCustomers = async (req, res) => {
    try {
        const { page = 1, limit = 12, search = '', birthdayFrom, birthdayTo } = req.query;

        const searchQuery = {
            $or: [
                { fullName: { $regex: search, $options: 'i' } },
                { customerCode: { $regex: search, $options: 'i' } }
            ]
        };

        if (birthdayFrom || birthdayTo) {
            searchQuery.birthday = {};
            if (birthdayFrom) {
                searchQuery.birthday.$gte = new Date(birthdayFrom);
            }
            if (birthdayTo) {
                searchQuery.birthday.$lte = new Date(birthdayTo);
            }
        }

        const totalCustomers = await Customer.countDocuments(searchQuery);
        const totalPages = Math.ceil(totalCustomers / limit);

        const customers = await Customer.find(searchQuery)
            .limit(parseInt(limit))
            .skip((page - 1) * limit);

        res.status(200).json({
            customers,
            currentPage: parseInt(page),
            totalPages
        });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving customers', error });
    }
};

exports.createOrUpdateCustomer = async (req, res) => {
    console.log("createOrUpdateCustomer: ");
    try {
        const customerId = req.params.id;
        const customerData = req.body;
        const createdBy = req.user.id;

        const existingCustomer = await Customer.findOne({ phone: customerData.phone });

        if (existingCustomer && (!customerId || existingCustomer._id.toString() !== customerId)) {
            return res.status(400).json({ message: 'Phone number already exists' });
        }

        // Nếu có upload ảnh, gán đường dẫn ảnh vào dữ liệu khách hàng
        if (req.file) {
            customerData.avatar = 'uploads/avatars/' + req.file.filename;
        }

        let customer;
        if (customerId) {
            // Cập nhật khách hàng nếu có ID
            customer = await Customer.findByIdAndUpdate(customerId, customerData, { new: true });
        } else {
            // Kiểm tra mã loại khách hàng từ phần tiền tố của `customerCode`
            const customerType = customerData.customerType; // Loại khách hàng được chọn ở frontend

            // Đếm số lượng khách hàng có cùng tiền tố loại khách hàng
            const count = await Customer.countDocuments({ customerCode: new RegExp(`^${customerType}`) });

            // Tạo mã khách hàng mới theo format [customerType + số thứ tự 3 chữ số]
            const newCustomerCode = `${customerType}${String(count + 1).padStart(3, '0')}`;

            // Cập nhật customerCode vào dữ liệu khách hàng
            customerData.customerCode = newCustomerCode;
            customerData.createdBy = createdBy;

            // Tạo khách hàng mới
            customer = new Customer(customerData);
            await customer.save();
        }

        res.status(201).json(customer);
    } catch (error) {
        console.error('Error creating or updating customer:', error);
        res.status(400).json({ message: 'Error creating or updating customer', error });
    }
};


// API xóa khách hàng
exports.deleteCustomer = async (req, res) => {
    try {
        const customerId = req.params.id;
        const customer = await Customer.findByIdAndDelete(customerId);

        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        res.status(200).json({ message: 'Customer deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting customer', error });
    }
};

// Upload middleware
exports.uploadAvatar = upload.single('avatar');  // Sử dụng middleware upload
