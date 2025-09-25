const OurFeaturesComponent = () => {
  return (
    <div className="container-fluid feature pb-5 bg-light">
      <div className="container pb-5">
        <div className="text-center mx-auto pb-5 wow fadeInUp" data-wow-delay="0.2s" style={{ maxWidth: "800px" }}>
          <h4 className="text-uppercase" style={{ color: "#E91E63" }}>Dịch Vụ Nổi Bật</h4>
          <h1 className="display-5 mb-4 text-dark">Makeup Nhanh – Đẹp Chuẩn Gu</h1>
          <p className="mb-0 text-muted">Đặt lịch makeup nhanh chóng, chọn phong cách, chuyên viên và thời gian linh hoạt.</p>
        </div>
        <div className="row g-3">
          <div className="col-md-6 col-lg-6 col-xl-3 wow fadeInUp" data-wow-delay="0.2s">
            <div className="feature-item p-4">
              <div className="feature-icon p-4 mb-4">
                <i className="fas fa-bolt fa-4x" style={{ color: "#E91E63" }}></i>
              </div>
              <h4>Đặt Lịch Tức Thì</h4>
              <p className="mb-4">Chọn dịch vụ và chuyên viên chỉ trong vài bước.</p>
            </div>
          </div>
          <div className="col-md-6 col-lg-6 col-xl-3 wow fadeInUp" data-wow-delay="0.4s">
            <div className="feature-item p-4">
              <div className="feature-icon p-4 mb-4">
                <i className="fas fa-users fa-4x" style={{ color: "#E91E63" }}></i>
              </div>
              <h4>Nhiều Chuyên Viên</h4>
              <p className="mb-4">Đa dạng chuyên viên theo phong cách bạn thích.</p>
            </div>
          </div>
          <div className="col-md-6 col-lg-6 col-xl-3 wow fadeInUp" data-wow-delay="0.6s">
            <div className="feature-item p-4">
              <div className="feature-icon p-4 mb-4">
                <i className="fas fa-gem fa-4x" style={{ color: "#E91E63" }}></i>
              </div>
              <h4>Chất Lượng Cam Kết</h4>
              <p className="mb-4">Dụng cụ sạch, kỹ thuật chuẩn, bền đẹp suốt ngày dài.</p>
            </div>
          </div>
          {/* Chi phí rõ ràng */}
          <div className="col-md-6 col-lg-6 col-xl-3 wow fadeInUp" data-wow-delay="0.8s">
            <div className="feature-item p-4">
              <div className="feature-icon p-4 mb-4">
                <i className="fas fa-receipt fa-4x" style={{ color: "#E91E63" }}></i>
              </div>
              <h4>Giá Minh Bạch</h4>
              <p className="mb-4">Niêm yết rõ ràng, không phí ẩn.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OurFeaturesComponent;
