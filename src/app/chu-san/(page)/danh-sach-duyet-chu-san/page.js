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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Chip
} from "@mui/material";
import SendRequest from "@quanlysanbong/utils/SendRequest";
import PageContainer from "../../components/container/PageContainer";
import { convertDateTime } from "@quanlysanbong/utils/Main";
import { ROLE_MANAGER } from "@quanlysanbong/constants/System";
import toast from "react-hot-toast";

const UserListUpgradeToOwnerPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saleRequests, setSaleRequests] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    user: null,
    action: null
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // eslint-disable-next-line no-undef
      const [userRes, saleReqRes] = await Promise.all([
        SendRequest("GET", "/api/users", { role: ROLE_MANAGER.USER }),
        fetch("/api/request-add-sale").then((r) => r.json())
      ]);

      if (userRes.payload) {
        // Lấy ra các user có yêu cầu nâng cấp lên chủ dịch vụ makeup
        const usersWithRequests = userRes.payload.filter((user) =>
          saleReqRes.data.some((req) => req.email === user.email && req.status === "pending")
        );

        setUsers(usersWithRequests);
      }
      if (saleReqRes.success) setSaleRequests(saleReqRes.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
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

  // Duyệt đơn: cập nhật role và xoá request
  const handleApprove = async (user) => {
    try {
      // 1. Cập nhật role user
      await SendRequest("PUT", "/api/users", {
        id: user._id,
        role: "sale"
      });
      // 2. Xoá request khỏi sale_requests
      await fetch("/api/request-add-sale", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, name: user.name, phone: user.phone, address: user.address })
      });
      fetchData();
    } catch (err) {
      alert("Có lỗi khi duyệt đơn!");
    }
  };

  // Kiểm tra user có đơn pending không
  const hasPendingRequest = (email) => saleRequests.some((req) => req.email === email && req.status === "pending");

  // Render trạng thái tài khoản
  const renderAccountStatus = (status) => {
    return (
      <Chip
        label={status === false ? "Đã khóa" : "Hoạt động"}
        color={status === false ? "error" : "success"}
        size="small"
      />
    );
  };

  return (
    <PageContainer
      title="Danh sách duyệt chủ dịch vụ makeup"
      description="Danh sách tất cả người dùng yêu cầu nâng cấp lên chủ dịch vụ makeup"
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Danh sách người dùng yêu cầu nâng cấp lên chủ dịch vụ makeup</Typography>
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
                <TableCell>Avatar</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Điện thoại</TableCell>
                <TableCell>Tên</TableCell>
                <TableCell>Địa chỉ</TableCell>
                <TableCell>Ngày đăng ký</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Duyệt đơn</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>
                    <img src={user.avatar || "/img/carousel.jpg"} alt={user.name} width="50" height="50" />
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.address}</TableCell>
                  <TableCell>{convertDateTime(user.created_at)}</TableCell>
                  <TableCell>{renderAccountStatus(user.status)}</TableCell>
                  <TableCell>
                    {hasPendingRequest(user.email) ? (
                      <Button variant="contained" color="success" size="small" onClick={() => handleApprove(user)}>
                        Duyệt
                      </Button>
                    ) : (
                      <span style={{ color: "#aaa" }}>-</span>
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

export default UserListUpgradeToOwnerPage;
