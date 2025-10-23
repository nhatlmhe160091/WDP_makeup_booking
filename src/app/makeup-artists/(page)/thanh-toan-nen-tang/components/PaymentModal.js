
import { ACCOUNT_NO, ACQ_ID, WEB_NAME } from "@muahub/constants/MainContent";
import {
  Modal,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert
} from "@mui/material";
const PaymentModal = ({
  open,
  onClose,
  onConfirm,
  paymentType,
  paymentTypes,
  paymentQrCode,
  payosInfo,
  payosQr,
  paymentMethod,
  formatCurrency
}) => {
  console.log('PaymentModal debug:', {
    payosInfo,
    payosQr,
    paymentMethod,
    paymentQrCode
  });
  return (
  <Modal open={open} onClose={onClose}>
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
        Thanh toán {paymentTypes[paymentType]?.label}
      </Typography>
      <Typography variant="body1" gutterBottom>
        Số tiền cần thanh toán: {" "}
        <Typography component="span" variant="h6" color="primary">
          {formatCurrency(paymentTypes[paymentType]?.amount)}
        </Typography>
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Vui lòng quét mã QR bên dưới để thanh toán
      </Typography>
      <Box display="flex" justifyContent="center" my={3}>
        {paymentMethod === "payos" && payosQr ? (
          <img
            src={`https://img.vietqr.io/image/${ACQ_ID}-${payosInfo?.accountNumber || ''}-compact2.png?amount=2000&addInfo=${encodeURIComponent(payosInfo?.description || '')}&accountName=${encodeURIComponent(payosInfo?.accountName || '')}`}
            alt="Mã QR PayOS"
            className="img-fluid rounded border"
            style={{ maxWidth: 250 }}
          />
        ) : paymentQrCode ? (
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
          onClick={onClose}
          fullWidth
        >
          Hủy
        </Button>
        <Button variant="contained" color="primary" onClick={onConfirm} fullWidth>
          Xác nhận đã thanh toán
        </Button>
      </Box>
    </Box>
  </Modal>
  );
}

export default PaymentModal;
