const nodemailer = require('nodemailer');

async function sendActivationEmail(email, fullName, activationLink) {
    try {
        // Cấu hình transporter để sử dụng Gmail SMTP
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER, // Địa chỉ email của bạn (được lưu trong biến môi trường)
                pass: process.env.EMAIL_PASS  // Mật khẩu ứng dụng cho tài khoản Gmail
            }
        });

        // Cấu hình nội dung email
        const mailOptions = {
            from: `${process.env.URL_WEB} <${process.env.EMAIL_USER}>`, // Địa chỉ gửi email
            to: email, // Địa chỉ email của người đăng ký
            subject: `${process.env.URL_WEB} đã nhận được đăng ký tài khoản của thành viên ${fullName}`, // Tiêu đề email
            text: `Xin chào ${fullName},\n\${process.env.URL_WEB} đã nhận đăng ký tài khoản của thành viên "${fullName}".\nVui lòng nhấn vào đường link sau hoặc copy nó sang trình duyệt để kích hoạt tài khoản của bạn!\n\n${activationLink}`, // Nội dung email dạng text
        };

        // Gửi email
        await transporter.sendMail(mailOptions);
        console.log(`Email đã được gửi đến ${email}`);
    } catch (error) {
        console.error('Lỗi khi gửi email:', error);
        throw new Error('Không thể gửi email xác nhận');
    }
};


// Hàm gửi email đăng ký câu lạc bộ thành công
async function sendRegistrationEmail(managerEmail, clubName, managerName) {
    try {
        // Cấu hình transporter để sử dụng Gmail SMTP
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER, // Địa chỉ email của bạn (được lưu trong biến môi trường)
                pass: process.env.EMAIL_PASS  // Mật khẩu ứng dụng cho tài khoản Gmail
            }
        });

        // Cấu hình nội dung email
        const mailOptions = {
            from: `${process.env.URL_WEB} <${process.env.EMAIL_USER}>`, // Địa chỉ gửi email
            to: managerEmail, // Địa chỉ email của người đăng ký
            subject: `${process.env.URL_WEB} đã nhận được thư đăng ký của ${clubName}`, // Tiêu đề email
            text: `Xin chào ${managerName},\n\nClubhub đã nhận đăng ký câu lạc bộ "${clubName}".\nChúng tôi sẽ xử lý và gửi thông tin tài khoản vào email đã đăng ký. Vui lòng kiểm tra email của bạn.\nHãy kiểm tra thùng thư spam hoặc liên hệ với chúng tôi sau 01 giờ nếu bạn không nhận được thư!`, // Nội dung email dạng text
        };

        // Gửi email
        await transporter.sendMail(mailOptions);
        console.log(`Email đã được gửi đến ${managerEmail}`);
    } catch (error) {
        console.error('Lỗi khi gửi email:', error);
        throw new Error('Không thể gửi email xác nhận');
    }
}

async function sendWelcomeEmail(email, managerName, password, clubName) {
    // Thiết lập thông tin gửi email
    const transporter = nodemailer.createTransport({
        service: 'gmail', // Có thể thay thế bằng dịch vụ khác nếu cần
        auth: {
            user: process.env.EMAIL_USER, // Địa chỉ email của bạn (được lưu trong biến môi trường)
            pass: process.env.EMAIL_PASS  // Mật khẩu ứng dụng cho tài khoản Gmail
        },
    });
    
    // Tiêu đề và nội dung email
    const mailOptions = {
        from: `${process.env.URL_WEB} <${process.env.EMAIL_USER}>`, // Địa chỉ gửi emailservice: 'gmail', // Có thể thay thế bằng dịch vụ khác nếu cần
        to: email,
        subject: 'Chúc mừng câu lạc bộ của bạn đã được phê duyệt!',
        html: `
        <h3>Xin chào ${managerName},</h3>
        <p>Chúc mừng, câu lạc bộ của bạn <strong>${clubName}</strong> đã được phê duyệt thành công.</p>
        <p>Dưới đây là thông tin đăng nhập của bạn:</p>
        <ul>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Mật khẩu:</strong> ${password}</li>
        </ul>
        <p>Bạn có thể đăng nhập vào hệ thống quản lý tại <a href="http://picklehub.xyz">http://picklehub.xyz</a>.</p>
        <p>Chúc bạn thành công với câu lạc bộ của mình!</p>
        <p>Trân trọng,</p>
        <p>Picklehub VN</p>
      `,
    };

    // Gửi email
    try {
        await transporter.sendMail(mailOptions);
        console.log('Email đã được gửi thành công!');
    } catch (error) {
        console.error('Lỗi khi gửi email:', error);
    }
}

async function sendWelcomeStadiumEmail(email, managerName, password, stadiumName) {
    // Thiết lập thông tin gửi email
    const transporter = nodemailer.createTransport({
        service: 'gmail', // Có thể thay thế bằng dịch vụ khác nếu cần
        auth: {
            user: process.env.EMAIL_USER, // Địa chỉ email của bạn (được lưu trong biến môi trường)
            pass: process.env.EMAIL_PASS  // Mật khẩu ứng dụng cho tài khoản Gmail
        },
    });

    // Tiêu đề và nội dung email
    const mailOptions = {
        from: `${process.env.URL_WEB} <${process.env.EMAIL_USER}>`, // Địa chỉ gửi emailservice: 'gmail', // Có thể thay thế bằng dịch vụ khác nếu cần
        to: email,
        subject: 'Chúc mừng Cụm sân của bạn đã đăng ký thành công!',
        html: `
        <h3>Xin chào ${managerName},</h3>
        <p>Chúc mừng, cụm sân <strong>${stadiumName}</strong> đã đăng ký thành công.</p>
        <p>Dưới đây là thông tin đăng nhập của bạn:</p>
        <ul>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Mật khẩu:</strong> ${password}</li>
        </ul>
        <p>Bạn có thể đăng nhập vào hệ thống quản lý tại <a href="http://picklehub.xyz">http://picklehub.xyz</a>.</p>
        <p>Chúc bạn thành công với cụm sân của mình!</p>
        <p>Trân trọng,</p>
        <p>http://picklehub.xy</p>
      `,
    };

    // Gửi email
    try {
        await transporter.sendMail(mailOptions);
        console.log('Email đã được gửi thành công!');
    } catch (error) {
        console.error('Lỗi khi gửi email:', error);
    }
}

