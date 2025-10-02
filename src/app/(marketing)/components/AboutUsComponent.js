"use client"
import { PHONE_NUMBER } from "@quanlysanbong/constants/MainContent";
import Link from "next/link";

const AboutUsComponent = () => {
  return (
  <div className="container-fluid py-5" style={{ background: "linear-gradient(135deg, #ff5c95ff 0%, #fff 100%)" }}>
    <div className="container py-5">
      <div className="row g-5 align-items-center flex-xl-row flex-column-reverse">
        {/* Hình ảnh bên trái */}
        <div className="col-xl-5 col-12 mb-4 mb-xl-0 wow fadeInLeft" data-wow-delay="0.2s">
          <div className="position-relative rounded overflow-hidden shadow-lg h-100 d-flex flex-column justify-content-center">
            <img src="/img/ab5.jpg" className="img-fluid rounded w-100 mb-2" alt="Makeup" style={{ transition: "transform 0.3s" }} onMouseOver={e => e.currentTarget.style.transform='scale(1.04)'} onMouseOut={e => e.currentTarget.style.transform=''} />
            <img src="/img/ab4.jpg" className="img-fluid w-100 rounded-bottom" alt="Makeup collection" style={{ objectFit: "cover", transition: "transform 0.3s" }} onMouseOver={e => e.currentTarget.style.transform='scale(1.04)'} onMouseOut={e => e.currentTarget.style.transform=''} />
          </div>
        </div>
        {/* Đường phân cách dọc trên desktop */}
        <div className="d-none d-xl-block col-xl-1 px-0">
          <div style={{ borderLeft: "2px solid #ff5c95ff", height: "100%", margin: "0 auto" }}></div>
        </div>
        {/* Nội dung bên phải */}
        <div className="col-xl-6 col-12 wow fadeInRight" data-wow-delay="0.2s">
          <div>
            <h5 className="text-uppercase tracking-wide mb-3" style={{ color: "#E91E63", letterSpacing: "2px" }}>Về Chúng Tôi</h5>
            <h2 className="display-5 fw-bold mb-4 text-dark" style={{ textShadow: "0 2px 8px #ff5c95ff" }}>Đặt lịch makeup nhanh – Trải nghiệm chuyên nghiệp</h2>
            <p className="mb-4 text-muted fs-5" style={{ fontStyle: "italic" }}>Nền tảng đặt lịch makeup hiện đại, dễ dùng, chất lượng uy tín.</p>
            {/* Card dịch vụ xếp ngang trên desktop, 2 hàng trên mobile */}
            <div className="row g-4 mb-2">
              <div className="col-12 col-md-6">
                <div className="d-flex align-items-start card shadow-sm p-3 rounded-4 border-0 h-100" style={{ background: "#fff6fa" }}>
                  <i className="fas fa-laptop-code fa-3x me-3 mb-2" style={{ color: "#E91E63" }}></i>
                  <div>
                    <h5 className="fw-semibold mb-1">Hệ Thống Linh Hoạt</h5>
                    <p className="text-muted mb-1">Đặt lịch mọi lúc, mọi nơi – chỉ với vài thao tác.</p>
                  </div>
                </div>
              </div>
              <div className="col-12 col-md-6">
                <div className="d-flex align-items-start card shadow-sm p-3 rounded-4 border-0 h-100" style={{ background: "#fff6fa" }}>
                  <i className="fas fa-calendar-check fa-3x me-3 mb-2" style={{ color: "#E91E63" }}></i>
                  <div>
                    <h5 className="fw-semibold mb-1">Kinh Nghiệm Uy Tín</h5>
                    <p className="text-muted mb-0">Nhiều năm phục vụ hàng nghìn lịch makeup.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="row g-3">
              <div className="col-12 col-sm-6">
                <Link href="/dich-vu" className="btn btn-primary rounded-pill py-3 px-5 w-100 shadow-lg border-0" style={{ background: "#E91E63", borderColor: "#E91E63", transition: "transform 0.2s, box-shadow 0.2s" }} onMouseOver={e => {e.currentTarget.style.transform='scale(1.05)';e.currentTarget.style.boxShadow='0 4px 24px #e91e6340';}} onMouseOut={e => {e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='';}}>
                  Đặt Lịch Ngay
                </Link>
              </div>
              <div className="col-12 col-sm-6">
                <div className="d-flex align-items-center rounded-4 shadow-sm p-3 h-100" style={{ background: "#fff6fa" }}>
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
      </div>
    </div>
  </div>
  );
};

export default AboutUsComponent;
