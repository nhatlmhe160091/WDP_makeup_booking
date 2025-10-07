"use client";

import { useState, useEffect } from "react";
import SendRequest from "@muahub/utils/SendRequest";
import toast from "react-hot-toast";

const defaultProfile = {
  name: "",
  avatar: "",
  bio: "",
  experienceYears: 0,
  experienceMonths: 0,
  workingHours: "",
  workingHoursStart: "08:00",
  workingHoursEnd: "18:00",
  phone: "",
  email: "",
  cccd: "",
  address: "",
  bankInfo: { bankName: "", bankAccount: "", accountHolder: "" },
  socialLinks: { facebook: "", instagram: "" },
  portfolio: [],
  certificates: []
};

const UpdateMakeupArtistProfileComponent = ({ currentUser }) => {
  const [profile, setProfile] = useState(defaultProfile);
  const [loading, setLoading] = useState(false);

  // Load profile khi mount
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await SendRequest("get", `/api/makeup-artists/${currentUser._id}`);
        if (res.payload) {
          let wh = res.payload.workingHours || "08:00-18:00";
          let [start, end] = wh.split("-");
          setProfile({
            ...defaultProfile,
            ...res.payload,
            workingHours: wh,
            workingHoursStart: start || "08:00",
            workingHoursEnd: end || "18:00"
          });
        }
      } catch (e) {
        toast.error("Không thể tải hồ sơ!");
      }
      setLoading(false);
    };
    if (currentUser?._id) fetchProfile();
  }, [currentUser]);

  // Xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  // Xử lý thay đổi giờ làm việc
  const handleWorkingHoursChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
      workingHours: name === "workingHoursStart"
        ? `${value}-${prev.workingHoursEnd}`
        : `${prev.workingHoursStart}-${value}`
    }));
  };

  // Đảm bảo workingHours luôn đúng định dạng khi blur
  const handleWorkingHoursBlur = () => {
    setProfile((prev) => {
      let start = prev.workingHoursStart || "08:00";
      let end = prev.workingHoursEnd || "18:00";
      return {
        ...prev,
        workingHours: `${start}-${end}`,
        workingHoursStart: start,
        workingHoursEnd: end
      };
    });
  };

  // Xử lý thay đổi bankInfo, socialLinks
  const handleNestedChange = (e, group) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [group]: { ...prev[group], [name]: value }
    }));
  };

  // Thêm ảnh portfolio
  const handleAddPortfolio = () => {
    setProfile((prev) => ({
      ...prev,
      portfolio: [...prev.portfolio, { image: "", desc: "", category: "" }]
    }));
  };

  // Sửa portfolio
  const handlePortfolioChange = (idx, field, value) => {
    const updated = [...profile.portfolio];
    updated[idx][field] = value;
    setProfile((prev) => ({ ...prev, portfolio: updated }));
  };

  // Xóa portfolio
  const handleRemovePortfolio = (idx) => {
    const updated = [...profile.portfolio];
    updated.splice(idx, 1);
    setProfile((prev) => ({ ...prev, portfolio: updated }));
  };

  // Thêm chứng chỉ
  const handleAddCertificate = () => {
    setProfile((prev) => ({
      ...prev,
      certificates: [...prev.certificates, { name: "", image: "" }]
    }));
  };

  // Sửa chứng chỉ
  const handleCertificateChange = (idx, field, value) => {
    const updated = [...profile.certificates];
    updated[idx][field] = value;
    setProfile((prev) => ({ ...prev, certificates: updated }));
  };

  // Xóa chứng chỉ
  const handleRemoveCertificate = (idx) => {
    const updated = [...profile.certificates];
    updated.splice(idx, 1);
    setProfile((prev) => ({ ...prev, certificates: updated }));
  };

  // Submit cập nhật
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Đảm bảo workingHours luôn đúng định dạng
    let wh = `${profile.workingHoursStart || "08:00"}-${profile.workingHoursEnd || "18:00"}`;
    try {
      const res = await SendRequest("put", "/api/makeup-artist-profiles", {
        artistId: currentUser._id,
        ...profile,
        workingHours: wh
      });
      if (res.success !== false) {
        toast.success("Cập nhật hồ sơ thành công!");
      } else {
        toast.error(res.message || "Cập nhật thất bại!");
      }
    } catch {
      toast.error("Cập nhật thất bại!");
    }
    setLoading(false);
  };

  return (
    <form className="p-3" onSubmit={handleSubmit}>
      <h4 className="mb-3">Cập nhật hồ sơ chuyên gia</h4>
      <div className="row">
        <div className="col-md-6 mb-2">
          <label>Tên</label>
          <input className="form-control" name="name" value={profile.name} onChange={handleChange} required maxLength={100} />
        </div>
        <div className="col-md-6 mb-2">
          <label>Ảnh đại diện (URL)</label>
          <input className="form-control" name="avatar" value={profile.avatar} onChange={handleChange} />
        </div>
        <div className="col-12 mb-2">
          <label>Bio</label>
          <textarea className="form-control" name="bio" value={profile.bio} onChange={handleChange} maxLength={1000} />
        </div>
        <div className="col-md-4 mb-2">
          <label>Kinh nghiệm (năm)</label>
          <input type="number" className="form-control" name="experienceYears" value={profile.experienceYears} onChange={handleChange} min={0} />
        </div>
        <div className="col-md-4 mb-2">
          <label>Kinh nghiệm (tháng)</label>
          <input type="number" className="form-control" name="experienceMonths" value={profile.experienceMonths} onChange={handleChange} min={0} max={11} />
        </div>
        <div className="col-md-4 mb-2">
          <label>Giờ làm việc</label>
          <div className="d-flex gap-2">
            <input
              type="time"
              className="form-control"
              name="workingHoursStart"
              value={profile.workingHoursStart}
              onChange={handleWorkingHoursChange}
              onBlur={handleWorkingHoursBlur}
              style={{ width: "50%" }}
            />
            <span className="align-self-center">-</span>
            <input
              type="time"
              className="form-control"
              name="workingHoursEnd"
              value={profile.workingHoursEnd}
              onChange={handleWorkingHoursChange}
              onBlur={handleWorkingHoursBlur}
              style={{ width: "50%" }}
            />
          </div>
        </div>
        <div className="col-md-6 mb-2">
          <label>Số điện thoại</label>
          <input className="form-control" name="phone" value={profile.phone} onChange={handleChange} />
        </div>
        <div className="col-md-6 mb-2">
          <label>Email</label>
          <input className="form-control" name="email" value={profile.email} readOnly />
        </div>
        <div className="col-md-6 mb-2">
          <label>CCCD</label>
          <input className="form-control" name="cccd" value={profile.cccd || ""} readOnly />
        </div>
        <div className="col-12 mb-2">
          <label>Địa chỉ</label>
          <input className="form-control" name="address" value={profile.address} onChange={handleChange} />
        </div>
        <div className="col-md-4 mb-2">
          <label>Ngân hàng</label>
          <input className="form-control" name="bankName" value={profile.bankInfo.bankName} onChange={e => handleNestedChange(e, 'bankInfo')} />
        </div>
        <div className="col-md-4 mb-2">
          <label>Số tài khoản</label>
          <input className="form-control" name="bankAccount" value={profile.bankInfo.bankAccount} onChange={e => handleNestedChange(e, 'bankInfo')} />
        </div>
        <div className="col-md-4 mb-2">
          <label>Chủ tài khoản</label>
          <input className="form-control" name="accountHolder" value={profile.bankInfo.accountHolder} onChange={e => handleNestedChange(e, 'bankInfo')} />
        </div>
        <div className="col-md-6 mb-2">
          <label>Facebook</label>
          <input className="form-control" name="facebook" value={profile.socialLinks.facebook} onChange={e => handleNestedChange(e, 'socialLinks')} />
        </div>
        <div className="col-md-6 mb-2">
          <label>Instagram</label>
          <input className="form-control" name="instagram" value={profile.socialLinks.instagram} onChange={e => handleNestedChange(e, 'socialLinks')} />
        </div>
      </div>
      <hr />
      <h5>Portfolio</h5>
      {profile.portfolio.map((item, idx) => (
        <div className="row mb-2" key={idx}>
          <div className="col-md-5">
            <input className="form-control" placeholder="URL ảnh" value={item.image} onChange={e => handlePortfolioChange(idx, 'image', e.target.value)} />
          </div>
          <div className="col-md-5">
            <input className="form-control" placeholder="Mô tả" value={item.desc} onChange={e => handlePortfolioChange(idx, 'desc', e.target.value)} />
          </div>
          <div className="col-md-2 d-flex align-items-center">
            <button type="button" className="btn btn-danger btn-sm" onClick={() => handleRemovePortfolio(idx)}>Xóa</button>
          </div>
        </div>
      ))}
      <button type="button" className="btn btn-outline-primary btn-sm mb-3" onClick={handleAddPortfolio}>+ Thêm ảnh</button>
      <hr />
      <h5>Chứng chỉ</h5>
      {profile.certificates.map((item, idx) => (
        <div className="row mb-2" key={idx}>
          <div className="col-md-6">
            <input className="form-control" placeholder="Tên chứng chỉ" value={item.name} onChange={e => handleCertificateChange(idx, 'name', e.target.value)} />
          </div>
          <div className="col-md-4">
            <input className="form-control" placeholder="URL ảnh/PDF" value={item.image} onChange={e => handleCertificateChange(idx, 'image', e.target.value)} />
          </div>
          <div className="col-md-2 d-flex align-items-center">
            <button type="button" className="btn btn-danger btn-sm" onClick={() => handleRemoveCertificate(idx)}>Xóa</button>
          </div>
        </div>
      ))}
      <button type="button" className="btn btn-outline-primary btn-sm mb-3" onClick={handleAddCertificate}>+ Thêm chứng chỉ</button>
      <hr />
      <button className="btn btn-success" type="submit" disabled={loading}>
        {loading ? "Đang lưu..." : "Lưu thay đổi"}
      </button>
    </form>
  );
};

export default UpdateMakeupArtistProfileComponent;