async function sendWelcomeEmailExistingUser(email, managerName, clubName) {
    // Thiết lập thông tin gửi email
    const transporter = nodemailer.createTransport({
        service: 'gmail', // Có thể thay thế bằng dịch vụ khác nếu cần
        auth: {
            user: process.env.EMAIL_USER, // Địa chỉ email của bạn (được lưu trong biến môi trường)
            pass: process.env.EMAIL_PASS  // Mật khẩu ứng dụng cho tài khoản Gmail
        },
    });

    // Tiêu đề và nội dung email
    const mailOptions = {
        from: `"Picklehub.xyz" <${process.env.EMAIL_USER}>`, // Địa chỉ gửi emailservice: 'gmail', // Có thể thay thế bằng dịch vụ khác nếu cần
        to: email,
        subject: 'Chúc mừng câu lạc bộ của bạn đã được phê duyệt!',
        html: `
        <h3>Xin chào ${managerName},</h3>
        <p>Chúc mừng, câu lạc bộ của bạn <strong>${clubName}</strong> đã được phê duyệt thành công.</p>
        <p>Bạn đã có tài khoản quản lý trước đó, vui lòng sử dụng tài khoản hiện có để đăng nhập và quản lý câu lạc bộ của mình.</p>
        <p>Bạn có thể truy cập vào hệ thống quản lý tại <a href="http://picklehub.xyz">http://picklehub.xyz</a>.</p>
        <p>Chúc bạn thành công với câu lạc bộ của mình!</p>
        <p>Trân trọng,</p>
        <p>RacketClub VN</p>
      `,
    };

    // Gửi email
    try {
        await transporter.sendMail(mailOptions);
        console.log('Email đã được gửi thành công!');
    } catch (error) {
        console.error('Lỗi khi gửi email:', error);
    }
}


async function sendWelcomeStadiumEmailExistingUser(email, managerName, stadiumName) {
    // Thiết lập thông tin gửi email
    const transporter = nodemailer.createTransport({
        service: 'gmail', // Có thể thay thế bằng dịch vụ khác nếu cần
        auth: {
            user: process.env.EMAIL_USER, // Địa chỉ email của bạn (được lưu trong biến môi trường)
            pass: process.env.EMAIL_PASS  // Mật khẩu ứng dụng cho tài khoản Gmail
        },
    });

    // Tiêu đề và nội dung email
    const mailOptions = {
        from: `"Picklehub.xyz" <${process.env.EMAIL_USER}>`, // Địa chỉ gửi emailservice: 'gmail', // Có thể thay thế bằng dịch vụ khác nếu cần
        to: email,
        subject: 'Chúc mừng câu lạc bộ của bạn đã đăng ký thành công!',
        html: `
        <h3>Xin chào ${managerName},</h3>
        <p>Chúc mừng, cụm sân của bạn <strong>${stadiumName}</strong> đã đăng ký thành công.</p>
        <p>Bạn đã có tài khoản quản lý trước đó, vui lòng sử dụng tài khoản hiện có để đăng nhập và quản lý câu lạc bộ của mình.</p>
        <p>Bạn có thể truy cập vào hệ thống quản lý tại <a href="http://picklehub.xyz">http://picklehub.xyz</a>.</p>
        <p>Chúc bạn thành công với cụm sân của mình!</p>
        <p>Trân trọng,</p>
        <p>http://picklehub.xyz</p>
      `,
    };

    // Gửi email
    try {
        await transporter.sendMail(mailOptions);
        console.log('Email đã được gửi thành công!');
    } catch (error) {
        console.error('Lỗi khi gửi email:', error);
    }
}

async function sendResetPasswordEmail(email, resetLink) {
    const transporter = nodemailer.createTransport({
        service: 'gmail', // Có thể thay thế bằng dịch vụ khác nếu cần
        auth: {
            user: process.env.EMAIL_USER, // Địa chỉ email của bạn (được lưu trong biến môi trường)
            pass: process.env.EMAIL_PASS  // Mật khẩu ứng dụng cho tài khoản Gmail
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Đặt lại mật khẩu của bạn tại ${process.env.URL_WEB}',
        text: `Bạn đã yêu cầu đặt lại mật khẩu. Nhấn vào liên kết dưới đây để đặt lại mật khẩu của bạn:\n\n${resetLink}\n\nNếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.`
    };

    await transporter.sendMail(mailOptions);
};
module.exports = { sendResetPasswordEmail, sendActivationEmail, sendRegistrationEmail, sendWelcomeEmail, sendWelcomeStadiumEmail, sendWelcomeEmailExistingUser, sendWelcomeStadiumEmailExistingUser, sendWelcomeStadiumEmailExistingUser };
