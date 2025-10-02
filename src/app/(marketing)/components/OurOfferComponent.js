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
                <p className="mb-4">Nhận đơn đều đặn, hạn chế trống lịch nhờ nền tảng đặt lịch trực tuyến.</p>
              </div>
              <div id="collapseTwo" className="tab-pane fade show p-0">
                <h1 className="display-5 mb-4">Mở Rộng Khách Hàng</h1>
                <p className="mb-4">Xuất hiện với hồ sơ đẹp, đánh giá tốt để thu hút thêm khách mới.</p>
              </div>
              <div id="collapseThree" className="tab-pane fade show p-0">
                <h1 className="display-5 mb-4">Quản Lý Lịch Dễ Dàng</h1>
                <p className="mb-4">Tự động nhắc lịch, tránh trùng giờ, đồng bộ thông báo qua email/SMS.</p>
              </div>
              <div id="collapseFour" className="tab-pane fade show p-0">
                <h1 className="display-5 mb-4">Thanh Toán Nhanh Gọn</h1>
                <p className="mb-4">Thanh toán tiện lợi, minh bạch – theo dõi doanh thu rõ ràng.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OurOfferComponent;
