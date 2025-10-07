"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Modal,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert
} from "@mui/material";
import SendRequest from "@muahub/utils/SendRequest";
// import PageContainer from "../components/container/PageContainer";
import { useApp } from "@muahub/app/contexts/AppContext";
import { formatCurrency } from "@muahub/utils/Main";
import toast from "react-hot-toast";
import { ROLE_MANAGER } from "@muahub/constants/System";
import { ACCOUNT_NO, ACQ_ID, WEB_NAME } from "@muahub/constants/MainContent";
import { v4 as uuidv4 } from "uuid";

const WebsitePaymentPage = () => {
  const { currentUser } = useApp();
  const [loading, setLoading] = useState(false);
  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [selectedPaymentType, setSelectedPaymentType] = useState("");
  const [paymentQrCode, setPaymentQrCode] = useState("");
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
      if (res.data) {
        setCurrentPlan(res.data.payment_type);
        setCurrentPaymentAmount(res.data.payment_amount || 0);
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  }, []);

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

  const generatePaymentQR = async (amount, uuid) => {
    const content = uuid;

    const payload = {
      accountNo: ACCOUNT_NO,
      accountName: `${WEB_NAME} Thanh toán`,
      acqId: ACQ_ID,
      amount: amount,
      addInfo: content,
      format: "text",
      template: "compact2"
    };

    try {
      const res = await fetch("https://api.vietqr.io/v2/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      setPaymentQrCode(data.data.qrDataURL);
    } catch (error) {
      toast.error("Không thể tạo mã QR");
    }
  };

  const handleSelectPlan = async (paymentType) => {
    setSelectedPaymentType(paymentType);

    if (paymentType === "revenue") {
      // Chọn gói thu theo doanh thu - không cần thanh toán
      handleConfirmPayment(paymentType);
    } else {
      // Mở modal thanh toán cho các gói trả phí
      setOpenPaymentModal(true);
      let uuid = uuidv4(); // Tạo UUID cho đơn hàng
      uuid = uuid.replace(/-/g, ""); // Loại bỏ dấu gạch ngang để sử dụng trong nội dung
      generatePaymentQR(paymentTypes[paymentType].amount, uuid);

      setTimeout(() => {
        const intervalId = setInterval(async () => {
          const resPayment = await SendRequest("get", `/api/webhooks`);
          let paymentDone = false;
          if (resPayment.payload) {
            resPayment.payload.forEach((item) => {
              if (item.content.includes(`dat coc ${uuid}`)) {
                paymentDone = true;
              }
            });
          }
          // if (!paymentDone) return;
          // Cập nhật state với trạng thái đã xác nhận
          handleConfirmPayment(paymentType);
          clearInterval(intervalId); // Stop polling when success
        }, 1500);
      }, 5000); // Simulate loading
    }
  };

  const handleConfirmPayment = async (paymentType = selectedPaymentType) => {
    try {
      if (paymentType !== "revenue") {
        // Tạo bản ghi thanh toán cho các gói trả phí
        await SendRequest("POST", "/api/website-payments", {
          ownerId: currentUser._id,
          payment_type: paymentType,
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
      toast.error("Có lỗi xảy ra khi gửi yêu cầu thanh toán");
    }
  };

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

  const renderStatusChip = (status) => {
    const statusColors = {
      "Đang hoạt động": "success",
      "Chờ xác nhận": "warning",
      "Đã hủy": "error"
    };

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
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body1">
            Gói hiện tại: <strong>{paymentTypes[currentPlan]?.label}</strong>
          </Typography>
          <Typography variant="body1" sx={{ mt: 1 }}>
            Số tiền phải trả: <strong>{formatCurrency(currentPaymentAmount)}</strong>
          </Typography>
        </Alert>
      )}

      {/* Lựa chọn gói thanh toán */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Chọn gói thanh toán
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {Object.entries(paymentTypes).map(([key, plan]) => (
          <Grid item xs={12} md={6} lg={3} key={key}>
            <Card
              sx={{
                height: "100%",
                position: "relative",
                border: currentPlan === key ? 2 : 1,
                borderColor: currentPlan === key ? "primary.main" : "grey.300",
                cursor: currentPlan === key ? "default" : "pointer",
                borderRadius: 2,
                transition: "all .2s ease",
                '&:hover': {
                  transform: currentPlan === key ? 'none' : 'translateY(-2px)',
                  boxShadow: 6,
                  backgroundColor: key === 'revenue' ? '#FFF1EF' : 'inherit'
                }
              }}
              onClick={() => currentPlan !== key && handleSelectPlan(key)}
            >
              {plan.popular && (
                <Chip label="Phổ biến" color="secondary" size="small" sx={{ position: "absolute", top: 8, right: 8 }} />
              )}

              <CardContent>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    fontWeight: 700,
                    color:
                      key === 'revenue'
                        ? '#ff5c95ff'
                        : key === 'monthly_3'
                        ? '#ff5c95ff'
                        : key === 'monthly_6'
                        ? 'var(--mui-palette-info-main, #0288d1)'
                        : 'var(--mui-palette-success-main, #2e7d32)'
                  }}
                >
                  {plan.label}
                </Typography>

                <Typography variant="h4" color="text.primary" gutterBottom sx={{ fontWeight: 800 }}>
                  {plan.amount === 0 ? "Miễn phí" : formatCurrency(plan.amount)}
                </Typography>

                <Typography variant="body2" color="text.secondary" paragraph>
                  {plan.description}
                </Typography>

                {/* Hiển thị thông tin số tiền sẽ cập nhật */}
                <Typography variant="body2" color="info.main" sx={{ mb: 2, fontStyle: "italic" }}>
                  Số tiền phải trả: {formatCurrency(plan.amount)}
                </Typography>

                <Button
                  variant={currentPlan === key ? "outlined" : "contained"}
                  color={plan.color}
                  fullWidth
                  disabled={currentPlan === key}
                  sx={{
                    height: 48,
                    py: 1.25,
                    borderRadius: 2,
                    fontWeight: 600,
                    ...(currentPlan !== key
                      ? { bgcolor: '#ff5c95ff', '&:hover': { bgcolor: '#d81b60' } }
                      : {})
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (currentPlan !== key) {
                      handleSelectPlan(key);
                    }
                  }}
                >
                  {currentPlan === key ? "Gói hiện tại" : "Chọn gói này"}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Gói đang sử dụng
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="30vh">
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table sx={{ '& tbody tr:hover': { backgroundColor: '#FFF1EF' } }}>
            <TableHead>
              <TableRow>
                <TableCell>Loại gói</TableCell>
                <TableCell>Số tiền</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Hạn sử dụng</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentUser?.payment_amount?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body2" color="text.secondary">
                      Chưa chọn gói thanh toán nào
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow key={1}>
                  <TableCell>{renderPaymentTypeChip(currentUser.payment_type)}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {formatCurrency(currentUser.payment_amount)}
                    </Typography>
                  </TableCell>
                  <TableCell>{renderStatusChip("Đang hoạt động")}</TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {currentUser.payment_expiry
                        ? new Date(currentUser.payment_expiry).toLocaleDateString("vi-VN")
                        : "Không xác định"}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Lịch sử thanh toán */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Lịch sử thanh toán
      </Typography>

      <TableContainer component={Paper}>
        <Table sx={{ '& tbody tr:hover': { backgroundColor: '#FFF1EF' } }}>
          <TableHead>
            <TableRow>
              <TableCell>Ngày thanh toán</TableCell>
              <TableCell>Loại gói</TableCell>
              <TableCell>Số tiền</TableCell>
              <TableCell>Mô tả</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paymentHistory?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography variant="body2" color="text.secondary">
                    Chưa có lịch sử thanh toán nào
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paymentHistory
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((history, index) => (
                  <TableRow key={index}>
                    <TableCell>{convertDateTime(history.date)}</TableCell>
                    <TableCell>{renderPaymentTypeChip(history.payment_type)}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {formatCurrency(history.amount)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{history.description}</Typography>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal thanh toán */}
      <Modal open={openPaymentModal} onClose={() => setOpenPaymentModal(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            p: 4,
            borderRadius: 2,
            boxShadow: 24,
            minWidth: 400,
            maxWidth: 500
          }}
        >
          <Typography variant="h6" gutterBottom>
            Thanh toán {paymentTypes[selectedPaymentType]?.label}
          </Typography>

          <Typography variant="body1" gutterBottom>
            Số tiền cần thanh toán:{" "}
            <Typography component="span" variant="h6" color="primary">
              {formatCurrency(paymentTypes[selectedPaymentType]?.amount)}
            </Typography>
          </Typography>

          <Typography variant="body2" color="text.secondary" gutterBottom>
            Vui lòng quét mã QR bên dưới để thanh toán
          </Typography>

          <Box display="flex" justifyContent="center" my={3}>
            {paymentQrCode ? (
              <img src={paymentQrCode} alt="Payment QR Code" style={{ maxWidth: "300px", width: "100%" }} />
            ) : (
              <CircularProgress />
            )}
          </Box>

          <Alert severity="warning" sx={{ mb: 2 }}>
            Sau khi thanh toán, vui lòng nhấn "Xác nhận đã thanh toán" để admin xử lý.
          </Alert>

          <Box display="flex" justifyContent="space-between" gap={2}>
            <Button
              variant="outlined"
              onClick={() => {
                setOpenPaymentModal(false);
                setPaymentQrCode("");
                setSelectedPaymentType("");
              }}
              fullWidth
            >
              Hủy
            </Button>
            {/* <Button variant="contained" color="primary" onClick={() => handleConfirmPayment()} fullWidth>
              Xác nhận đã thanh toán
            </Button> */}
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

export default WebsitePaymentPage;
