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
  Pagination
} from "@mui/material";
import SendRequest from "@muahub/utils/SendRequest";
import PageContainer from "../../components/container/PageContainer";
import { convertDateTime } from "@muahub/utils/Main";

const TransactionHistoryPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await SendRequest("GET", "/api/webhooks", {});
      if (res.payload && res.payload.length > 0) {
        // console.log("Fetched transactions:", res.payload);
        setTransactions(res.payload);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleReload = () => {
    fetchData();
  };

  const handleChangePage = (event, value) => {
    setCurrentPage(value);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = transactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(transactions.length / itemsPerPage);
console.log(" transactions", transactions);
  return (
    <PageContainer title="Lịch sử giao dịch" description="Danh sách các giao dịch trong hệ thống">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Lịch sử giao dịch</Typography>
        <Button variant="contained" color="primary" onClick={handleReload}>
          Tải lại
        </Button>
      </Box>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Ngân hàng</TableCell>
                  <TableCell>Thời gian giao dịch</TableCell>
                  <TableCell>Số tài khoản ảo</TableCell>
                  <TableCell>Số tiền</TableCell>
                  <TableCell>Nội dung</TableCell>
                  <TableCell>Mã giao dịch</TableCell>
                  <TableCell>Loại giao dịch</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentItems.map((transaction) => (
                  <TableRow key={transaction._id}>
                    <TableCell>BIDV</TableCell>
                    <TableCell>{convertDateTime(transaction.data.transactionDateTime)}</TableCell>
                    <TableCell>{transaction.data.accountNumber}</TableCell>
                    <TableCell>{transaction.data.amount?.toLocaleString()} VND</TableCell>
                    <TableCell>{transaction.data.description}</TableCell>
                    <TableCell>{transaction.data.reference}</TableCell>
                    <TableCell style={{ color: "green" }}>
                      Nạp
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box display="flex" justifyContent="center" mt={3}>
            <Pagination count={totalPages} page={currentPage} onChange={handleChangePage} color="primary" />
          </Box>
        </>
      )}
    </PageContainer>
  );
};

export default TransactionHistoryPage;
