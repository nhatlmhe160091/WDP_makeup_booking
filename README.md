# Website Đặt Lịch Make Up

## Tổng Quan
Dự án xây dựng nền tảng **website đặt lịch make up trực tuyến** giúp người dùng dễ dàng tìm và đặt lịch với các chuyên gia trang điểm theo thời gian thực, hỗ trợ các makeup artist quản lý hoạt động kinh doanh và cung cấp công cụ quản trị hệ thống cho admin.
- [Link dự án](https://docs.google.com/document/d/1tWYHUh37ZeA-3UIUgzdJPCwK9MMLy9md/edit?usp=sharing&ouid=100755459912489777262&rtpof=true&sd=true)
- [Timeline](https://docs.google.com/spreadsheets/d/1J2JRc8Pk3kqmxfRRvrHypJtGFfYBwFVw3oVVFcC_jpc/edit?usp=sharing)
> **Tham khảo mẫu UI/UX:** [makeupbooking.com](#)

## Phạm Vi Nghiệp Vụ & Lộ Trình Triển Khai
- **Tổng thời gian:** 2 tuần
  - **Tuần 1:** Hoàn thiện demo chức năng cơ bản
  - **Tuần 2:** Sửa lỗi và cải thiện theo feedback
 
## Chức Năng Theo Vai Trò Người Dùng

### 1. Người Dùng (User)
| Tính Năng | Mô Tả |
|-----------|-------|
| **Đăng ký / Đăng nhập** | Sử dụng **số điện thoại**, xác thực bằng **OTP** |
| **Thông tin cá nhân** | Cập nhật và xem thông tin cá nhân |
| **Xem danh sách makeup artist** | Tìm kiếm theo khu vực, thời gian còn trống |
| **Xem chi tiết makeup artist** | Bao gồm: thông tin chi tiết, portfolio, địa điểm làm việc |
| **Đặt lịch / Hủy lịch** | Hủy lịch trước < 24 giờ | 
| **Xem lịch hẹn** | Hiển thị toàn bộ lịch sử đặt lịch |
| **Đánh giá makeup artist** | Vote từ 1 đến 5 sao sau khi sử dụng dịch vụ |
| **Bình luận đánh giá** | Bình luận / đánh giá về trải nghiệm dịch vụ |
| **Yêu cầu nâng cấp thành Makeup Artist** | Gửi yêu cầu xét duyệt lên Admin |
| **Thanh toán online** | Hỗ trợ tích hợp thanh toán điện tử |

### 2. Makeup Artist
| Tính Năng | Mô Tả |
|-----------|-------|
| **Thanh toán cho nền tảng** | 2 hình thức:<br>1. Gói thuê bao (4 tháng, 6 tháng, 1 năm)<br>2. Trích phí theo lượt đặt (15%) |
| **Tạo hồ sơ makeup artist** | Thông tin gồm: tên, số điện thoại, địa chỉ, portfolio, mô tả, thời gian làm việc, dịch vụ |
| **Quản lý dịch vụ** | Bao gồm: loại dịch vụ (make up cô dâu, dự tiệc, chụp ảnh...), giá, ảnh mẫu |
| **Xem lịch hẹn** | Hiển thị lịch theo ngày/tuần |
| **Xem thống kê** | Bao gồm lượt đặt, doanh thu, đánh giá từ khách hàng |

### 3. Quản Trị Viên (Admin)
| Tính Năng | Mô Tả |
|-----------|-------|
| **Quản lý tài khoản** | User và Makeup Artist |
| **Mở / Khóa / Xóa tài khoản** | Xử lý các trường hợp vi phạm quy định |
| **Quản lý banner quảng cáo** | Thêm/sửa/xoá quảng cáo hiển thị trên hệ thống |
| **Xét duyệt yêu cầu làm Makeup Artist** | Duyệt hoặc từ chối yêu cầu nâng cấp tài khoản từ người dùng |
| **Quản lý danh sách đặt lịch** | Xem toàn bộ lịch hẹn theo ngày/tuần/tháng |
| **Thống kê hệ thống** | Thống kê bao gồm:<br>- Tổng số người dùng, makeup artist<br>- Số lượng dịch vụ make up<br>- Lượt đặt lịch trong ngày/tuần/tháng<br>- Doanh thu (nếu có tích hợp thanh toán)<br>- Các makeup artist được đặt nhiều nhất |

## Công Nghệ Sử Dụng
| Thành phần | Công nghệ |
|------------|-----------|
| **Frontend** | React hoặc Vue.js, HTML/CSS/JS |
| **Backend** | Node.js hoặc Python (Django/Flask) |
| **Cơ sở dữ liệu** | MySQL hoặc MongoDB |
| **Xác thực OTP** | Tích hợp SMS OTP (VD: Twilio, Viettel, FPT) |
| **Thanh toán** | Tích hợp cổng thanh toán (Momo, ZaloPay, VNPay) |
| **Bản đồ** | Google Maps API |

## Lợi Ích
- **Người dùng:** Tìm kiếm và đặt lịch make up nhanh chóng, tiện lợi, đánh giá makeup artist dễ dàng.
- **Makeup Artist:** Quản lý lịch hẹn chuyên nghiệp, có thể tùy chọn hình thức trả phí, nắm bắt doanh thu nhanh chóng.
- **Admin:** Quản lý toàn diện hệ thống, kiểm soát tài khoản, dịch vụ và hiệu suất hoạt động.

## Rủi Ro & Giải Pháp
| Rủi Ro | Kế Hoạch Giảm Thiểu |
|--------|----------------------|
| Tích hợp thanh toán gặp lỗi | Sử dụng các cổng thanh toán phổ biến và ổn định đã có SDK hỗ trợ |
| Lỗi upload ảnh / portfolio | Áp dụng kiểm tra định dạng, giới hạn kích thước, xác thực dữ liệu |
| Makeup artist không đến đúng hẹn | Xây dựng hệ thống đánh giá, cảnh báo và chế tài xử phạt |
| Chất lượng dịch vụ không đảm bảo | Yêu cầu chứng chỉ, xác thực kỹ năng và portfolio trước khi duyệt |
| Tăng trưởng đột biến số người dùng | Thiết kế hệ thống dễ mở rộng, áp dụng cloud hosting và caching hợp lý |
