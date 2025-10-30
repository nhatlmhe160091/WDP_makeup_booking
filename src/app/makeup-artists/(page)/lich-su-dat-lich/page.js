"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from "@mui/material";
import SendRequest from "@muahub/utils/SendRequest";
import PageContainer from "../../components/container/PageContainer";
import { useApp } from "@muahub/app/contexts/AppContext";
import { convertDate, convertDateTime } from "@muahub/utils/Main";
import { ROLE_MANAGER } from "@muahub/constants/System";

const BookingHistoryPage = () => {
  const { currentUser } = useApp();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await SendRequest("GET", "/api/orders", {
        ownerId: currentUser.role === ROLE_MANAGER.SALE ? currentUser.id : ""
      });
      if (res.payload) {
        setBookings(res.payload);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
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

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = bookings.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(bookings.length / itemsPerPage);

  const handleChangePage = (event, value) => {
    setCurrentPage(value);
  };

  return (
    <PageContainer title="Lịch sử đặt dịch vụ makeup" description="Danh sách các dịch vụ makeup bạn đã đặt">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Lịch sử đặt dịch vụ makeup</Typography>
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
                <TableCell>Tên dịch vụ</TableCell>
                <TableCell>Ngày</TableCell>
                <TableCell>Giờ</TableCell>
                <TableCell>Gói dịch vụ</TableCell>
                <TableCell>Đặt cọc</TableCell>
                <TableCell>Còn lại</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Người đặt</TableCell>
                <TableCell>Thông tin</TableCell>
                <TableCell>Giờ đặt</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentItems.map((booking) => (
                <TableRow key={booking._id}>
                  <TableCell>
                    <Typography variant="h6">{booking.service.serviceName}</Typography>
                    <br />
                    {booking.service.locationDetail}, {booking.service.location}
                  </TableCell>
                  <TableCell>{convertDate(booking.date)}</TableCell>
                  <TableCell>{booking.time}</TableCell>
                  <TableCell>{booking.field}</TableCell>
                  <TableCell>{booking.deposit.toLocaleString()} VND</TableCell>
                  <TableCell>{booking.remaining.toLocaleString()} VND</TableCell>
                  <TableCell style={{
                    color:
                      booking.status === "confirmed" ? "green" :
                      booking.status === "deposit_confirmed" ? "#ff9800" :
                      booking.status === "pending" ? "#1976d2" :
                      booking.status === "cancel" ? "#b71c1c" :
                      "#888"
                  }}>
                    {booking.status === "confirmed" && "Đã xác nhận hoàn tất"}
                    {booking.status === "deposit_confirmed" && "Đã xác nhận cọc"}
                    {booking.status === "pending" && "Chờ xác nhận cọc"}
                    {booking.status === "cancel" && "Đã hủy"}
                    {!["confirmed", "deposit_confirmed", "pending", "cancel"].includes(booking.status) && booking.status}
                  </TableCell>
                  <TableCell>{booking.user.name}</TableCell>
                  <TableCell>
                    {booking.user.email}
                    <br />
                    {booking.user.phone}
                  </TableCell>
                  <TableCell>{convertDateTime(booking.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Box display="flex" justifyContent="center" mt={3}>
        <Pagination count={totalPages} page={currentPage} onChange={handleChangePage} color="primary" />
      </Box>
    </PageContainer>
  );
};

export default BookingHistoryPage;