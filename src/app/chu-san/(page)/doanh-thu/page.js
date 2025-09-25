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
  Paper
} from "@mui/material";
import SendRequest from "@quanlysanbong/utils/SendRequest";
import PageContainer from "../../components/container/PageContainer";
import { useApp } from "@quanlysanbong/app/contexts/AppContext";
import { convertDate } from "@quanlysanbong/utils/Main";
import { ROLE_MANAGER } from "@quanlysanbong/constants/System";

const RevenueDetailPage = () => {
  const { currentUser } = useApp();
  const [revenue, setRevenue] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await SendRequest("GET", "/api/orders/revenue", {
        ownerId: currentUser.role === ROLE_MANAGER.SALE ? currentUser._id : ""
      });
      if (res.payload) {
        setRevenue(res.payload);
      }
    } catch (error) {
      console.error("Error fetching revenue details:", error);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (Object.keys(currentUser).length === 0) return;
    fetchData();
  }, [currentUser, fetchData]);

  const handleReload = () => {
    fetchData();
  };

  return (
    <PageContainer title="Chi tiết doanh thu" description="Chi tiết doanh thu theo ngày">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Chi tiết doanh thu</Typography>
        <Button variant="contained" color="primary" onClick={handleReload}>
          Tải lại
        </Button>
      </Box>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Ngày</TableCell>
                <TableCell>Đặt cọc</TableCell>
                <TableCell>Còn lại</TableCell>
                <TableCell>Số đơn</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(revenue).map(([date, data]) => (
                <TableRow key={date}>
                  <TableCell>{convertDate(date)}</TableCell>
                  <TableCell>{data.deposit.toLocaleString()} VND</TableCell>
                  <TableCell>{data.remaining.toLocaleString()} VND</TableCell>
                  <TableCell>{data.orderCount} Đơn</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </PageContainer>
  );
};

export default RevenueDetailPage;
