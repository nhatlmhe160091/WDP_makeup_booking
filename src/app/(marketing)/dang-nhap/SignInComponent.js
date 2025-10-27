"use client";
import SendRequest from "@muahub/utils/SendRequest";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
const SignInComponent = () => {
  const [formData, setFormData] = useState({ email: "", password: "", rememberMe: false });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const validateForm = () => {
    let validationErrors = {};
    if (!formData.email) {
      validationErrors.email = "Email là bắt buộc.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      validationErrors.email = "Email không hợp lệ.";
    }
    if (!formData.password) {
      validationErrors.password = "Mật khẩu là bắt buộc.";
    }

    setErrors(validationErrors);

    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      setLoading(true);
      const res = await SendRequest("POST", "/api/users/login", formData);
      setLoading(false);
      if (res.payload) {
        if (res.payload.active == false) {
          toast.error("Tài khoản của bạn chưa được kích hoạt. Vui lòng kiểm tra email để kích hoạt tài khoản.");
          return;
        }
        toast.success("Đăng nhập thành công");
        localStorage.setItem("token", res.payload.token);
        if (res.payload.role === "admin") {
          router.push("/admin");
        } else if (res.payload.role === "makeup_artist") {
          router.push("/makeup-artists");
        } else {
          router.push("/");
        }
      } else {
        toast.error("Đăng nhập thất bại, vui lòng kiểm tra thông tin của bạn.");
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

                  <div className="d-flex justify-content-between align-items-center">
                    <div className="form-check">
                      <input
                        disabled={loading}
                        type="checkbox"
                        className="form-check-input"
                        id="rememberMe"
                        checked={formData.rememberMe}
                        onChange={handleChange}
                      />
                      <label className="form-check-label" htmlFor="rememberMe">
                        Ghi nhớ đăng nhập
                      </label>
                    </div>
                    <a href="/quen-mat-khau" className="text-decoration-none">
                      Quên mật khẩu?
                    </a>
                  </div>

                  <button type="submit" className="btn btn-primary w-100 mt-3" disabled={loading}>
                    Đăng nhập
                  </button>

                  <p className="text-center mt-3">
                    Bạn chưa có tài khoản? <Link href="/dang-ky">Đăng ký ngay</Link>
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

export default SignInComponent;
