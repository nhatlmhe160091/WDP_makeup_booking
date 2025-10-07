"use client";

import { useState, useEffect } from "react";
import SendRequest from "@muahub/utils/SendRequest";

const COOLDOWN_HOURS = 1;

export default function Page() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cooldownLeft, setCooldownLeft] = useState(0);

  useEffect(() => {
    const lastSent = localStorage.getItem("forgot_password_last_sent");
    if (lastSent) {
      const lastTime = new Date(lastSent);
      const now = new Date();
      const diff = (now - lastTime) / (1000 * 60 * 60); // hours
      if (diff < COOLDOWN_HOURS) {
        setCooldownLeft(COOLDOWN_HOURS - diff);
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const lastSent = localStorage.getItem("forgot_password_last_sent");
    if (lastSent) {
      const lastTime = new Date(lastSent);
      const now = new Date();
      const diff = (now - lastTime) / (1000 * 60 * 60);

      if (diff < COOLDOWN_HOURS) {
        setCooldownLeft(COOLDOWN_HOURS - diff);
        setError("Bạn chỉ có thể gửi lại sau 1 giờ. Vui lòng thử lại sau.");
        setLoading(false);
        return;
      }
    }

    try {
      const res = await SendRequest("POST", "/api/users/forgot-password", {
        email
      });

      if (res.payload) {
        setSent(true);
        localStorage.setItem("forgot_password_last_sent", new Date().toISOString());
      } else {
        setError(res.message || "Đã xảy ra lỗi, vui lòng thử lại.");
      }
    } catch (err) {
      console.error("Forgot password error:", err);
      setError("Không thể gửi yêu cầu. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex flex-column justify-content-center align-items-center py-5 px-3">
      <div className="w-100" style={{ maxWidth: 500 }}>
        {sent ? (
          <div className="alert alert-success text-center">
            Yêu cầu đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra email của bạn.
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <packageset disabled={loading}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Địa chỉ email
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  placeholder="nhapemail@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {error && <div className="alert alert-danger">{error}</div>}

              {cooldownLeft > 0 && (
                <div className="alert alert-warning">
                  Bạn đã gửi yêu cầu gần đây. Vui lòng thử lại sau khoảng {Math.ceil(cooldownLeft * 60)} phút.
                </div>
              )}

              <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Đang gửi...
                  </>
                ) : (
                  "Gửi yêu cầu đặt lại mật khẩu"
                )}
              </button>
            </packageset>
          </form>
        )}
      </div>
    </div>
  );
}
