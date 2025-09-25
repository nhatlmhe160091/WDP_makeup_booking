const OurOfferComponent = () => {
  return (
    <div className="container-fluid offer-section pb-5">
      <div className="container pb-5">
        <div className="text-center mx-auto pb-5 wow fadeInUp" data-wow-delay="0.2s" style={{ maxWidth: "800px" }}>
          <h4 style={{ color: "#E91E63" }}>Lợi Ích Dành Cho Chuyên Viên Makeup</h4>
          <h1 className="display-5 mb-4">Tăng Lịch – Quản Lý Dễ Dàng</h1>
          <p className="mb-0">Nhận khách đều đặn, quản lý lịch thông minh, thanh toán nhanh gọn trên một nền tảng.</p>
        </div>
        <div className="row g-5 align-items-center">
          <div className="col-xl-5 wow fadeInLeft" data-wow-delay="0.2s">
            <div className="nav nav-pills bg-light rounded p-5">
              <a className="accordion-link p-4 active mb-4" data-bs-toggle="pill" href="#collapseOne">
                <h5 className="mb-0">Tăng Lịch Nhờ Đặt Online</h5>
              </a>
              <a className="accordion-link p-4 mb-4" data-bs-toggle="pill" href="#collapseTwo">
                <h5 className="mb-0">Tiếp Cận Nhiều Khách Hơn</h5>
              </a>
              <a className="accordion-link p-4 mb-4" data-bs-toggle="pill" href="#collapseThree">
                <h5 className="mb-0">Quản Lý Lịch Thông Minh</h5>
              </a>
              <a className="accordion-link p-4 mb-0" data-bs-toggle="pill" href="#collapseFour">
                <h5 className="mb-0">Thanh Toán Nhanh - Minh Bạch</h5>
              </a>
            </div>
          </div>
          <div className="col-xl-7 wow fadeInRight" data-wow-delay="0.4s">
            <div className="tab-content">
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
