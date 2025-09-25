"use client";

import SendRequest from "@quanlysanbong/utils/SendRequest";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const SignUpComponent = () => {
  const router = useRouter();
  const [provinces, setProvinces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    province: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
    isOver18: false
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetch("https://open.oapi.vn/location/provinces?size=100")
      .then((response) => response.json())
      .then((data) => setProvinces(data.data));
  }, []);

  const validateForm = () => {
    let validationErrors = {};
    if (!formData.name) {
      validationErrors.name = "Tên của bạn là bắt buộc.";
    }
    if (!formData.province) {
      validationErrors.province = "Vui lòng chọn Tỉnh/Thành phố.";
    }
    if (!formData.email) {
      validationErrors.email = "Email là bắt buộc.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      validationErrors.email = "Email không hợp lệ.";
    }
    if (!formData.phone) {
      validationErrors.phone = "Số điện thoại là bắt buộc.";
    }
    if (!formData.password) {
      validationErrors.password = "Mật khẩu là bắt buộc.";
    }
    if (formData.password !== formData.confirmPassword) {
      validationErrors.confirmPassword = "Mật khẩu xác nhận không khớp.";
    }
    if (!formData.acceptTerms) {
      validationErrors.acceptTerms = "Bạn phải đồng ý với các điều khoản sử dụng.";
    }
    if (!formData.isOver18) {
      validationErrors.isOver18 = "Bạn phải xác nhận bạn trên 18 tuổi.";
    }

    setErrors(validationErrors);

    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      setLoading(true);
      const res = await SendRequest("POST", "/api/users", {
        ...formData,
        address: formData.province
      });
      setLoading(false);

      if (res.payload) {
        toast.success("Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.");
        // reset form
        setFormData({
          name: "",
          province: "",
          email: "",
          phone: "",
          password: "",
          confirmPassword: "",
          acceptTerms: false,
          isOver18: false
        });
        router.push("/dang-nhap");
      }
    }
  };

  const handleChange = (e) => {
    const { id, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [id]: type === "checkbox" ? checked : value
    });
  };

  return (
    <div className="container-fluid py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card shadow-sm">
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">
                      Tên của bạn
                    </label>
                    <input
                      disabled={loading}
                      type="text"
                      className="form-control"
                      id="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Nhập tên của bạn"
                      required
                    />
                    {errors.name && <div className="text-danger">{errors.name}</div>}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="province" className="form-label">
                      Tỉnh/Thành phố
                    </label>
                    <select
                      className="form-select"
                      id="province"
                      value={formData.province}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    >
                      <option value="">Chọn Tỉnh/Thành phố</option>
                      {provinces.map((province) => (
                        <option key={province.id} value={province.name}>
                          {province.name}
                        </option>
                      ))}
                    </select>
                    {errors.province && <div className="text-danger">{errors.province}</div>}
                    <div className="form-text">Chọn Tỉnh, thành phố để chúng tôi phục vụ bạn tốt hơn</div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      Tài khoản Email
                    </label>
                    <input
                      disabled={loading}
                      type="email"
                      className="form-control"
                      id="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Nhập email của bạn"
                      required
                    />
                    {errors.email && <div className="text-danger">{errors.email}</div>}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      Số điện thoại
                    </label>
                    <input
                      disabled={loading}
                      type="phone"
                      className="form-control"
                      id="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Nhập sdt của bạn"
                      required
                    />
                    {errors.phone && <div className="text-danger">{errors.phone}</div>}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                      Mật khẩu
                    </label>
                    <input
                      disabled={loading}
                      type="password"
                      className="form-control"
                      id="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Nhập mật khẩu của bạn"
                      required
                    />
                    {errors.password && <div className="text-danger">{errors.password}</div>}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="confirmPassword" className="form-label">
                      Xác nhận mật khẩu
                    </label>
                    <input
                      disabled={loading}
                      type="password"
                      className="form-control"
                      id="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Xác nhận mật khẩu của bạn"
                      required
                    />
                    {errors.confirmPassword && <div className="text-danger">{errors.confirmPassword}</div>}
                  </div>

                  <div className="mb-2">
                    <div className="form-check">
                      <input
                        disabled={loading}
                        type="checkbox"
                        className="form-check-input"
                        id="acceptTerms"
                        checked={formData.acceptTerms}
                        onChange={handleChange}
                      />
                      <label className="form-check-label" htmlFor="acceptTerms">
                        Tôi đồng ý với các điều khoản sử dụng
                      </label>
                    </div>
                    {errors.acceptTerms && <div className="text-danger">{errors.acceptTerms}</div>}
                  </div>
                  <div className="mb-2">
                    <div className="form-check">
                      <input
                        disabled={loading}
                        type="checkbox"
                        className="form-check-input"
                        id="isOver18"
                        checked={formData.isOver18}
                        onChange={handleChange}
                      />
                      <label className="form-check-label" htmlFor="isOver18">
                        Tôi xác nhận tôi trên 18 tuổi
                      </label>
                    </div>
                    {errors.isOver18 && <div className="text-danger">{errors.isOver18}</div>}
                  </div>

                  <button type="submit" className="btn btn-primary w-100 mt-3" disabled={loading}>
                    Đăng ký
                  </button>

                  <p className="text-center mt-3">
                    Bạn đã có tài khoản? <Link href="/dang-nhap">Đăng nhập ngay</Link>
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpComponent;
