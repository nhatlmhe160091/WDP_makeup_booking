"use client";

import { useCallback, useEffect, useState } from "react";
import { TextField, MenuItem } from "@mui/material";
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
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState(""); // "" | "coc" | "goi"
  const itemsPerPage = 10;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await SendRequest("GET", "/api/webhooks/history", {});
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

  // Hàm xác định type giao dịch
  const getType = (desc) => {
    if (!desc) return "goi";
    return desc.toLowerCase().includes("dat coc") ? "coc" : "goi";
  };

  // Lọc theo search và type
  const filteredTransactions = transactions.filter((transaction) => {
    const desc = transaction.data?.description || "";
    const matchesSearch =
      search === "" ||
      desc.toLowerCase().includes(search.toLowerCase()) ||
      transaction.data?.accountNumber?.toString().includes(search) ||
      transaction.data?.reference?.toString().includes(search);
    const matchesType =
      typeFilter === "" || getType(desc) === typeFilter;
    return matchesSearch && matchesType;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
// console.log(" transactions", transactions);
  return (
    <PageContainer title="Lịch sử giao dịch" description="Danh sách các giao dịch trong hệ thống">
      <Box display="flex" flexWrap="wrap" justifyContent="space-between" alignItems="center" mb={3} gap={2}>
        <Typography variant="h4">Lịch sử giao dịch</Typography>
        <Box display="flex" gap={2} flexWrap="wrap">
          <TextField
            label="Tìm kiếm"
            size="small"
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Nội dung, số tài khoản, mã giao dịch..."
            sx={{ minWidth: 200 }}
          />
          <TextField
            label="Loại giao dịch"
            size="small"
            select
            value={typeFilter}
            onChange={e => { setTypeFilter(e.target.value); setCurrentPage(1); }}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="">Tất cả</MenuItem>
            <MenuItem value="coc">Thanh toán cọc</MenuItem>
            <MenuItem value="goi">Thanh toán gói</MenuItem>
          </TextField>
          <Button variant="contained" color="primary" onClick={handleReload}>
            Tải lại
          </Button>
        </Box>
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
                {currentItems.map((transaction) => {
                  const desc = transaction.data?.description || "";
                  const type = getType(desc);
                  return (
                    <TableRow key={transaction._id}>
                      <TableCell>BIDV</TableCell>
                      <TableCell>{convertDateTime(transaction.data?.transactionDateTime)}</TableCell>
                      <TableCell>{transaction.data?.accountNumber}</TableCell>
                      <TableCell>{transaction.data?.amount?.toLocaleString()} VND</TableCell>
                      <TableCell>{desc}</TableCell>
                      <TableCell>{transaction.data?.reference}</TableCell>
                      <TableCell style={{ color: type === "coc" ? "orange" : "green" }}>
                        {type === "coc" ? "Thanh toán cọc" : "Thanh toán gói"}
                      </TableCell>
                    </TableRow>
                  );
                })}
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
