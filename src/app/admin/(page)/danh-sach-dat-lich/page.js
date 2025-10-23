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
      const res = await SendRequest("GET", "/api/orders/admin", {
        ownerId: currentUser.role === ROLE_MANAGER.MUA ? currentUser._id : ""
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

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      const res = await SendRequest("PUT", "/api/orders", {
        id: bookingId,
        status: newStatus
      });
      if (res.success) {
        // Tải lại dữ liệu sau khi cập nhật
        fetchData();
      }
    } catch (error) {
      console.error("Error updating booking status:", error);
    }
  };

   const adjustMongoDBTime = (mongoTime) => {
    return new Date(mongoTime); // MongoDB đã lưu ở UTC, Date() sẽ tự động chuyển sang giờ địa phương
   };


  // Hàm kiểm tra xem đã đủ 1 tiếng từ lúc tạo chưa
  const hasOneHourPassed = (createdAt) => {
    const createdTime = adjustMongoDBTime(createdAt).getTime();
    const currentTime = new Date().getTime();
    const oneHourInMs = 60 * 60 * 1000; // 1 tiếng tính bằng milliseconds
    return (currentTime - createdTime) >= oneHourInMs;
  };

  // Hàm tính thời gian còn lại
  const getRemainingTime = (createdAt) => {
    const createdTime = adjustMongoDBTime(createdAt).getTime();
    const currentTime = new Date().getTime();
    const oneHourInMs = 60 * 60 * 1000;
    const remainingMs = oneHourInMs - (currentTime - createdTime);
    
    if (remainingMs <= 0) return null;
    
    const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));
    return remainingMinutes;
  };

  // Hàm hiển thị nút dựa vào trạng thái
  const renderActionButtons = (booking) => {
    if (booking.status === "pending") {
      // Kiểm tra xem có phải đặt trong ngày không
      const bookingDate = new Date(booking.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      bookingDate.setHours(0, 0, 0, 0);
      const isToday = bookingDate.getTime() === today.getTime();

      // Nếu không phải đặt trong ngày, kiểm tra thời gian 1 tiếng
      if (!isToday && !hasOneHourPassed(booking.created_at)) {
        const remainingMinutes = getRemainingTime(booking.created_at);
        return (
          <Box>
            <Typography color="warning.main" sx={{ mb: 1 }}>
              Vui lòng đợi {remainingMinutes} phút nữa để xác nhận hoặc hủy
            </Typography>
            <Button
              variant="contained"
              color="success"
              size="small"
              sx={{ mr: 1 }}
              disabled
            >
              Xác nhận cọc
            </Button>
            <Button
              variant="contained"
              color="error"
              size="small"
              disabled
            >
              Hủy
            </Button>
          </Box>
        );
      }

      return (
        <>
          <Button
            variant="contained"
            color="success"
            size="small"
            sx={{ mr: 1 }}
            onClick={() => handleStatusChange(booking._id, "deposit_confirmed")}
          >
            Xác nhận cọc
          </Button>
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => handleStatusChange(booking._id, "cancelled")}
          >
            Hủy
          </Button>
        </>
      );
    } else if (booking.status === "deposit_confirmed") {
      return (
        <>
          <Button
            variant="contained"
            color="success"
            size="small"
            sx={{ mr: 1 }}
            onClick={() => handleStatusChange(booking._id, "confirmed")}
          >
            Xác nhận dịch vụ
          </Button>
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => handleStatusChange(booking._id, "cancelled")}
          >
            Hủy
          </Button>
        </>
      );
    } else if (booking.status === "confirmed") {
      return (
        <Typography color="success.main">
          Đã hoàn thành
        </Typography>
      );
    } else if (booking.status === "cancelled") {
      return (
        <Typography color="error">
          Đã hủy
        </Typography>
      );
    }
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
                <TableCell>Tên dịch vụ makeup</TableCell>
                <TableCell>Ngày</TableCell>
                <TableCell>Giờ</TableCell>
                <TableCell>Dịch vụ makeup</TableCell>
                <TableCell>Đặt cọc</TableCell>
                <TableCell>Còn lại</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Người đặt</TableCell>
                <TableCell>Thông tin</TableCell>
                <TableCell>Giờ đặt</TableCell>
                <TableCell>Thao tác</TableCell>
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
                  <TableCell>{booking.field} người</TableCell>
                  <TableCell>{booking.deposit.toLocaleString()} VND</TableCell>
                  <TableCell>{booking.remaining.toLocaleString()} VND</TableCell>
                  <TableCell>
                    {booking.status === "confirmed" && <Typography color="success.main">Đã xác nhận</Typography>}
                    {booking.status === "pending" && <Typography color="warning.main">Chờ xác nhận cọc</Typography>}
                    {booking.status === "deposit_confirmed" && <Typography color="info.main">Đã xác nhận cọc</Typography>}
                    {booking.status === "cancelled" && <Typography color="error">Đã hủy</Typography>}
                  </TableCell>
                  <TableCell>{booking.user.name}</TableCell>
                  <TableCell>
                    {booking.user.email}
                    <br />
                    {booking.user.phone}
                  </TableCell>
                  <TableCell>{convertDateTime(booking.created_at)}</TableCell>
                  <TableCell>{renderActionButtons(booking)}</TableCell>
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
