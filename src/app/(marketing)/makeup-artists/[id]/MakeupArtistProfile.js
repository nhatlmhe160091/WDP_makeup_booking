"use client";


import { useState } from "react";

const MakeupArtistProfile = ({ artist }) => {
  const [selectedPortfolioImage, setSelectedPortfolioImage] = useState(null);
  const [currentTab, setCurrentTab] = useState("portfolio"); // portfolio, reviews, certificates


  // Hiển thị trạng thái hoạt động và hoàn thiện hồ sơ
  if (artist.active === false) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning">Tài khoản này chưa được kích hoạt.</div>
      </div>
    );
  }
  // if (!artist.profileComplete) {
  //   return (
  //     <div className="container py-5">
  //       <div className="alert alert-info">Hồ sơ đang được cập nhật.</div>
  //     </div>
  //   );
  // }

  return (
    <div className="container py-5">
      <div className="row g-4 align-items-center">
        <div className="col-md-4 text-center">
          <img
            src={artist.avatar || "/img/avatar.jpg"}
            alt={artist.name}
            className="rounded-circle mb-3"
            style={{ width: 160, height: 160, objectFit: "cover", border: "4px solid #eee" }}
          />
          <h3 className="mb-1">{artist.name}</h3>
          <div className="mb-2 text-muted">{artist.address}</div>
          <div className="mb-2">
            <span className={`badge ${artist.active ? "bg-success" : "bg-secondary"}`}>
              {artist.active ? "Đang hoạt động" : "Chưa kích hoạt"}
            </span>
          </div>
          <div className="mb-2">
            <a href={`tel:${artist.phone}`} className="me-2"><i className="bi bi-telephone"></i> {artist.phone}</a>
            <a href={`mailto:${artist.email}`}><i className="bi bi-envelope"></i> {artist.email}</a>
          </div>
          <div className="mb-2">
            {artist.socialLinks?.facebook && (
              <a href={artist.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="me-2">
                <i className="bi bi-facebook"></i>
              </a>
            )}
            {artist.socialLinks?.instagram && (
              <a href={artist.socialLinks.instagram} target="_blank" rel="noopener noreferrer">
                <i className="bi bi-instagram"></i>
              </a>
            )}
          </div>
        </div>
        <div className="col-md-8">
          <h4>Giới thiệu</h4>
          <p>{artist.bio || "Chưa có mô tả."}</p>
          <div className="mb-2">
            <strong>Kinh nghiệm:</strong> {artist.experienceYears || 0} năm
          </div>
          <div className="mb-2">
            <strong>Giờ làm việc:</strong> {artist.workingHours || "Chưa cập nhật"}
          </div>
          {/* <div className="mb-2">
            <strong>CCCD:</strong> {artist.cccd}
          </div> */}
          <div className="mb-2">
            <strong>Trạng thái hồ sơ:</strong> {artist.profileComplete ? "Đầy đủ" : "Chưa hoàn thiện"}
          </div>
          <hr />
          <h5 className="mt-4">Portfolio</h5>
          <div className="row g-2">
            {artist.portfolio && artist.portfolio.length > 0 ? (
              artist.portfolio.map((item, idx) => (
                <div className="col-4" key={idx}>
                  <img src={item.image} alt={item.desc} className="img-fluid rounded" style={{ height: 120, objectFit: "cover" }} />
                  <div className="small mt-1">{item.desc}</div>
                </div>
              ))
            ) : (
              <div className="col-12 text-muted">Chưa có portfolio.</div>
            )}
          </div>
          <h5 className="mt-4">Chứng chỉ</h5>
          <div className="row g-2">
            {artist.certificates && artist.certificates.length > 0 ? (
              artist.certificates.map((item, idx) => (
                <div className="col-6 col-md-4" key={idx}>
                  <img src={item.image} alt={item.name} className="img-fluid rounded" style={{ height: 80, objectFit: "cover" }} />
                  <div className="small mt-1">{item.name}</div>
                </div>
              ))
            ) : (
              <div className="col-12 text-muted">Chưa có chứng chỉ.</div>
            )}
          </div>
        </div>
      </div>
      {/* Có thể bổ sung hiển thị reviews ở đây nếu muốn */}
    </div>
  );
};

export default MakeupArtistProfile;