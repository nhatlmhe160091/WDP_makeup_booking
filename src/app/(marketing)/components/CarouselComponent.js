"use client";
import { VIDEO_LINK, WEB_NAME } from "@muahub/constants/MainContent";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { useState, useEffect } from "react";
// import SendRequest from "@muahub/utils/SendRequest";
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
            <li className="breadcrumb-item active" style={{ color: "#ff5c95ff" }}>{NameStadium}</li>
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
      autoplay={{
        delay: 3000,
        disableOnInteraction: false,
      }}
      pagination={{ clickable: true }}
      navigation={false}
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
            <div className="container-fluid d-flex justify-content-start align-items-center h-100 ps-4 ps-md-5" style={{ height: '100%' }}>
              <div className="col-xl-7 col-lg-8 col-md-10 col-12">
                <div className="text-start">
                  <h4 className="text-uppercase fw-bold mb-4" style={{ color: "#ff5c95ff" }}>Chào Mừng Đến Với {WEB_NAME}</h4>
                  <h1 className="display-4 text-uppercase text-white mb-4">{banner.title}</h1>
                  <p className="mb-5 fs-5">{banner.description}</p>
                  <div className="d-flex justify-content-start">
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
        </SwiperSlide>
      ))}

      <style jsx global>{`
        .swiper-button-prev,
        .swiper-button-next {
          display: none !important;
        }
      `}</style>
    </Swiper>
  );
};

export default CarouselComponent;
