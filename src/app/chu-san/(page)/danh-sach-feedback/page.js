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
  Tabs,
  Tab
} from "@mui/material";
import SendRequest from "@quanlysanbong/utils/SendRequest";
import PageContainer from "../../components/container/PageContainer";
import { convertDateTime } from "@quanlysanbong/utils/Main";

const FeedbackManagementPage = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await SendRequest("GET", "/api/feedbacks", {});
      if (res.payload) {
        setFeedbacks(res.payload);
      }
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleMarkAsRead = async (id) => {
    try {
      await SendRequest("PUT", `/api/feedbacks`, {
        id,
        checked: true
      });
      fetchData();
    } catch (error) {
      console.error("Error updating feedback status:", error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const filteredFeedbacks = feedbacks.filter((feedback) => (tabIndex === 0 ? !feedback.checked : feedback.checked));

  return (
    <PageContainer title="Quản lý phản hồi" description="Danh sách phản hồi của khách hàng">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Quản lý phản hồi</Typography>
        <Button variant="contained" color="primary" onClick={fetchData}>
          Tải lại
        </Button>
      </Box>
      <Tabs value={tabIndex} onChange={handleTabChange} indicatorColor="primary" textColor="primary">
        <Tab label="Chưa xác nhận" />
        <Tab label="Đã xác nhận" />
      </Tabs>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Ngày gửi</TableCell>
                <TableCell>Người gửi</TableCell>
                <TableCell>Thông tin liên hệ</TableCell>
                <TableCell>Dịch vụ makeup</TableCell>
                <TableCell>Loại dịch vụ makeup</TableCell>
                <TableCell>Ngày đặt</TableCell>
                <TableCell>Tiêu đề</TableCell>
                <TableCell>Lý do</TableCell>
                <TableCell>Trạng thái phản hồi</TableCell>
                <TableCell>Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredFeedbacks.map((feedback) => (
                <TableRow key={feedback._id}>
                  <TableCell>{convertDateTime(feedback.created_at)}</TableCell>
                  <TableCell>{feedback.user.name}</TableCell>
                  <TableCell>
                    <Typography>{feedback.user.email}</Typography>
                    {feedback.user.phone}
                  </TableCell>
                  <TableCell>
                    <Typography>{feedback.stadium.stadiumName}</Typography>
                    {feedback.stadium.locationDetail}, {feedback.stadium.location}
                  </TableCell>
                  <TableCell>{feedback.order.field} người</TableCell>
                  <TableCell>
                    {feedback.order.date}
                    <br />
                    {feedback.order.time}
                  </TableCell>
                  <TableCell>{feedback.title}</TableCell>
                  <TableCell>{feedback.reason}</TableCell>
                  <TableCell style={{ color: feedback.checked ? "green" : "red" }}>
                    {feedback.checked ? "Đã đọc" : "Chưa đọc"}
                  </TableCell>
                  <TableCell>
                    {!feedback.checked && (
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => handleMarkAsRead(feedback._id)}
                      >
                        Đánh dấu đã đọc
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </PageContainer>
  );
};

export default FeedbackManagementPage;
