"use client";
import { VIDEO_LINK, WEB_NAME } from "@quanlysanbong/constants/MainContent";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { useState, useEffect } from "react";
import SendRequest from "@quanlysanbong/utils/SendRequest";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const LinkName = [
  { name: "Trang chủ", path: "/" },
  { name: "Giới thiệu", path: "/gioi-thieu" },
  { name: "Danh sách dịch vụ", path: "/dich-vu" },
  { name: "Liên hệ", path: "/lien-he" },
  { name: "Đăng nhập", path: "/dang-nhap" },
  { name: "Đăng ký", path: "/dang-ky" },
  { name: "Trang cá nhân", path: "/trang-ca-nhan" },
  { name: "Xác thực tài khoản", path: "/xac-thuc-tai-khoan" },
  { name: "Quên mật khẩu", path: "/quen-mat-khau" }
];

const CarouselComponent = ({ pathUrl }) => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch banners from API
  useEffect(() => {
    if (pathUrl !== "/") return;
    // Luôn dùng ảnh local từ public/img để đảm bảo hiển thị đúng theo yêu cầu
    setLoading(true);
    try {
      setBanners(getDefaultBanners());
    } finally {
      setLoading(false);
    }
  }, [pathUrl]);

  const getDefaultBanners = () => [
    {
      imageUrl: "/img/carousel.jpg",
      title: "Trang Điểm Nhanh – Tỏa Sáng Ngay",
      description: "Đặt lịch makeup trực tuyến dễ dàng. Chuyên gia đến đúng giờ, phong cách theo ý bạn!"
    },
    {
      imageUrl: "/img/carousel1.jpg",
      title: "Đặt Lịch Makeup Tiện Lợi",
      description: "Chọn chuyên viên, thời gian và phong cách chỉ trong vài bước. Trải nghiệm dịch vụ chuyên nghiệp."
    },
    {
      imageUrl: "/img/carousel2.jpg",
      title: "Chuyên Gia Makeup Tận Tâm",
      description: "Đa dạng phong cách: dự tiệc, cô dâu, cá nhân… Bạn chọn – chúng tôi thực hiện."
    }
  ];

  if (pathUrl !== "/") {
    let NameStadium = LinkName.find((item) => item.path === pathUrl)?.name || "";
    let parentPath = null;
    if (pathUrl.includes("/make-up/")) {
      NameStadium = "Chi Tiết Dịch Vụ";
      parentPath = {
        name: "Danh sách dịch vụ",
        path: "/dich-vu"
      };
    }
    return (
      <div className="container-fluid bg-breadcrumb" style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('/img/carousel3.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}>
        <div className="container text-center py-5" style={{ maxWidth: "900px" }}>
          <h4 className="text-white display-4 mb-4">{NameStadium}</h4>
          <ol className="breadcrumb d-flex justify-content-center mb-0">
            <li className="breadcrumb-item">
              <Link href="/">Trang chủ</Link>
            </li>
            {parentPath && (
              <li className="breadcrumb-item">
                <Link href={parentPath.path}>{parentPath.name}</Link>
              </li>
            )}
            <li className="breadcrumb-item active" style={{ color: "#E91E63" }}>{NameStadium}</li>
          </ol>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div
        className="container-fluid"
        style={{ height: "400px", display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <Swiper
      modules={[Navigation, Pagination, Autoplay]}
      spaceBetween={50}
      slidesPerView={1}
      loop={banners.length > 1}
      autoplay={banners.length > 1 ? { delay: 3000 } : false}
      pagination={{ clickable: true }}
      navigation={banners.length > 1}
      className="mySwiper"
    >
      {banners.map((banner, index) => (
        <SwiperSlide key={banner._id || index}>
          <img
            src={banner.imageUrl}
            className="img-fluid w-100"
            alt={banner.title || "Banner"}
            style={{ height: "500px", objectFit: "cover" }}
            loading={index === 0 ? "eager" : "lazy"}
            decoding="async"
            sizes="100vw"
            fetchpriority={index === 0 ? "high" : "low"}
          />
          <div className="carousel-caption">
            <div className="container">
              <div className="row gx-5 justify-content-end">
                <div className="col-xl-7">
                  <div className="text-sm-center text-md-end">
                    <h4 className="text-uppercase fw-bold mb-4" style={{ color: "#E91E63" }}>Chào Mừng Đến Với {WEB_NAME}</h4>
                    <h1 className="display-4 text-uppercase text-white mb-4">{banner.title}</h1>
                    <p className="mb-5 fs-5">{banner.description}</p>
                    <div className="d-flex justify-content-center justify-content-md-end">
                      <a
                        className="btn btn-light rounded-pill py-3 px-4 px-md-5 me-2"
                        href={VIDEO_LINK}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <i className="fas fa-play-circle me-2"></i> Xem Video
                      </a>
                      <Link className="btn btn-primary rounded-pill py-3 px-4 px-md-5 ms-2" href="/dich-vu">
                        Đặt Lịch Makeup
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default CarouselComponent;
