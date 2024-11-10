const Customer = require('../models/Customer');
const upload = require('../middleware/upload'); // Import upload middleware
const User = require('../models/User');

const moment = require('moment');

exports.getBirthdayFromADay = async (req, res) => {
    const { page = 1, limit = 12 } = req.query; // Mặc định 12 bản ghi một trang
	console.log('getBirthdayFromADay ', req.query.date);
    const inputDate = req.query.date ? moment(req.query.date, 'YYYY-MM-DD') : moment(); // Ngày hiện tại hoặc ngày chỉ định
    const currentMonth = inputDate.month() + 1; // Tháng hiện tại (1-12)
    const currentDay = inputDate.date(); // Ngày hiện tại

    try {
        // Truy vấn tìm tất cả khách hàng có sinh nhật từ ngày chỉ định trở về sau trong năm
        const customersThisYear = await Customer.find({
            $or: [
                {
                    $and: [
                        { $expr: { $eq: [{ $month: "$birthday" }, currentMonth] } },
                        { $expr: { $gte: [{ $dayOfMonth: "$birthday" }, currentDay] } }
                    ]
                },
                {
                    $expr: { $gt: [{ $month: "$birthday" }, currentMonth] }
                }
            ]
        });

        // Truy vấn tìm tất cả khách hàng có sinh nhật từ đầu năm đến ngày hiện tại
        const customersNextYear = await Customer.find({
            $or: [
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

        // Hàm tính toán "ngày trong năm" của ngày sinh, ưu tiên ngày hiện tại
        const calculateSortDate = (birthday) => {
            const birthDate = moment(birthday);
            const birthDayOfYear = birthDate.dayOfYear();

            // Ưu tiên ngày hiện tại lên đầu danh sách
            if (birthDate.month() + 1 === currentMonth && birthDate.date() === currentDay) {
                return -1; // Trả về giá trị nhỏ nhất để đứng đầu
            }

            // Kiểm tra nếu ngày sinh là 29/2 và năm hiện tại không nhuận, chuyển về 28/2
            if (birthDate.month() === 1 && birthDate.date() === 29 && !inputDate.isLeapYear()) {
                birthDate.date(28);
            }

            return birthDayOfYear >= inputDate.dayOfYear() ? birthDayOfYear : birthDayOfYear + 365;
        };

        // Kết hợp danh sách khách hàng và sắp xếp theo "ngày trong năm"
        const combinedCustomers = [...customersThisYear, ...customersNextYear]
            .map(customer => ({
                ...customer._doc,
                sortDate: calculateSortDate(customer.birthday)
            }))
            .sort((a, b) => a.sortDate - b.sortDate);

        // Thực hiện phân trang
        const paginatedCustomers = combinedCustomers.slice((page - 1) * limit, page * limit);

        res.status(200).json({
            success: true,
            totalCustomers: combinedCustomers.length,
            page,
            limit,
            customers: paginatedCustomers
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error retrieving customers", error });
    }
};




// Controller to handle birthday report

exports.getBirthdayReport = async (req, res) => {
    try {
		console.log('getBirthdayReport ', req.query.date);
		const inputDate = req.query.date ? moment(req.query.date, 'YYYY-MM-DD') : moment(); // Ngày hiện tại hoặc ngày chỉ định
		//const inputDate = moment(); // Ngày hiện tại hoặc ngày chỉ định
        console.log('getBirthdayReport: ', inputDate);
        const today = inputDate.clone();

        const todayDayOfYear = inputDate.dayOfYear();
        console.log('getBirthdayReport: ', todayDayOfYear);

        // Generate list of valid dates (month and day) within the next 30 days
        const validDates30Days = [];
        for (let i = 0; i <= 30; i++) {
            validDates30Days.push({
                day: today.clone().add(i, 'days').date(),
                month: today.clone().add(i, 'days').month() + 1, // MongoDB uses 1-indexed month
            });
        }

        // Generate list of valid dates (month and day) within the next 7 days, including today
        const validDates7Days = [];
        for (let i = 0; i <= 7; i++) {
            validDates7Days.push({
                day: today.clone().add(i, 'days').date(),
                month: today.clone().add(i, 'days').month() + 1, // MongoDB uses 1-indexed month
            });
        }
		
		
        // Query để tìm các khách hàng có sinh nhật trong 7 ngày tới, bao gồm ngày hiện tại
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

        // Query để tìm các khách hàng có sinh nhật trong 30 ngày tới, bao gồm ngày hiện tại
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

        // Lấy danh sách khách hàng có sinh nhật trong 7 và 30 ngày tới
        const customersNext7Days = await Customer.find(isNext7Days);
        const customersNext30Days = await Customer.find(isNext30Days);

        // Hàm để tính "ngày trong năm" của ngày sinh
        const calculateSortDate = (birthday) => {
			const birthDate = moment(birthday);
			const birthDayOfYear = birthDate.dayOfYear();

			// Kiểm tra và ưu tiên ngày hôm nay
			if (birthDayOfYear === todayDayOfYear) {
				return -Infinity; // Trả về giá trị cực nhỏ để ngày hôm nay luôn đứng đầu
			}

			// Kiểm tra nếu ngày sinh là 29/2 và năm hiện tại không nhuận, chuyển về 28/2
			if (birthDate.month() === 1 && birthDate.date() === 29 && !today.isLeapYear()) {
				birthDate.date(28); // Chuyển 29/2 thành 28/2 nếu năm không nhuận
			}

			// Nếu ngày sinh còn lại trong năm, giữ nguyên; nếu đã qua, cộng 365 để đẩy sang năm sau
			return birthDayOfYear >= todayDayOfYear ? birthDayOfYear : birthDayOfYear + 365;
		};

        // Áp dụng "ngày trong năm" để sắp xếp khách hàng theo yêu cầu
        const sortedCustomersNext7Days = customersNext7Days.map(customer => ({
            ...customer._doc,
            sortDate: calculateSortDate(customer.birthday)
        })).sort((a, b) => a.sortDate - b.sortDate);

        /*const sortedCustomersNext30Days = customersNext30Days.map(customer => ({
            ...customer._doc,
            sortDate: calculateSortDate(customer.birthday)
        })).sort((a, b) => a.sortDate - b.sortDate);
		*/
        // Query for today's birthdays
        const matchDayMonth = (date) => ({
            $expr: {
                $and: [
                    { $eq: [{ $dayOfMonth: "$birthday" }, date.date()] },
                    { $eq: [{ $month: "$birthday" }, date.month() + 1] }
                ]
            }
        });

        const countToday = await Customer.countDocuments(matchDayMonth(today));
        const countNext7Days = await Customer.countDocuments(isNext7Days);
        const countNext30Days = await Customer.countDocuments(isNext30Days);

        // Total number of customers
        const totalCustomers = await Customer.countDocuments();

        res.status(200).json({
            today: countToday,
            next7Days: countNext7Days,
            next30Days: countNext30Days,
            totalCustomers: totalCustomers,
            customersNext7Days: sortedCustomersNext7Days,
            //customersNext30Days: sortedCustomersNext30Days
        });
    } catch (error) {
        console.log('getBirthdayReport: ', error);

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

        // Thiết lập điều kiện tìm kiếm
        const searchQuery = {
            $or: [
                { fullName: { $regex: search, $options: 'i' } },
                { customerCode: { $regex: search, $options: 'i' } }
            ]
        };

        // Thiết lập điều kiện cho ngày sinh nếu có
        if (birthdayFrom || birthdayTo) {
            searchQuery.birthday = {};
            if (birthdayFrom) {
                searchQuery.birthday.$gte = new Date(birthdayFrom);
            }
            if (birthdayTo) {
                searchQuery.birthday.$lte = new Date(birthdayTo);
            }
        }

        // Tính toán tổng số khách hàng và số trang
        const totalCustomers = await Customer.countDocuments(searchQuery);
        const totalPages = Math.ceil(totalCustomers / limit);

        // Truy vấn khách hàng với phân trang và populate tên công ty
        const customers = await Customer.find(searchQuery)
            .populate({
                path: 'company',
                select: 'name'
            })
            .limit(parseInt(limit))
            .skip((page - 1) * limit);

        // Định dạng kết quả khách hàng với tên công ty hoặc 'N/A' nếu không có công ty
        const formattedCustomers = customers.map(customer => ({
            _id: customer._id,
            customerCode: customer.customerCode,
            fullName: customer.fullName,
            gender: customer.gender,
            phone: customer.phone,
            email: customer.email,
            status: customer.status,
            birthday: customer.birthday,
            avatar: customer.avatar,
            note: customer.note,
            company: customer.company?._id || '',  // Gán ID của công ty
            companyName: customer.company?.name || 'N/A' // Kiểm tra null với optional chaining
        }));

        // Trả về kết quả
        res.status(200).json({
            customers: formattedCustomers,
            currentPage: parseInt(page),
            totalPages
        });
    } catch (error) {
        console.error('Error retrieving customers:', error);
        res.status(500).json({ message: 'Error retrieving customers', error });
    }
};


exports.createOrUpdateCustomer = async (req, res) => {

    console.log("createOrUpdateCustomer: ", req.params.id);
    try {
        const customerId = req.params.id;
        const customerData = req.body;
        const createdBy = req.user.id;

        const existingCustomer = await Customer.findOne({ phone: customerData.phone });

        if (existingCustomer && (!customerId || existingCustomer._id.toString() !== customerId)) {
            return res.status(400).json({ message: 'Phone number already exists' });
        }

        if (req.file) {
            customerData.avatar = 'uploads/avatars/' + req.file.filename;
        }

        let customer;
        if (customerId) {
            customer = await Customer.findByIdAndUpdate(customerId, customerData, { new: true });
        } else {
            const customerType = customerData.customerType;
            const count = await Customer.countDocuments({ customerCode: new RegExp(`^${customerType}`) });
            const newCustomerCode = `${customerType}${String(count + 1).padStart(3, '0')}`;
            customerData.customerCode = newCustomerCode;
            customerData.createdBy = createdBy;
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


exports.getCustomerStatistics = async (req, res) => {
    try {
        const stats = await Customer.aggregate([
            {
                $group: {
                    _id: "$createdBy",
                    customer_count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "user_info"
                }
            },
            {
                $unwind: "$user_info"
            },
            {
                $project: {
                    _id: 0,
                    user_id: "$_id",
                    fullName: "$user_info.fullName",
                    customer_count: 1
                }
            }
        ]);

        const totalCustomers = await Customer.countDocuments();
        const uniqueUsers = stats.length;

        res.status(200).json({
            stats,
            totalCustomers,
            uniqueUsers
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching customer statistics', error });
    }
};

// Upload middleware
exports.uploadAvatar = upload.single('avatar');  // Sử dụng middleware upload

