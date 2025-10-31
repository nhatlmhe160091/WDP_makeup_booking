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
      const res = await SendRequest("GET", "/api/users", {
        role: ROLE_MANAGER.MUA
      });
      if (res.payload) {
        setUsers(res.payload);
      }
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

  // Khóa/Mở khóa tài khoản chủ dịch vụ makeup
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
        if (action === "lock") {
          try {
            await SendRequest("PUT", "/api/services/lock-mua", { muaId: user._id });
          } catch (err) {
            console.error("Error locking MUA services:", err);
          }
        }
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

  // Render loại thanh toán
  const renderPaymentType = (paymentType) => {
    const paymentTypes = {
      revenue: "Thu theo doanh thu",
      monthly_3: "Trả theo 3 tháng",
      monthly_6: "Trả theo 6 tháng",
      yearly: "Trả theo 1 năm"
    };

    const colors = {
      revenue: "primary",
      monthly_3: "warning",
      monthly_6: "info",
      yearly: "success"
    };

    // Kiểm tra nếu không có payment_type
    if (!paymentType) {
      return <Chip label="Chưa chọn gói" color="default" size="small" variant="outlined" />;
    }

    return (
      <Chip
        label={paymentTypes[paymentType] || "Không xác định"}
        color={colors[paymentType] || "default"}
        size="small"
        variant="outlined"
      />
    );
  };

  // Format số tiền
  const formatCurrency = (amount) => {
    if (!amount) return "0 VNĐ";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND"
    }).format(amount);
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
    <PageContainer title="Danh sách chủ dịch vụ makeup" description="Danh sách tất cả chủ dịch vụ makeup trong hệ thống">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Danh sách chủ dịch vụ makeup</Typography>
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
                  <TableCell>Ngân hàng</TableCell>
                  <TableCell>Số tài khoản</TableCell>
                  <TableCell>Loại thanh toán</TableCell>
                  <TableCell>Tổng đã thu</TableCell>
                  <TableCell>Ngày đăng ký</TableCell>
                  <TableCell>Trạng thái</TableCell>
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
                    <TableCell>{user.bank_info || "-"}</TableCell>
                    <TableCell>{user.bank_info_number || "-"}</TableCell>
                    <TableCell>{renderPaymentType(user.payment_type)}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold" color="primary">
                        {formatCurrency(user.payment_amount)}
                      </Typography>
                    </TableCell>
                    <TableCell>{convertDateTime(user.created_at)}</TableCell>
                    <TableCell>{renderAccountStatus(user.status)}</TableCell>
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
                Trang {page}/{totalPages} &nbsp;|&nbsp; Tổng: {totalRows} chủ dịch vụ
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
          {confirmDialog.action === "lock" ? "Xác nhận khóa tài khoản chủ dịch vụ makeup" : "Xác nhận mở khóa tài khoản chủ dịch vụ makeup"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-dialog-description">
            Bạn có chắc chắn muốn {confirmDialog.action === "lock" ? "khóa" : "mở khóa"} tài khoản chủ dịch vụ makeup{" "}
            <strong>{confirmDialog.user?.name}</strong> ({confirmDialog.user?.email})?
            {confirmDialog.action === "lock" && (
              <div style={{ marginTop: "10px" }}>
                <span style={{ color: "red", fontWeight: "bold" }}>
                  ⚠️ Lưu ý: Chủ dịch vụ makeup sẽ không thể đăng nhập và quản lý dịch vụ makeup của mình sau khi bị khóa.
                </span>
                <br />
                <span style={{ color: "orange" }}>
                  Tất cả các dịch vụ makeup thuộc sở hữu của chủ dịch vụ makeup này có thể bị ảnh hưởng.
                </span>
              </div>
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
            {confirmDialog.action === "lock" ? "Khóa tài khoản" : "Mở khóa tài khoản"}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};
export default UserListPage;
