import { PHONE_NUMBER } from "@quanlysanbong/constants/MainContent";
import Link from "next/link";

const AboutUsComponent = () => {
  return (
    <div className="container-fluid bg-light py-5">
      <div className="container py-5">
        <div className="row g-5 align-items-center">
          <div className="col-xl-7 wow fadeInLeft" data-wow-delay="0.2s">
            <div>
              <h5 className="text-uppercase tracking-wide mb-3" style={{ color: "#E91E63" }}>Về Chúng Tôi</h5>
              <h2 className="display-5 fw-bold mb-4 text-dark">Đặt lịch makeup nhanh – Trải nghiệm chuyên nghiệp</h2>
              <p className="mb-4 text-muted fs-5">Nền tảng đặt lịch makeup hiện đại, dễ dùng, chất lượng uy tín.</p>
              <div className="row g-4">
                <div className="col-md-6 col-lg-6 col-xl-6">
                  <div className="d-flex align-items-start card shadow-sm p-3">
                    <i className="fas fa-laptop-code fa-3x me-3 mb-2" style={{ color: "#E91E63" }}></i>
                    <div>
                      <h5 className="fw-semibold mb-1">Hệ Thống Linh Hoạt</h5>
                      <p className="text-muted mb-1">Đặt lịch mọi lúc, mọi nơi – chỉ với vài thao tác.</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 col-lg-6 col-xl-6">
                  <div className="d-flex align-items-start card shadow-sm p-3">
                    <i className="fas fa-calendar-check fa-3x me-3 mb-2" style={{ color: "#E91E63" }}></i>
                    <div>
                      <h5 className="fw-semibold mb-1">Kinh Nghiệm Uy Tín</h5>
                      <p className="text-muted mb-0">Nhiều năm phục vụ hàng nghìn lịch makeup.</p>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6 mt-4">
                  <Link href="/dich-vu" className="btn btn-primary rounded-pill py-3 px-5 w-100">
                    Đặt Lịch Ngay
                  </Link>
                </div>
                <div className="col-sm-6 mt-4">
                  <div className="d-flex align-items-center">
                    <i className="fas fa-phone fa-2x me-3" style={{ color: "#E91E63" }}></i>
                    <div>
                      <h5 className="fw-semibold mb-1">Liên Hệ</h5>
                      <p className="mb-0 fs-5 text-dark" style={{ letterSpacing: "1px" }}>
                        {PHONE_NUMBER}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-xl-5 wow fadeInRight" data-wow-delay="0.2s">
            <div className="position-relative rounded overflow-hidden shadow-lg">
              <img src="/img/ab5.jpg" className="img-fluid rounded w-100" alt="Makeup" />
              <img src="/img/ab4.jpg" className="img-fluid w-100 rounded-bottom" alt="Makeup collection" style={{ objectFit: "cover" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUsComponent;
