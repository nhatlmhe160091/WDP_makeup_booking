"use client";

import { formatCurrency } from "@muahub/utils/Main";
import Link from "next/link";
import "@muahub/styles/makeup-artist-enhancements.css";

const BoxFieldComponent = ({ field, showDistance = false, distance, showBookingCount = false, bookingCount = 0 }) => {
  // Xử lý tên artist - ưu tiên artistName, sau đó stadiumName
  const displayName = field.artistName || field.stadiumName;
  
  // Xử lý kinh nghiệm - tính từ experienceYears hoặc experienceMonths
  const getExperience = () => {
    if (field.experienceYears && field.experienceYears > 0) {
      return `${field.experienceYears} năm`;
    }
    if (field.experienceMonths && field.experienceMonths > 0) {
      return `${field.experienceMonths} tháng`;
    }
    return null;
  };

  // Xử lý hình ảnh - kiểm tra có ảnh hay không
  const getDisplayImage = () => {
    if (field.images && field.images.length > 0 && field.images[0]) {
      return field.images[0];
    }
    // Ảnh mặc định cho dịch vụ makeup
    return "/img/service-2.jpg";
  };

  // Component hình ảnh hoặc placeholder
  const ImageOrPlaceholder = () => {
    const imageUrl = getDisplayImage();
    
    if (imageUrl) {
      return (
        <img
          // src={imageUrl}
             src={"/img/ab0.jpg"}
          alt={displayName}
          className="card-img-top img-fluid"
          style={{ height: "250px", objectFit: "cover" }}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      );
    }
    
    return (
      <div 
        className="default-makeup-image card-img-top"
        style={{ height: "250px" }}
      >
        <i className="fas fa-palette"></i>
      </div>
    );
  };

  // Tính rating mặc định dựa trên kinh nghiệm
  const getDisplayRating = () => {
    if (field.rating) return field.rating;
    // Tính rating dựa trên kinh nghiệm
    const years = field.experienceYears || 0;
    if (years >= 10) return "5.0";
    if (years >= 5) return "4.8";
    if (years >= 2) return "4.5";
    return "4.2";
  };

  return (
    <div className="col-lg-4 col-md-6">
      <div className="card h-100 makeup-artist-card">
        <div className="position-relative">
          <ImageOrPlaceholder />
          <div 
            className="default-makeup-image card-img-top"
            style={{ height: "250px", display: "none" }}
          >
            <i className="fas fa-palette"></i>
          </div>
          <div className="position-absolute top-0 end-0 p-2">
            <span className="badge bg-primary">
              <i className="fas fa-star me-1"></i>
              {getDisplayRating()}
            </span>
          </div>
        </div>
        <div className="card-body d-flex flex-column">
          <Link href={`/makeup-artists/${field._id}`} className="text-decoration-none">
            <h5 className="card-title" style={{ color: "#ff5c95ff", fontWeight: "600" }}>
              {displayName}
            </h5>
          </Link>
          <p className="card-text text-muted mb-2 small">
            <i className="fas fa-map-marker-alt me-1"></i> 
            {field.locationDetail}, {field.location}
          </p>
          <p className="card-text small">
            <strong>Thời gian làm việc:</strong> {field.openingTime} - {field.closingTime}
          </p>
          <p className="card-text small mb-2">
            <strong>Dịch vụ:</strong>
          </p>
          <div className="services-list mb-3">
            {Object.values(field.fields || {})
              .filter((s) => s.isAvailable)
              .slice(0, 3)
              .map((s, index) => (
                <div key={index} className="d-flex justify-content-between align-items-center py-1">
                  <span className="small text-dark">{s.name}</span>
                  <span className="badge bg-success">{formatCurrency(s.price)}</span>
                </div>
              ))}
            {Object.values(field.fields || {}).filter((s) => s.isAvailable).length > 3 && (
              <div className="text-center mt-2">
                <small className="text-muted">+{Object.values(field.fields || {}).filter((s) => s.isAvailable).length - 3} dịch vụ khác</small>
              </div>
            )}
          </div>

          {/* Hiển thị thông tin bổ sung */}
          <div className="d-flex flex-wrap gap-2 mt-auto">
            {/* Hiển thị khoảng cách */}
            {showDistance && distance !== undefined && (
              <span className="badge bg-info text-white">
                <i className="fas fa-route me-1"></i>
                {distance < 1 ? `${(distance * 1000).toFixed(0)}m` : `${distance.toFixed(1)}km`}
              </span>
            )}

            {/* Hiển thị số lượt đặt */}
            {showBookingCount && (
              <span className="badge bg-warning text-dark">
                <i className="fas fa-calendar-check me-1"></i>
                {bookingCount} lượt đặt
              </span>
            )}
            
            {/* Hiển thị kinh nghiệm */}
            {getExperience() && (
              <span className="badge bg-secondary">
                <i className="fas fa-medal me-1"></i>
                {getExperience()}
              </span>
            )}

            {/* Hiển thị số dịch vụ */}
            {Object.values(field.fields || {}).filter((s) => s.isAvailable).length > 0 && (
              <span className="badge bg-info">
                <i className="fas fa-palette me-1"></i>
                {Object.values(field.fields || {}).filter((s) => s.isAvailable).length} dịch vụ
              </span>
            )}
          </div>
          
          <div className="mt-3 d-grid">
            <Link href={`/make-up/${field._id}`} className="btn btn-primary btn-sm">
              <i className="fas fa-eye me-2"></i>
              Xem hồ sơ & Đặt lịch
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoxFieldComponent;
