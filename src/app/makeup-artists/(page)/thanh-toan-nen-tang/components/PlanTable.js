import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper, Typography, Box, CircularProgress } from "@mui/material";

const PlanTable = ({ loading, currentUser, renderPaymentTypeChip, renderStatusChip, formatCurrency }) => (
  loading ? (
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
  )
);

export default PlanTable;
