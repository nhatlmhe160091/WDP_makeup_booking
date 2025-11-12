"use client";
import { VIDEO_LINK, WEB_NAME } from "@muahub/constants/MainContent";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { useState, useEffect } from "react";
import Head from "next/head";
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
  { name: "Quên mật khẩu", path: "/quen-mat-khau" },
  { name: "Đặt lại mật khẩu", path: "/dat-lai-mat-khau" },
  { name: "Bài viết", path: "/blog" },
  { name: "Yêu thích", path: "/yeu-thích" }
];

// Move function outside component để tránh tạo lại mỗi render
const getDefaultBanners = () => [
  {
    _id: 'default-1',
    imageUrl: "/img/carousel.jpg",
    title: "Trang Điểm Nhanh – Tỏa Sáng Ngay",
    description: "Đặt lịch makeup trực tuyến dễ dàng. Chuyên gia đến đúng giờ, phong cách theo ý bạn!"
  },
  {
    _id: 'default-2',
    imageUrl: "/img/carousel1.jpg",
    title: "Đặt Lịch Makeup Tiện Lợi",
    description: "Chọn chuyên viên, thời gian và phong cách chỉ trong vài bước. Trải nghiệm dịch vụ chuyên nghiệp."
  },
  {
    _id: 'default-3',
    imageUrl: "/img/carousel2.jpg",
    title: "Chuyên Gia Makeup Tận Tâm",
    description: "Đa dạng phong cách: dự tiệc, cô dâu, cá nhân… Bạn chọn – chúng tôi thực hiện."
  }
];

const CarouselComponent = ({ pathUrl }) => {
  const [banners, setBanners] = useState(() => {
    // Khởi tạo với default banners ngay lập tức để tránh loading state
    return pathUrl === "/" ? getDefaultBanners() : [];
  });
  const [loading, setLoading] = useState(false);

  // Fetch banners from API
  useEffect(() => {
    if (pathUrl !== "/") return;
    
    const fetchBanners = async () => {
      try {
        const res = await fetch("/api/banners", {
          // Thêm cache control để tăng tốc
          cache: 'force-cache',
          next: { revalidate: 300 } // Cache 5 phút
        });
        const json = await res.json();
        if (json && json.success && Array.isArray(json.data) && json.data.length > 0) {
          setBanners(json.data);
        }
        // Không cần else vì đã có default banners
      } catch (e) {
        console.warn('Failed to fetch banners, using default:', e);
        // Vẫn giữ default banners
      }
    };
    
    // Fetch async mà không block UI
    fetchBanners();
  }, [pathUrl]);

  if (pathUrl !== "/") {
    if (pathUrl.startsWith("/makeup-artists/")) {
      return (
        <div className="container-fluid bg-breadcrumb" style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('/img/carousel3.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}>
          <div className="container text-center py-5" style={{ maxWidth: "900px" }}>
            <h4 className="text-white display-4 mb-4">Hồ Sơ Chuyên Gia</h4>
            <ol className="breadcrumb d-flex justify-content-center mb-0">
              <li className="breadcrumb-item">
                <Link href="/">Trang chủ</Link>
              </li>
              <li className="breadcrumb-item">
                <Link href="/makeup-artists">Danh sách chuyên gia</Link>
              </li>
              <li className="breadcrumb-item active" style={{ color: "#ff5c95ff" }}>
                Hồ Sơ Chuyên Gia
              </li>
            </ol>
          </div>
        </div>
      );
    }
    // Breadcrumb mặc định cho các trang khác
    let NameService = LinkName.find((item) => item.path === pathUrl)?.name || "";
    let parentPath = null;
    if (pathUrl.includes("/make-up/")) {
      NameService = "Chi Tiết Dịch Vụ";
      parentPath = {
        name: "Danh sách dịch vụ",
        path: "/dich-vu"
      };
    } 
    else if (pathUrl.includes("/blog/")) {
      NameService = "Chi Tiết Blog";
      parentPath = {
        name: "Bài viết",
        path: "/blog"
      };
    }
    return (
      <div className="container-fluid bg-breadcrumb" style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('/img/carousel3.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}>
        <div className="container text-center py-5" style={{ maxWidth: "900px" }}>
          <h4 className="text-white display-4 mb-4">{NameService}</h4>
          <ol className="breadcrumb d-flex justify-content-center mb-0">
            <li className="breadcrumb-item">
              <Link href="/">Trang chủ</Link>
            </li>
            {parentPath && (
              <li className="breadcrumb-item">
                <Link href={parentPath.path}>{parentPath.name}</Link>
              </li>
            )}
            <li className="breadcrumb-item active" style={{ color: "#ff5c95ff" }}>{NameService}</li>
          </ol>
        </div>
      </div>
    );
  }

  // Bỏ loading state vì đã có default banners

  return (
    <>
      {/* Preload banner đầu tiên */}
      {banners.length > 0 && (
        <Head>
          <link
            rel="preload"
            as="image"
            href={banners[0].imageUrl}
            fetchPriority="high"
          />
        </Head>
      )}
      
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
          <div style={{ position: 'relative', height: "500px", backgroundColor: '#f8f9fa' }}>
            <img
              src={banner.imageUrl}
              className="img-fluid w-100"
              alt={banner.title || "Banner"}
              style={{ 
                height: "500px", 
                objectFit: "cover",
                transition: 'opacity 0.3s ease'
              }}
              loading={index === 0 ? "eager" : "lazy"}
              decoding="async"
              sizes="100vw"
              fetchPriority={index === 0 ? "high" : "low"}
              onLoad={(e) => {
                e.target.style.opacity = '1';
              }}
              onError={(e) => {
                // Fallback image nếu không load được
                e.target.src = '/img/carousel.jpg';
              }}
            />
          </div>
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
    </>
  );
};

export default CarouselComponent;
