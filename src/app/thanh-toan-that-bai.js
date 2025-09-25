"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function PaymentFailed() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case "07":
        return "Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).";
      case "09":
        return "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.";
      case "10":
        return "Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần";
      case "11":
        return "Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.";
      case "12":
        return "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.";
      case "13":
        return "Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP).";
      case "24":
        return "Giao dịch không thành công do: Khách hàng hủy giao dịch";
      case "51":
        return "Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.";
      case "65":
        return "Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.";
      case "75":
        return "Ngân hàng thanh toán đang bảo trì.";
      case "79":
        return "Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định.";
      default:
        return "Giao dịch không thành công. Vui lòng thử lại sau.";
    }
  };

  return (
    <div className="container py-5">
      <div className="text-center">
        <i className="fa fa-times-circle text-danger" style={{ fontSize: "5rem" }}></i>
        <h2 className="mt-4">Thanh toán thất bại!</h2>
        <p className="lead text-danger">
          {error ? getErrorMessage(error) : "Đã xảy ra lỗi trong quá trình thanh toán."}
        </p>

        <div className="mt-4">
          <Link href="/" className="btn btn-primary me-3">
            Thử lại
          </Link>
          <Link href="/lien-he" className="btn btn-outline-primary">
            Liên hệ hỗ trợ
          </Link>
        </div>
      </div>
    </div>
  );
}
