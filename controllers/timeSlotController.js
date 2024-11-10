const StadiumManagement = require('../models/StadiumManagement');
const Playground = require('../models/Playground');
const TimeSlot = require('../models/TimeSlot');


const mongoose = require('mongoose');


// Lấy dữ liệu slot từ ngày đến ngày cho tất cả các sân quản lý bởi người dùng
exports.getSlotManagementData = async (req, res) => {
    try {
        const userId = req.user.id; // Giả định bạn có middleware để xác định người dùng
        const { fromDate, toDate } = req.query;

        // Lấy tất cả các BQL Sân mà người dùng quản lý
        const stadiums = await StadiumManagement.find({ managers: userId });

        if (!stadiums.length) {
            return res.status(404).json({ message: 'Bạn chưa được phân công quản lý sân nào' });
        }

        // Lấy tất cả các sân thuộc BQL Sân
        const stadiumIds = stadiums.map(stadium => stadium._id);
        const playgrounds = await Playground.find({ stadiumManagementId: { $in: stadiumIds } });

        const results = [];

        // Lặp qua từng ngày trong khoảng thời gian
        const from = new Date(fromDate);
        const to = new Date(toDate);
        for (let date = from; date <= to; date.setDate(date.getDate() + 1)) {
            const currentDate = new Date(date);

            // Lặp qua từng sân để lấy thông tin slot
            for (const playground of playgrounds) {
                // Tìm tất cả các slot trong ngày đó
                const slots = await TimeSlot.find({
                    playgroundId: playground._id,
                    date: currentDate,
                });

                const totalSlots = slots.length;
                const busySlots = slots.filter(slot => slot.status === 'bận').length;
                const freeSlots = totalSlots - busySlots;

                results.push({
                    playgroundId: playground._id,
                    stadiumName: stadiums.find(stadium => stadium._id.equals(playground.stadiumManagementId)).stadiumName,
                    playgroundName: playground.name,
                    date: currentDate.toISOString().split('T')[0], // Format date thành YYYY-MM-DD
                    totalSlots,
                    busySlots,
                    freeSlots,
                });
            }
        }

        res.status(200).json(results);
    } catch (error) {
        console.error('Error fetching slot management data:', error);
        res.status(500).json({ message: 'Lỗi server khi lấy dữ liệu slot', error });
    }
};
// Lấy danh sách slot của một sân trong một ngày cụ thể
exports.getSlotsByPlaygroundAndDate = async (req, res) => {
    const { playgroundId, date } = req.params;

    try {
        const slots = await TimeSlot.find({
            playgroundId,
            date: new Date(date),
        });

        res.status(200).json(slots);
    } catch (error) {
        console.error('Error fetching slots:', error);
        res.status(500).json({ message: 'Lỗi server khi lấy danh sách slot', error });
    }
};

// Tạo slot mới
exports.createSlot = async (req, res) => {
    const { date, playgroundId, fromHour, fromMinute, toHour, toMinute, status, rentalPricePerHour, notes } = req.body;

    try {
        const newSlot = new TimeSlot({
            date,
            playgroundId,
            fromHour,
            fromMinute,
            toHour,
            toMinute,
            status,
            rentalPricePerHour,
            notes,
        });

        const savedSlot = await newSlot.save();
        res.status(201).json(savedSlot);
    } catch (error) {
        console.error('Error creating slot:', error);
        res.status(500).json({ message: 'Lỗi server khi tạo slot', error });
    }
};

// Cập nhật slot
exports.updateSlot = async (req, res) => {
    const { slotId } = req.params;
    const updates = req.body;

    try {
        const updatedSlot = await TimeSlot.findByIdAndUpdate(slotId, updates, { new: true });
        res.status(200).json(updatedSlot);
    } catch (error) {
        console.error('Error updating slot:', error);
        res.status(500).json({ message: 'Lỗi server khi cập nhật slot', error });
    }
};

// Xóa slot
exports.deleteSlot = async (req, res) => {
    const { slotId } = req.params;

    try {
        await TimeSlot.findByIdAndDelete(slotId);
        res.status(200).json({ message: 'Slot đã được xóa' });
    } catch (error) {
        console.error('Error deleting slot:', error);
        res.status(500).json({ message: 'Lỗi server khi xóa slot', error });
    }
};
//Xử lý copy slots
exports.copySlots = async (req, res) => {
    try {
        const { playgroundId, fromDate, toDateRange } = req.body;
        const { fromDate: copyFromDate, toDate: copyToDate } = toDateRange;

        // Chuyển đổi từ string sang đối tượng Date
        const from = new Date(copyFromDate);
        const to = new Date(copyToDate);

        // Lấy tất cả các slot từ ngày từDate
        const slotsToCopy = await TimeSlot.find({
            playgroundId: new mongoose.Types.ObjectId(playgroundId), // Sửa lỗi tại đây
            date: new Date(fromDate) // Tìm slot của ngày từ
        });

        if (!slotsToCopy.length) {
            return res.status(404).json({ message: 'Không tìm thấy slot nào để sao chép.' });
        }

        const copiedSlots = [];

        // Duyệt qua các ngày từ fromDate đến toDate để sao chép slot
        for (let date = new Date(from); date <= to; date.setDate(date.getDate() + 1)) {
            const newDate = new Date(date);

            // Lặp qua từng slot để sao chép
            const newSlots = slotsToCopy.map(slot => ({
                playgroundId: slot.playgroundId,
                date: newDate,
                fromHour: slot.fromHour,
                fromMinute: slot.fromMinute,
                toHour: slot.toHour,
                toMinute: slot.toMinute,
                status: slot.status,
                rentalPricePerHour: slot.rentalPricePerHour,
                notes: slot.notes,
            }));

            // Thêm tất cả các slot mới vào danh sách chờ lưu
            copiedSlots.push(...newSlots);
        }

        // Lưu tất cả các slot đã sao chép vào database
        await TimeSlot.insertMany(copiedSlots);

        res.status(201).json({ message: 'Sao chép slot thành công', copiedSlots });
    } catch (error) {
        console.error('Error copying slots:', error);
        res.status(500).json({ message: 'Lỗi server khi sao chép slot', error });
    }
};