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

const UserListPage = () => {
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
      if (userRes.payload) setUsers(userRes.payload);
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
        body: JSON.stringify({ email: user.email })
      });
      fetchData();
    } catch (err) {
      alert("Có lỗi khi duyệt đơn!");
    }
  };

  // Khóa/Mở khóa tài khoản
  const handleToggleAccountStatus = (user) => {
    const action = user.status === false ? "unlock" : "lock";
    setConfirmDialog({
      open: true,
      user: user,
      action: action
    });
  };

  const confirmToggleStatus = async () => {
    try {
      const { user, action } = confirmDialog;
      const newStatus = action === "lock" ? false : true;

      const response = await SendRequest("PUT", "/api/users", {
        id: user._id,
        active: newStatus
      });

      if (response) {
        // Cập nhật local state
        setUsers((prevUsers) => prevUsers.map((u) => (u._id === user._id ? { ...u, status: newStatus } : u)));
        toast.success(action === "lock" ? "Đã khóa tài khoản thành công!" : "Đã mở khóa tài khoản thành công!");
      } else {
        toast.error(response.error || "Có lỗi xảy ra khi gửi phản hồi");
      }
    } catch (error) {
      console.error("Error updating account status:", error);
      toast.error("Có lỗi xảy ra khi cập nhật trạng thái tài khoản");
    } finally {
      setConfirmDialog({ open: false, user: null, action: null });
    }
  };

  const cancelToggleStatus = () => {
    setConfirmDialog({ open: false, user: null, action: null });
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
    <PageContainer title="Danh sách người dùng" description="Danh sách tất cả người dùng trong hệ thống">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Danh sách người dùng</Typography>
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
                {/* <TableCell>Duyệt đơn</TableCell> */}
                <TableCell>Thao tác</TableCell>
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
                  {/* <TableCell>
                    {hasPendingRequest(user.email) ? (
                      <Button variant="contained" color="success" size="small" onClick={() => handleApprove(user)}>
                        Duyệt
                      </Button>
                    ) : (
                      <span style={{ color: "#aaa" }}>-</span>
                    )}
                  </TableCell> */}
                  <TableCell>
                    <Button
                      variant="contained"
                      color={user.status === false ? "success" : "error"}
                      size="small"
                      onClick={() => handleToggleAccountStatus(user)}
                    >
                      {user.status === false ? "Mở khóa" : "Khóa tài khoản"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialog xác nhận */}
      <Dialog
        open={confirmDialog.open}
        onClose={cancelToggleStatus}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
        <DialogTitle id="confirm-dialog-title">
          {confirmDialog.action === "lock" ? "Xác nhận khóa tài khoản" : "Xác nhận mở khóa tài khoản"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-dialog-description">
            Bạn có chắc chắn muốn {confirmDialog.action === "lock" ? "khóa" : "mở khóa"} tài khoản của{" "}
            <strong>{confirmDialog.user?.name}</strong> ({confirmDialog.user?.email})?
            {confirmDialog.action === "lock" && (
              <span style={{ color: "red" }}> Người dùng sẽ không thể đăng nhập sau khi bị khóa. </span>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelToggleStatus} color="primary">
            Hủy
          </Button>
          <Button
            onClick={confirmToggleStatus}
            color={confirmDialog.action === "lock" ? "error" : "success"}
            variant="contained"
          >
            {confirmDialog.action === "lock" ? "Khóa" : "Mở khóa"}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default UserListPage;
