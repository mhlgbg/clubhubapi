const express = require('express');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Cấu hình multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');  // Đặt file vào thư mục 'uploads'
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);  // Đặt tên file với timestamp
    },
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;  // Chỉ cho phép file jpg, jpeg, png
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb('Error: Only images are allowed!');
        }
    },
});

// Định nghĩa route upload file
/*router.post('/upload', upload.single('avatar'), (req, res) => {
    console.log("upload: ", req.file);
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.status(200).json({ url: fileUrl });
});*/
router.post('/upload', (req, res, next) => {
    console.log('upload');
    // Sử dụng upload.single để kiểm tra xem trường nào được gửi: 'avatar' hay 'file'
    const fieldName = req.query.field || 'file'; // Lấy field từ query hoặc mặc định là 'file'
    const uploadHandler = upload.single(fieldName);
    
    // Gọi middleware upload
    uploadHandler(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            console.log('upload', err);
            return res.status(400).json({ message: 'Multer error', error: err.message });
        } else if (err) {
            console.log('upload', err);
            return res.status(500).json({ message: 'File upload error', error: err.message });
        }

        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }

        const relativePath = `uploads/${req.file.filename}`;  // Trả về đường dẫn tương đối của file
        res.status(200).json({ url: relativePath });
    });
});


module.exports = router;
