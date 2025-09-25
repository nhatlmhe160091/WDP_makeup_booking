"use client";

import { useCallback, useEffect, useState } from "react";
import { Box, Button, Typography, CircularProgress, Modal, Paper, Grid, Avatar, TextField } from "@mui/material";
import SendRequest from "@quanlysanbong/utils/SendRequest";
import PageContainer from "../../components/container/PageContainer";
import { useApp } from "@quanlysanbong/app/contexts/AppContext";
import { ROLE_MANAGER } from "@quanlysanbong/constants/System";

const TimelineHistoryPage = () => {
  const { currentUser } = useApp();
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [date, setDate] = useState("");
  const [stadiums, setStadiums] = useState([]);
  const [selectedBookings, setSelectedBookings] = useState([]);

  useEffect(() => {
    const today = new Date();
    setDate(today.toISOString().substr(0, 10));
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await SendRequest("GET", "/api/orders", {
        ownerId: currentUser.role === ROLE_MANAGER.SALE ? currentUser._id : "",
        date: date
      });
      if (res.payload) {
        setBookings(res.payload);
        setStadiums(res.payload.map((b) => b.stadium).filter((v, i, a) => a.findIndex((t) => t._id === v._id) === i));
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  }, [currentUser._id, currentUser.role, date]);

  useEffect(() => {
    if (Object.keys(currentUser).length === 0 || date === "") return;
    fetchData();
  }, [currentUser, date, fetchData]);

  const handleReload = () => {
    fetchData();
  };

  const handleBookingClick = (bookings) => {
    setSelectedBookings(bookings);
  };

  const handleCloseModal = () => {
    setSelectedBookings([]);
  };

  return (
    <PageContainer title="Lịch sử đặt dịch vụ" description="Danh sách các dịch vụ bạn đã đặt">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Trạng thái đặt dịch vụ</Typography>
        <Button variant="contained" color="primary" onClick={handleReload}>
          Tải lại
        </Button>
      </Box>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          {/* <input value={date} onChange={(e) => setDate(e.target.value)} type="date" style={{ marginBottom: 20 }} /> */}
          <TextField
            label="Chọn ngày"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            InputLabelProps={{
              shrink: true // Để label không bị che phủ khi có giá trị
            }}
            inputProps={{
              style: { padding: "10px" } // Tùy chỉnh padding cho input
            }}
            fullWidth // Chiều rộng đầy đủ
            variant="outlined" // Sử dụng variant outlined
            style={{ marginBottom: 20 }} // Thêm margin dưới
          />
          <Grid container spacing={3}>
            {stadiums.map((stadium) => (
              <Grid item xs={12} key={stadium._id}>
                <Paper elevation={3} style={{ padding: 20 }}>
                  <Typography variant="h6" gutterBottom>
                    {stadium.stadiumName}
                  </Typography>
                  <Grid container spacing={2}>
                    {Object.entries(stadium.fields).map(([fieldId, field]) => (
                      <Grid item xs={12} key={fieldId}>
                        <Typography variant="subtitle1" gutterBottom>
                          {field.name}
                        </Typography>
                        <Grid container spacing={1}>
                          {field.timeDetail.map((time) => {
                            const matchingBookings = bookings.filter(
                              (b) => b.time === time && b.field === fieldId && b.stadiumId === stadium._id
                            );
                            return (
                              <Grid item xs={12} sm={6} md={3} key={time}>
                                <Paper
                                  elevation={matchingBookings.length > 0 ? 3 : 1}
                                  onClick={() => matchingBookings.length > 0 && handleBookingClick(matchingBookings)}
                                  style={{
                                    padding: 10,
                                    background: matchingBookings.length > 0 ? "rgb(14 255 0)" : "#EEE",
                                    cursor: matchingBookings.length > 0 ? "pointer" : "default",
                                    transition: "background 0.3s ease"
                                  }}
                                  onMouseEnter={(e) => {
                                    if (matchingBookings.length > 0) {
                                      e.currentTarget.style.background = "rgb(31 203 2)";
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    if (matchingBookings.length > 0) {
                                      e.currentTarget.style.background = "rgb(14 255 0)";
                                    }
                                  }}
                                >
                                  <Typography>
                                    {time}{" "}
                                    {matchingBookings.length > 0
                                      ? ` - ${matchingBookings.length} người đặt`
                                      : " - Trống"}
                                  </Typography>
                                </Paper>
                              </Grid>
                            );
                          })}
                        </Grid>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
      <Modal open={selectedBookings.length > 0} onClose={handleCloseModal}>
        <Box
          style={{ padding: 20, background: "white", margin: "auto", marginTop: "10%", width: "50%", borderRadius: 8 }}
        >
          <Typography variant="h6" gutterBottom>
            Thông tin đặt dịch vụ
          </Typography>
          {selectedBookings.map((booking) => (
            <Paper key={booking._id} style={{ padding: 10, marginBottom: 10 }}>
              <Typography>Tên: {booking.user.name}</Typography>
              <Typography>Email: {booking.user.email}</Typography>
              <Typography>Phone: {booking.user.phone}</Typography>
              <Typography>Thời gian: {booking.time}</Typography>
              <Typography>Dịch vụ makeup: {booking.stadium.stadiumName}</Typography>
              <Typography>Loại dịch vụ makeup: {booking.stadium.fields[booking.field].name}</Typography>
            </Paper>
          ))}
          <Button variant="contained" color="primary" onClick={handleCloseModal} style={{ marginTop: 10 }}>
            Đóng
          </Button>
        </Box>
      </Modal>
    </PageContainer>
  );
};

export default TimelineHistoryPage;
