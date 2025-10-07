"use client";

import SendRequest from "@muahub/utils/SendRequest";
import { useEffect, useState } from "react";

export default function Page() {
  const [status, setStatus] = useState("loading"); // loading | verified | expired | invalid | missing

  useEffect(() => {
    const urlParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
    const token = urlParams?.get("token");

    if (!token) {
      setStatus("missing");
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await SendRequest("GET", "/api/tokens", {
          token: token,
          type: "email_verification",
        });

        if (!res.payload) {
          setStatus("invalid");
          return;
        }

        const tokenInfo = res.payload;
        const now = new Date();
        const expiresAt = new Date(tokenInfo.expires_at);

        if (tokenInfo.status === "pending" && expiresAt > now) {
          await SendRequest("PUT", "/api/tokens", {
            token: tokenInfo.token,
            type: "email_verification",
            status: "verified",
          });
          setStatus("verified");
        } else if (expiresAt <= now) {
          setStatus("expired");
        } else if (tokenInfo.status === "verified") {
          setStatus("verified");
        } else {
          setStatus("invalid");
        }
      } catch (error) {
        console.error("Lỗi xác thực token:", error);
        setStatus("invalid");
      }
    };

    verifyToken();
  }, []);

  const renderContent = () => {
    switch (status) {
      case "loading":
        return (
          <>
            <div className="spinner-border text-primary mb-3" role="status"></div>
            <p className="fs-5">Đang xác minh mã xác thực...</p>
          </>
        );

      case "verified":
        return (
          <>
            <h3 className="fw-bold mb-3 text-success">Xác thực thành công</h3>
            <p className="fs-5">Tài khoản của bạn đã được xác minh. Bạn có thể đăng nhập ngay bây giờ.</p>
          </>
        );

      case "expired":
        return (
          <>
            <h3 className="fw-bold mb-3 text-warning">Token đã hết hạn</h3>
            <p className="fs-5">Liên kết xác thực không còn hợp lệ. Vui lòng yêu cầu gửi lại email xác thực.</p>
          </>
        );

      case "invalid":
        return (
          <>
            <h3 className="fw-bold mb-3 text-danger">Token không hợp lệ</h3>
            <p className="fs-5">
              Mã xác thực không hợp lệ hoặc đã được sử dụng. Vui lòng kiểm tra lại liên kết trong email.
            </p>
          </>
        );

      case "missing":
        return (
          <>
            <h3 className="fw-bold mb-3 text-danger">Không tìm thấy mã xác thực</h3>
            <p className="fs-5">Vui lòng kiểm tra lại liên kết xác thực trong email của bạn.</p>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="d-flex flex-column justify-content-center align-items-center py-5 text-center px-3">
      {renderContent()}
    </div>
  );
}
