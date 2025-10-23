import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper, Typography } from "@mui/material";

const PaymentHistoryTable = ({ paymentHistory, renderPaymentTypeChip, formatCurrency, convertDateTime }) => (
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
);

export default PaymentHistoryTable;
