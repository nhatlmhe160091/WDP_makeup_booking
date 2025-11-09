"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  // const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    if (orderId) {
      // Có thể fetch chi tiết order nếu cần
    }
  }, [orderId]);

  return (
    <div className="container py-5">
      <div className="text-center">
        <i className="fa fa-check-circle text-success" style={{ fontSize: "5rem" }}></i>
        <h2 className="mt-4">Thanh toán thành công!</h2>
        <p className="lead">Lịch hẹn make up của bạn đã được xác nhận.</p>

        {orderId && (
          <div className="my-4">
            <p>
              <strong>Mã đơn hàng:</strong> {orderId}
            </p>
          </div>
        )}

        <div className="mt-4">
          <Link href={orderId ? `/trang-ca-nhan?orderId=${orderId}` : "/trang-ca-nhan"} className="btn btn-primary me-3">
            Xem lịch sử đặt lịch
          </Link>
          <Link href="/" className="btn btn-outline-primary">
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
