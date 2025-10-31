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
import SendRequest from "@muahub/utils/SendRequest";
import PageContainer from "../../components/container/PageContainer";
import { convertDateTime } from "@muahub/utils/Main";
import { ROLE_MANAGER } from "@muahub/constants/System";
import toast from "react-hot-toast";

const UserListPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [MUARequests, setMUARequests] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    user: null,
    action: null
  });
  // Filter state
  const [filter, setFilter] = useState({
    search: '',
    status: 'all', // all, active, locked
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // eslint-disable-next-line no-undef
      const [userRes, MUAReqRes] = await Promise.all([
        SendRequest("GET", "/api/users", { role: ROLE_MANAGER.USER }),
        fetch("/api/request-add-MUA").then((r) => r.json())
      ]);
      if (userRes.payload) setUsers(userRes.payload);
      if (MUAReqRes.success) setMUARequests(MUAReqRes.data || []);
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
        role: "MUA"
      });
      // 2. Xoá request khỏi MUA_requests
      await fetch("/api/request-add-MUA", {
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
  const hasPendingRequest = (email) => MUARequests.some((req) => req.email === email && req.status === "pending");

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

  // Filtered users
  // Phân trang
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  // Reset page về 1 khi filter thay đổi
  useEffect(() => { setPage(1); }, [filter]);

  const filteredUsers = users.filter((user) => {
    // Search by email, name, phone
    const searchText = filter.search.toLowerCase();
    const matchSearch =
      user.email?.toLowerCase().includes(searchText) ||
      user.name?.toLowerCase().includes(searchText) ||
      user.phone?.toLowerCase().includes(searchText);
    // Status filter
    let matchStatus = true;
    if (filter.status === 'active') matchStatus = user.status !== false;
    if (filter.status === 'locked') matchStatus = user.status === false;
    return matchSearch && matchStatus;
  });

  const totalRows = filteredUsers.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage) || 1;
  const pagedUsers = filteredUsers.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <PageContainer title="Danh sách người dùng" description="Danh sách tất cả người dùng trong hệ thống">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Danh sách người dùng</Typography>
        <Button variant="contained" color="primary" onClick={handleReload}>
          Tải lại
        </Button>
      </Box>
      {/* Filter UI */}
      <Box display="flex" gap={2} mb={2}>
        <input
          type="text"
          placeholder="Tìm kiếm email, tên, SĐT..."
          value={filter.search}
          onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
          style={{ padding: 8, minWidth: 220, border: '1px solid #ccc', borderRadius: 4 }}
        />
        <select
          value={filter.status}
          onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}
          style={{ padding: 8, border: '1px solid #ccc', borderRadius: 4 }}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Hoạt động</option>
          <option value="locked">Đã khóa</option>
        </select>
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
                {pagedUsers.map((user) => (
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
          {/* Pagination controls */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
            <div>
              <span>
                Trang {page}/{totalPages} &nbsp;|&nbsp; Tổng: {totalRows} người dùng
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label>Hiển thị</label>
              <select value={rowsPerPage} onChange={e => setRowsPerPage(Number(e.target.value))}>
                {[5, 10, 20, 50, 100].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
              <span>/trang</span>
              <Button
                variant="outlined"
                size="small"
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                Trước
              </Button>
              <Button
                variant="outlined"
                size="small"
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              >
                Sau
              </Button>
            </div>
          </Box>
        </>
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
