"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Chip
} from "@mui/material";
import PlanCard from "./components/PlanCard";
import CurrentPlanAlert from "./components/CurrentPlanAlert";
import PlanTable from "./components/PlanTable";
import PaymentHistoryTable from "./components/PaymentHistoryTable";
import PaymentModal from "./components/PaymentModal";
import SendRequest from "@muahub/utils/SendRequest";
// import PageContainer from "../components/container/PageContainer";
import { useApp } from "@muahub/app/contexts/AppContext";
import { formatCurrency } from "@muahub/utils/Main";
import toast from "react-hot-toast";
// import { ROLE_MANAGER } from "@muahub/constants/System";
// import { ACCOUNT_NO, ACQ_ID, WEB_NAME } from "@muahub/constants/MainContent";

import { v4 as uuidv4 } from "uuid";

const WebsitePaymentPage = () => {
  const { currentUser } = useApp();
  const [loading, setLoading] = useState(false);
  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [selectedPaymentType, setSelectedPaymentType] = useState("");
  const [paymentQrCode, setPaymentQrCode] = useState("");
  // PayOS integration
  const [payosInfo, setPayosInfo] = useState(null);
  const [payosQr, setPayosQr] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [currentOrderCode, setCurrentOrderCode] = useState(null);
  const [websitePayments, setWebsitePayments] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [currentPaymentAmount, setCurrentPaymentAmount] = useState(0);
  const [paymentHistory, setPaymentHistory] = useState([]);

  const paymentTypes = {
    revenue: {
      label: "Thu theo doanh thu",
      amount: 0,
      description: "Không có phí cố định - Thu % theo doanh thu",
      color: "primary",
      popular: false
    },
    monthly_3: {
      label: "Gói 3 tháng",
      amount: 3000000,
      description: "3,000,000 VNĐ cho 3 tháng sử dụng",
      color: "warning",
      popular: false
    },
    monthly_6: {
      label: "Gói 6 tháng",
      amount: 5500000,
      description: "5,500,000 VNĐ cho 6 tháng sử dụng",
      color: "info",
      popular: true
    },
    yearly: {
      label: "Gói 1 năm",
      amount: 10000000,
      description: "10,000,000 VNĐ cho 1 năm sử dụng - Tiết kiệm nhất",
      color: "success",
      popular: false
    }
  };
  // Thứ tự ưu tiên các gói
  const planPriority = {
    revenue: 0,
    monthly_3: 1,
    monthly_6: 2,
    yearly: 3
  };
  const fetchWebsitePayments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await SendRequest("GET", "/api/website-payments", {
        ownerId: currentUser._id
      });
      if (res.payload) {
        setWebsitePayments(res.payload);
      }
    } catch (error) {
      console.error("Error fetching website payments:", error);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const res = await SendRequest("GET", "/api/users/me");
      if (res.payload) {
        setCurrentPlan(res.payload.payment_type);
      
        setCurrentPaymentAmount(res.data.payment_amount || 0);
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  }, []);
console.log('Current Plan:', currentPlan);
console.log('Current Payment Amount:', currentPaymentAmount);
  // Thêm hàm fetch lịch sử thanh toán
  const fetchPaymentHistory = useCallback(async () => {
    try {
      const res = await SendRequest("GET", "/api/users/me");
      if (res) {
        setPaymentHistory(res.payload?.payment_history || []);
      }
    } catch (error) {
      console.error("Error fetching payment history:", error);
    }
  }, []);

  useEffect(() => {
    if (Object.keys(currentUser).length === 0) return;
    fetchWebsitePayments();
    fetchCurrentUser();
    fetchPaymentHistory();
  }, [currentUser, fetchWebsitePayments, fetchCurrentUser, fetchPaymentHistory]);

  // PayOS: generate payment link and QR
  const generatePayosLink = async (amount, content, orderCode) => {
    let safeContent = content;
    if (safeContent.length > 25) safeContent = safeContent.slice(0, 25);
    try {
      const res = await fetch("/api/payos-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderCode: orderCode,
          amount: 2000,
          description: safeContent,
          cancelUrl: window.location.origin + "/thanh-toan-that-bai",
          returnUrl: window.location.origin + "/thanh-toan-thanh-cong"
        })
      });
      const raw = await res.json();
      const data = raw.data || raw;
      setPayosInfo(data);
      setPayosQr(data.qrCode || "");
      setPaymentQrCode("");
    } catch (error) {
      toast.error("Không thể tạo mã QR PayOS");
    }
  };

  // Lưu uuid cho đơn hàng vào state để dùng khi xác nhận
  const [currentPaymentUUID, setCurrentPaymentUUID] = useState("");

  const handleSelectPlan = async (paymentType) => {
    setSelectedPaymentType(paymentType);
    if (paymentType === "revenue") {
      setPaymentMethod("");
      handleConfirmPayment(paymentType);
    } else {
      setOpenPaymentModal(true);
      setPaymentMethod("payos");
      let uuid = uuidv4();
      uuid = uuid.replace(/-/g, "");
      setCurrentPaymentUUID(uuid);
      // Tạo orderCode và lưu lại để dùng khi polling
      const orderCode = Date.now();
      setCurrentOrderCode(orderCode);
      await generatePayosLink(paymentTypes[paymentType].amount, uuid, orderCode);
    }
  };

  const handleConfirmPayment = async (paymentType = selectedPaymentType) => {
    try {
      if (paymentType !== "revenue") {
        // Tạo bản ghi thanh toán cho các gói trả phí
        await SendRequest("POST", "/api/website-payments", {
          ownerId: currentUser._id,
          payment_package: paymentType,
          amount: paymentTypes[paymentType].amount,
          status: "PENDING"
        });
      }

      // Tạo object lịch sử thanh toán
      const paymentHistoryRecord = {
        date: new Date(),
        payment_type: paymentType,
        amount: paymentTypes[paymentType].amount,
        description: `Thanh toán ${paymentTypes[paymentType].label}`,
        status: paymentType === "revenue" ? "Đang hoạt động" : "Chờ xác nhận",
        transaction_id: `PAY_${Date.now()}_${currentUser._id.slice(-6)}` // Tạo mã giao dịch unique
      };

      // Cập nhật payment_type, payment_amount và thêm lịch sử thanh toán cho user
      // Tính toán ngày hết hạn dựa trên loại gói
      let expiryDate = null;
      if (paymentType === "monthly_3") {
        expiryDate = new Date(Date.now() + 3 * 30 * 24 * 60 * 60 * 1000); // 3 tháng ~ 90 ngày
      } else if (paymentType === "monthly_6") {
        expiryDate = new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000); // 6 tháng ~ 180 ngày
      } else if (paymentType === "yearly") {
        expiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 năm
      }

      await SendRequest("PUT", "/api/users", {
        id: currentUser._id,
        payment_type: paymentType,
        payment_amount: paymentTypes[paymentType].amount,
        payment_history: paymentHistoryRecord,
        payment_expiry: paymentType === "revenue" ? null : expiryDate
      });

      if (paymentType === "revenue") {
        toast.success("Đã chọn gói thu theo doanh thu thành công!");
      } else {
        toast.success("Yêu cầu thanh toán đã được gửi, chờ admin xác nhận!");
      }

      setOpenPaymentModal(false);
      setPaymentQrCode("");
      setSelectedPaymentType("");
      setTimeout(() => {
        window.location.reload(); // Tải lại trang để cập nhật giao diện
      }, 3000); // Đợi 3 giây để cập nhật giao diện
      // fetchWebsitePayments();
      // fetchCurrentUser();
      // fetchPaymentHistory(); // Thêm hàm fetch lịch sử thanh toán
    } catch (error) {
      console.error("Error confirming payment:", error);
      toast.error("Có lỗi xảy ra khi gửi yêu cầu thanh toán");
    }
  };


  // Render chip for payment type
  const renderPaymentTypeChip = (type) => {
    const colors = {
      revenue: "primary",
      monthly_6: "info",
      yearly: "success"
    };
    if (type === "monthly_3") {
      return (
        <Chip
          label={paymentTypes[type]?.label || "Chưa xác định"}
          size="large"
          sx={{ bgcolor: "#ff5c95ff", color: "#fff" }}
        />
      );
    }
    return <Chip label={paymentTypes[type]?.label || "Chưa xác định"} color={colors[type] || "default"} size="large" />;
  };

  // Render chip for status
  const renderStatusChip = (status) => {
    return <Chip label={status} color={"success"} size="large" variant="outlined" />;
  };

  const convertDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div>
      <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
          Thanh toán cho nền tảng
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Chọn gói phù hợp để kích hoạt đầy đủ tính năng quản trị
        </Typography>
      </Box>

      {/* Hiển thị gói hiện tại và số tiền phải trả */}
      {currentPlan && (
        <CurrentPlanAlert
          currentPlan={currentPlan}
          paymentTypes={paymentTypes}
          currentPaymentAmount={currentPaymentAmount}
          formatCurrency={formatCurrency}
        />
      )}

      {/* Lựa chọn gói thanh toán */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Chọn gói thanh toán
      </Typography>
      <Grid container spacing={3}>
        {Object.keys(paymentTypes)
          .sort((a, b) => planPriority[a] - planPriority[b])
          .map((key) => {
            const currentLevel = planPriority[currentPlan];
            const thisLevel = planPriority[key];
            const isLower = currentLevel !== undefined && thisLevel < currentLevel;
            return (
              <Grid item xs={12} sm={6} md={3} key={key}>
                <PlanCard
                  paymentType={key}
                  details={paymentTypes[key]}
                  isCurrentPlan={currentPlan === key}
                  onSelect={() => (!isLower && currentPlan !== key) && handleSelectPlan(key)}
                  disabled={isLower}
                  sx={isLower ? { opacity: 0.5, pointerEvents: 'none', filter: 'grayscale(1)' } : {}}
                />
              </Grid>
            );
          })}
      </Grid>

      {/* Bảng gói đang sử dụng */}

      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Gói đang sử dụng
      </Typography>

      <PlanTable
        loading={loading}
        currentUser={currentUser}
        renderPaymentTypeChip={renderPaymentTypeChip}
        renderStatusChip={renderStatusChip}
        formatCurrency={formatCurrency}
      />

      {/* Lịch sử thanh toán */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Lịch sử thanh toán
      </Typography>

      <PaymentHistoryTable
        paymentHistory={paymentHistory}
        renderPaymentTypeChip={renderPaymentTypeChip}
        formatCurrency={formatCurrency}
        convertDateTime={convertDateTime}
      />

      {/* Modal thanh toán */}
      <PaymentModal
        open={openPaymentModal}
        onClose={() => {
          setOpenPaymentModal(false);
          setPaymentQrCode("");
          setSelectedPaymentType("");
          setCurrentPaymentUUID("");
          setPayosInfo(null);
          setPayosQr("");
          setPaymentMethod("");
          setCurrentOrderCode(null);
        }}
        paymentType={selectedPaymentType}
        paymentTypes={paymentTypes}
        paymentQrCode={paymentQrCode}
        payosInfo={payosInfo}
        payosQr={payosQr}
        paymentMethod={paymentMethod}
        formatCurrency={formatCurrency}
        onConfirm={async () => {
          // Khi ấn xác nhận mới bắt đầu polling kiểm tra thanh toán
          if (!currentPaymentUUID) return;
          let pollingCount = 0;
          const maxPolling = 40; // tối đa 40 lần (60s)
          const orderCode = paymentMethod === "payos" ? currentOrderCode : null;
          const uuid = currentPaymentUUID;
          const intervalId = setInterval(async () => {
            pollingCount++;
            const resPayment = await SendRequest("get", `/api/webhooks`);
            let paymentDone = false;
            if (resPayment.payload) {
              resPayment.payload.forEach((item) => {
                if (paymentMethod === "vietqr") {
                  if (item.content && item.content.includes(`dat coc ${uuid}`)) {
                    paymentDone = true;
                  }
                } else if (paymentMethod === "payos") {
                  if (item.data) {
                    // Log để so sánh orderCode
                    console.log('[PAYOS] So sánh:', {
                      itemOrderCode: item.data.orderCode,
                      pollingOrderCode: orderCode,
                      equal: String(item.data.orderCode) === String(orderCode)
                    });
                    if (String(item.data.orderCode) === String(orderCode)) {
                      console.log('[PAYOS] Payment confirmed for orderCode:', orderCode);
                      paymentDone = true;
                    }
                  }
                }
              });
            }
            if (paymentDone) {
              clearInterval(intervalId);
              handleConfirmPayment(selectedPaymentType);
            } else if (pollingCount >= maxPolling) {
              clearInterval(intervalId);
              toast.error("Không tìm thấy giao dịch thanh toán. Vui lòng thử lại hoặc liên hệ hỗ trợ.");
            }
          }, 1500);
        }}
      />
    </div>
  );
};

export default WebsitePaymentPage;
