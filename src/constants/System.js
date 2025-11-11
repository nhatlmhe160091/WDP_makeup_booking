import { EMAIL_NAME, MAIN_URL_APP } from "./MainContent";

export const ROLE_MANAGER = {
  ADMIN: "admin",
  USER: "user",
  MUA: "makeup_artist"
};

export const ROLE_MANAGER_TEXT = {
  [ROLE_MANAGER.ADMIN]: "Quản trị viên",
  [ROLE_MANAGER.USER]: "Người dùng",
  [ROLE_MANAGER.MUA]: "Chủ dịch vụ makeup"
};

export const htmlTemplateEmail = ({ name, email, phone = "Không có", address, confirm_link }) => {
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <title>Xác thực tài khoản - ${EMAIL_NAME}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f6f9fc;
          padding: 20px;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: auto;
          background: #ffffff;
          border-radius: 8px;
          padding: 30px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
        }
        .button {
          display: inline-block;
          padding: 12px 20px;
          margin-top: 20px;
          background-color: #007bff;
          color: #ffffff !important;
          text-decoration: none;
          border-radius: 5px;
          cursor: pointer;
          font-weight: bold;
        }
        .footer {
          margin-top: 30px;
          font-size: 12px;
          color: #888;
          text-align: center;
        }
        .plain-link {
          word-break: break-all;
          color: #007bff;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Chào ${name},</h2>
        <p>Cảm ơn bạn đã đăng ký tài khoản tại hệ thống của <strong>${EMAIL_NAME}</strong>.</p>
        <p>Thông tin đăng ký của bạn:</p>
        <ul>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Điện thoại:</strong> ${phone}</li>
          <li><strong>Địa chỉ:</strong> ${address}</li>
        </ul>

        <p>Vui lòng nhấn vào nút bên dưới để xác nhận tài khoản của bạn:</p>

        <a href="${confirm_link}" class="button">Xác nhận tài khoản</a>

        <p>Nếu bạn không nhấn được nút trên, vui lòng sao chép và dán liên kết sau vào trình duyệt của bạn:</p>
        <a class="plain-link" href="${confirm_link}">${confirm_link}</a>

        <p>Nếu bạn không tạo tài khoản này, vui lòng bỏ qua email này.</p>

        <div class="footer">
          &copy; 2025 ${EMAIL_NAME}. Mọi quyền được bảo lưu.
        </div>
      </div>
    </body>
  </html>
  `;
};

export const htmlTemplateChangePassword = ({ name, email, password }) => {
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <title>Đặt lại mật khẩu - ${EMAIL_NAME}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f6f9fc;
          padding: 20px;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: auto;
          background: #ffffff;
          border-radius: 8px;
          padding: 30px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
        }
        .footer {
          margin-top: 30px;
          font-size: 12px;
          color: #888;
          text-align: center;
        }
        .code-box {
          background-color: #f0f0f0;
          padding: 12px;
          border-radius: 5px;
          font-size: 16px;
          font-weight: bold;
          word-break: break-all;
          display: inline-block;
          margin-top: 10px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Chào ${name},</h2>
        <p>Bạn hoặc ai đó đã yêu cầu đặt lại mật khẩu cho tài khoản trên <strong>${EMAIL_NAME}</strong>.</p>

        <p>Dưới đây là mật khẩu tạm thời của bạn:</p>

        <div class="code-box">${password}</div>

        <p>Thông tin tài khoản:</p>
        <ul>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Mật khẩu tạm thời:</strong> ${password}</li>
        </ul>

        <p>Vui lòng đăng nhập và đổi mật khẩu ngay sau khi đăng nhập để bảo mật tài khoản của bạn.</p>

        <P>Nếu có bất kỳ vấn đề gì, vui lòng liên hệ với chúng tôi qua email hoặc số điện thoại hỗ trợ.</P>

        <div class="footer">
          &copy; 2025 ${EMAIL_NAME}. Mọi quyền được bảo lưu.
        </div>
      </div>
    </body>
  </html>
  `;
};

export const htmlUpdateAccount = ({ name, email, phone, address }) => {
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <title>Nâng cấp tài khoản thành Chuyên Viên - ${EMAIL_NAME}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f6f9fc;
          padding: 20px;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: auto;
          background: #ffffff;
          border-radius: 8px;
          padding: 30px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
        }
        .footer {
          margin-top: 30px;
          font-size: 12px;
          color: #888;
          text-align: center;
        }
        .highlight-box {
          background-color: #fce4ec;
          padding: 15px;
          border-radius: 5px;
          border-left: 4px solid #e91e63;
          margin: 20px 0;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #e91e63;
          color: white !important;
          text-decoration: none;
          border-radius: 4px;
          font-weight: bold;
          margin-top: 10px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Xin chúc mừng ${name}!</h2>
        
        <p>Tài khoản của bạn tại <strong>${EMAIL_NAME}</strong> đã được nâng cấp thành công lên <strong>Chuyên Viên</strong>.</p>
        
        <div class="highlight-box">
          <p><strong>Thông tin tài khoản:</strong></p>
          <ul>
            <li><strong>Họ tên:</strong> ${name}</li>
            <li><strong>Email:</strong> ${email}</li>
            <li><strong>Số điện thoại:</strong> ${phone}</li>
            <li><strong>Địa chỉ:</strong> ${address}</li>
            <li><strong>Vai trò:</strong> Chuyên Viên</li>
          </ul>
        </div>

        <p>Giờ đây bạn có thể:</p>
        <ul>
          <li>Tạo và quản lý hồ sơ chuyên viên của mình</li>
          <li>Đăng tải các dịch vụ makeup và bảng giá</li>
          <li>Tiếp nhận đặt lịch từ khách hàng</li>
          <li>Quản lý lịch làm việc và portfolio</li>
          <li>Theo dõi doanh thu và lịch sử hoạt động</li>
        </ul>

        <p>Chúng tôi rất vui mừng được hợp tác cùng bạn trong hành trình phát triển nghề chuyên viên. Nếu có bất kỳ câu hỏi nào hoặc cần hỗ trợ, vui lòng liên hệ với chúng tôi.</p>

        <a href="${MAIN_URL_APP}/makeup-artists" class="button">Truy cập trang quản lý</a>

        <p>Trân trọng,<br/>Đội ngũ ${EMAIL_NAME}</p>

        <div class="footer">
          &copy; 2025 ${EMAIL_NAME}. Mọi quyền được bảo lưu.
        </div>
      </div>
    </body>
  </html>
  `;
};
