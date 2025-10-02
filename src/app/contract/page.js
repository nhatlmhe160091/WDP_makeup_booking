"use client";

const ContractPage = () => {
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-9 col-md-11">
          <div className="card shadow-sm p-4">
            <h1 className="mb-2 text-center" style={{fontWeight:700, color:'#ff5c95'}}>HỢP ĐỒNG/THỎA THUẬN ĐIỆN TỬ ĐĂNG KÝ TÀI KHOẢN MUAHUB</h1>
            <div className="text-center mb-3" style={{fontSize:'1.1rem'}}>
              <span className="badge bg-light text-dark border me-2">Phiên bản: v1.0</span>
              <span className="badge bg-light text-dark border me-2">Ngày hiệu lực: Bắt đầu từ ngày đăng ký tài khoản</span>
            </div>
            <div className="mb-3" style={{fontSize:'1.05rem'}}>
              <b>Bên A (Nền tảng):</b> MuaHub (Đơn vị vận hành nền tảng kết nối dịch vụ makeup)<br/>
              <b>Bên B (Người dùng):</b> Cá nhân đăng ký tài khoản trên MuaHub
            </div>
            <ol style={{lineHeight:1.7, fontSize:'1.05rem', paddingLeft: '1.2em'}}>
              <li className="mb-2">
                <b>Định nghĩa</b>
                <ul>
                  <li><b>Nền tảng/MuaHub:</b> website/ứng dụng do Bên A vận hành.</li>
                  <li><b>Người dùng/Khách hàng:</b> Bên B sử dụng MuaHub để tìm kiếm và đặt lịch dịch vụ.</li>
                  <li><b>Chuyên viên makeup/Makeup Artist/MUA:</b> đối tác cung cấp dịch vụ trên MuaHub.</li>
                  <li><b>Đơn đặt dịch vụ/Đơn:</b> yêu cầu đặt lịch dịch vụ được tạo trên nền tảng.</li>
                  <li><b>Cọc/Đặt cọc:</b> khoản tiền khách thanh toán trước để giữ lịch.</li>
                </ul>
              </li>
              <li className="mb-2">
                <b>Chấp nhận thỏa thuận</b>
                <ul>
                  <li>Khi tích “Tôi đồng ý” và nhấn “Đăng ký”, Bên B xác nhận đã đọc, hiểu và đồng ý toàn bộ thỏa thuận này cùng các chính sách liên quan (Bảo mật, Cookie, Nội dung cộng đồng, Chính sách hủy/đổi lịch & hoàn tiền).</li>
                  <li>Bên A có quyền cập nhật thỏa thuận; sẽ thông báo trước khi áp dụng. Việc tiếp tục sử dụng đồng nghĩa chấp thuận bản cập nhật.</li>
                </ul>
              </li>
              <li className="mb-2">
                <b>Điều kiện đăng ký & xác thực (KYC)</b>
                <ul>
                  <li>Bên B cam kết: đủ 18 tuổi; cung cấp thông tin trung thực; chịu trách nhiệm bảo mật tài khoản.</li>
                  <li>Bên A có thể yêu cầu KYC/định danh: CCCD/CMND (mặt trước/sau), ảnh chân dung (selfie), xác thực số điện thoại (OTP), địa chỉ liên hệ. Không hoàn tất/không đạt KYC có thể bị giới hạn tính năng hoặc khóa tạm thời.</li>
                </ul>
              </li>
              <li className="mb-2">
                <b>Sử dụng dịch vụ & hành vi bị cấm</b>
                <ul>
                  <li>Mục đích: tìm kiếm, đặt lịch dịch vụ makeup, đánh giá/bình luận sau hoàn thành.</li>
                  <li><span className="text-danger">Cấm:</span> giả mạo danh tính/giấy tờ; gian lận thanh toán; spam; phát tán mã độc; thu thập dữ liệu trái phép; đăng nội dung vi phạm pháp luật/thuần phong mỹ tục; xâm phạm quyền riêng tư; sử dụng hình ảnh không có quyền.</li>
                </ul>
              </li>
              <li className="mb-2">
                <b>Nội dung do người dùng tạo (UGC)</b>
                <ul>
                  <li>Bên B chịu trách nhiệm pháp lý đối với bình luận/ảnh/đánh giá đã đăng.</li>
                  <li>Chỉ được bình luận khi đơn đã hoàn thành; mỗi đơn 01 bình luận (chữ + ảnh theo giới hạn).</li>
                  <li>Bên A có quyền kiểm duyệt, ẩn/xóa nội dung vi phạm; được cấp quyền không độc quyền, miễn phí bản quyền để hiển thị nội dung trên nền tảng theo mục đích vận hành.</li>
                </ul>
              </li>
              <li className="mb-2">
                <b>Đặt lịch, đặt cọc và xác nhận</b>
                <ul>
                  <li>Một số dịch vụ yêu cầu đặt cọc. Chuỗi xác nhận: Khách đặt lịch → Thanh toán cọc qua cổng thanh toán → Admin xác nhận đã nhận cọc → MUA xác nhận lịch → Thực hiện dịch vụ.</li>
                  <li>Nội dung chuyển khoản nên chứa mã đơn/định danh theo hướng dẫn trên nền tảng.</li>
                </ul>
              </li>
              <li className="mb-2">
                <b>Tự động hủy do chưa chuyển cọc (ràng buộc 1 giờ)</b>
                <ul>
                  <li>Nếu sau 1 giờ kể từ khi tạo đơn chưa nhận được tiền cọc hợp lệ: Đơn tự chuyển “Xác nhận dịch vụ thất bại”.</li>
                  <li>Lý do hiển thị: “Chưa chuyển cọc trong thời hạn quy định”.</li>
                  <li>Hệ thống gửi email thông báo cho Khách; không gửi cho MUA.</li>
                </ul>
              </li>
              <li className="mb-2">
                <b>Chính sách hủy/đổi lịch & hoàn tiền (đơn đã cọc)</b>
                <ul>
                  <li>Khách hủy:<br/>
                    <ul>
                      <li>&ge; 24 giờ trước giờ hẹn: hoàn 100% cọc.</li>
                      <li>&ge; 16 giờ và &lt; 24 giờ: hoàn 50% cọc.</li>
                      <li>&lt; 16 giờ hoặc không xuất hiện: không hoàn cọc.</li>
                    </ul>
                  </li>
                  <li>MUA hủy/không xuất hiện: hoàn 100% cọc cho Khách; Bên A có thể áp dụng biện pháp kỷ luật theo quy định.</li>
                  <li>Hoàn tiền: thực hiện về đúng phương thức thanh toán ban đầu; dự kiến 3–10 ngày làm việc (tùy cổng/Ngân hàng). Phí cổng/chi phí phát sinh có thể không hoàn theo quy định đối tác thanh toán.</li>
                  <li>Bất khả kháng (thiên tai, dịch bệnh, tai nạn, sự cố hệ thống… có bằng chứng hợp lệ): Bên A hỗ trợ các bên thỏa thuận đổi lịch/hoàn tiền phù hợp.</li>
                </ul>
              </li>
              <li className="mb-2">
                <b>Thanh toán & đối soát</b>
                <ul>
                  <li>Giao dịch xử lý qua đối tác cổng thanh toán; webhook được xác thực và ghi log; áp dụng cơ chế idempotent để tránh trùng lặp.</li>
                  <li>Bên A có thể tạm giữ/đóng băng số dư khi phát sinh tranh chấp/khiếu nại.</li>
                </ul>
              </li>
              <li className="mb-2">
                <b>Bảo vệ dữ liệu cá nhân</b>
                <ul>
                  <li>Dữ liệu (kể cả ảnh/CCCD) được xử lý theo Chính sách bảo mật; mã hóa dữ liệu nhạy cảm; chỉ dùng cho vận hành, KYC, chống gian lận, thực hiện nghĩa vụ pháp lý.</li>
                  <li>Bên B có quyền yêu cầu truy cập/chỉnh sửa/xóa theo pháp luật hiện hành. Bên A có thể lưu trữ tối thiểu theo thời hạn luật định (kế toán, phòng chống rửa tiền…).</li>
                </ul>
              </li>
              <li className="mb-2">
                <b>Nâng cấp thành Makeup Artist (tùy chọn)</b>
                <ul>
                  <li>Bên B muốn trở thành MUA phải đồng ý Thỏa thuận điện tử dành cho MUA và hoàn tất KYC (CCCD + selfie + portfolio/chứng chỉ). Bên A có quyền từ chối nếu không đạt chuẩn.</li>
                </ul>
              </li>
              <li className="mb-2">
                <b>Sở hữu trí tuệ</b>
                <ul>
                  <li>Logo, giao diện, mã nguồn, tài liệu thuộc MuaHub/đối tác; nghiêm cấm sao chép, sửa đổi, khai thác trái phép.</li>
                </ul>
              </li>
              <li className="mb-2">
                <b>Giới hạn trách nhiệm</b>
                <ul>
                  <li>Bên A không chịu trách nhiệm cho thiệt hại gián tiếp, lợi nhuận mất đi, dữ liệu thất lạc do sự cố khách quan/bất khả kháng. Trách nhiệm tối đa (nếu có) không vượt quá số tiền Bên B đã thanh toán cho giao dịch liên quan trên nền tảng.</li>
                </ul>
              </li>
              <li className="mb-2">
                <b>Tạm ngừng/chấm dứt</b>
                <ul>
                  <li>Bên A có quyền tạm khóa/khóa vĩnh viễn tài khoản vi phạm thỏa thuận/chính sách/pháp luật, có rủi ro gian lận/bảo mật.</li>
                  <li>Bên B có thể yêu cầu đóng tài khoản; dữ liệu giao dịch vẫn được lưu theo luật.</li>
                </ul>
              </li>
              <li className="mb-2">
                <b>Luật áp dụng & tranh chấp</b>
                <ul>
                  <li>Áp dụng pháp luật Việt Nam; ưu tiên hòa giải; nếu không thành, giải quyết tại tòa án có thẩm quyền nơi Bên A đặt trụ sở (trừ khi pháp luật có quy định khác).</li>
                </ul>
              </li>
            </ol>
            <blockquote className="mt-4 p-3 bg-light border-start border-4 border-primary" style={{fontSize:'1.05rem'}}>
              <b>XÁC NHẬN CHẤP THUẬN (bắt buộc khi đăng ký):</b><br/>
              <span className="text-success">[ ] Tôi đã đọc và đồng ý Hợp đồng/Thỏa thuận điện tử đăng ký tài khoản MuaHub v1.0</span><br/>
              <span className="text-secondary">[Đăng ký tài khoản]</span>
            </blockquote>
            <div className="mt-3" style={{fontSize:'0.98rem', color:'#888'}}>
              <b>Khuyến nghị lưu vết (bắt buộc cho pháp lý/audit):</b><br/>
              Lưu: userId/email, version=v1.0, agreedAt, agreedIP, userAgent, agreementHash; snapshot nội dung hợp đồng; trạng thái kiểm tra trùng email và cccd.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractPage;
