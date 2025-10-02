const OurOfferComponent = () => {
  return (
    <div className="container-fluid offer-section pb-5" style={{ background: "rgba(248,187,208,0.03)" }}>
      <div className="container pb-5">
        <div className="text-center mx-auto pb-5 wow fadeInUp" data-wow-delay="0.2s" style={{ maxWidth: "800px" }}>
          <h4 style={{ color: "#ff5c95ff", fontWeight: 600 }}>Lợi Ích Dành Cho Chuyên Viên Makeup</h4>
          <h1 className="display-5 mb-4">Tăng Lịch – Quản Lý Dễ Dàng</h1>
          <p className="mb-0">Nhận khách đều đặn, quản lý lịch thông minh, thanh toán nhanh gọn trên một nền tảng.</p>
        </div>
        <div className="row g-5 align-items-center">
          <div className="col-xl-5 wow fadeInLeft" data-wow-delay="0.2s">
            <div className="nav nav-pills bg-white rounded-4 p-4 shadow-sm">
              <a className="accordion-link p-3 active mb-3 d-block rounded-3" data-bs-toggle="pill" href="#collapseOne" style={{ borderLeft: '4px solid #ff5c95ff' }}>
                <h5 className="mb-0">Tăng Lịch Nhờ Đặt Online</h5>
              </a>
              <a className="accordion-link p-3 mb-3 d-block rounded-3" data-bs-toggle="pill" href="#collapseTwo" style={{ borderLeft: '4px solid transparent' }}>
                <h5 className="mb-0">Tiếp Cận Nhiều Khách Hơn</h5>
              </a>
              <a className="accordion-link p-3 mb-3 d-block rounded-3" data-bs-toggle="pill" href="#collapseThree" style={{ borderLeft: '4px solid transparent' }}>
                <h5 className="mb-0">Quản Lý Lịch Thông Minh</h5>
              </a>
              <a className="accordion-link p-3 mb-0 d-block rounded-3" data-bs-toggle="pill" href="#collapseFour" style={{ borderLeft: '4px solid transparent' }}>
                <h5 className="mb-0">Thanh Toán Nhanh - Minh Bạch</h5>
              </a>
            </div>
          </div>
          <div className="col-xl-7 wow fadeInRight" data-wow-delay="0.4s">
            <div className="tab-content bg-white rounded-4 p-4 shadow-sm">
              <div id="collapseOne" className="tab-pane fade show p-0 active">
                <h1 className="display-5 mb-4">Gia Tăng Doanh Thu</h1>
                <p className="mb-4">Tối ưu hóa lịch làm việc và tăng số lượng khách hàng nhờ hệ thống đặt lịch makeup tự động 24/7. Không còn lo lắng về những ngày vắng khách, bạn sẽ nhận được thông báo đặt lịch mới ngay lập tức, giúp lấp đầy lịch trình và nâng cao thu nhập ổn định mỗi tháng.</p>
              </div>
              <div id="collapseTwo" className="tab-pane fade show p-0">
                <h1 className="display-5 mb-4">Mở Rộng Khách Hàng</h1>
                <p className="mb-4">Tiếp cận hàng ngàn khách hàng tiềm năng trên nền tảng, xây dựng hồ sơ cá nhân chuyên nghiệp với hình ảnh, dịch vụ và đánh giá thực tế. Hệ thống giúp bạn nổi bật giữa cộng đồng makeup artist, tăng cơ hội được khách hàng mới lựa chọn và đặt lịch nhanh chóng.</p>
              </div>
              <div id="collapseThree" className="tab-pane fade show p-0">
                <h1 className="display-5 mb-4">Quản Lý Lịch Dễ Dàng</h1>
                <p className="mb-4">Quản lý lịch hẹn thông minh, mọi thao tác đặt - hủy - thay đổi đều được đồng bộ tức thì. Hệ thống tự động nhắc lịch, cảnh báo trùng giờ, gửi thông báo qua email/SMS giúp bạn không bỏ lỡ bất kỳ khách hàng nào. Xem lịch làm việc mọi lúc, mọi nơi trên điện thoại hoặc máy tính.</p>
              </div>
              <div id="collapseFour" className="tab-pane fade show p-0">
                <h1 className="display-5 mb-4">Thanh Toán Nhanh Gọn</h1>
                <p className="mb-4">Dễ dàng quản lý doanh thu, nhận thanh toán nhanh chóng và minh bạch qua nhiều hình thức. Hệ thống tự động thống kê, báo cáo thu nhập, giúp bạn kiểm soát tài chính hiệu quả và tập trung phát triển dịch vụ mà không lo lắng về vấn đề tiền bạc.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OurOfferComponent;
