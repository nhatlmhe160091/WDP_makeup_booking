import { Alert, Typography } from "@mui/material";

const CurrentPlanAlert = ({ currentPlan, paymentTypes, currentPaymentAmount, formatCurrency }) => (
  <Alert severity="info" sx={{ mb: 3 }}>
    <Typography variant="body1">
      Gói hiện tại: <strong>{paymentTypes[currentPlan]?.label}</strong>
    </Typography>
    <Typography variant="body1" sx={{ mt: 1 }}>
      Số tiền phải trả: <strong>{formatCurrency(currentPaymentAmount)}</strong>
    </Typography>
  </Alert>
);

export default CurrentPlanAlert;
