"use client";

import { useCallback, useEffect, useState } from "react";
 import { Box,
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
  Modal,
  Chip,
  TextField
} from "@mui/material";
import UpdateMakeupArtistProfileComponent from "../../../(marketing)/components/UpdateMakeupArtistProfileComponent";
import SendRequest from "@muahub/utils/SendRequest";
import PageContainer from "../../components/container/PageContainer";
import { convertDateTime } from "@muahub/utils/Main";
import { ROLE_MANAGER } from "@muahub/constants/System";
import toast from "react-hot-toast";

const UserListUpgradeToOwnerPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [MUARequests, setMUARequests] = useState([]);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelReason, setShowCancelReason] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // eslint-disable-next-line no-undef
      const [userRes, MUAReqRes] = await Promise.all([
        SendRequest("GET", "/api/users", { role: ROLE_MANAGER.USER }),
        fetch("/api/request-add-MUA").then((r) => r.json())
      ]);

      if (userRes.payload) {
        // Lấy ra các user có yêu cầu nâng cấp lên chủ dịch vụ makeup
        const usersWithRequests = userRes.payload.filter((user) =>
          MUAReqRes.data.some((req) => req.email === user.email && req.status === "pending")
        );

        setUsers(usersWithRequests);
      }
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

  // Khi ấn Duyệt, mở modal xem profile
  const handleApproveClick = (user) => {
    setSelectedUser(user);
    setShowApproveModal(true);
    setShowCancelReason(false);
    setCancelReason("");
  };

  // Xác nhận duyệt đơn
  const handleApproveConfirm = async () => {
    if (!selectedUser) return;
    try {
      await SendRequest("PUT", "/api/users", {
        id: selectedUser._id,
        role: "makeup_artist"
      });
      await fetch("/api/request-add-MUA", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: selectedUser.email, name: selectedUser.name, phone: selectedUser.phone, address: selectedUser.address })
      });
      setShowApproveModal(false);
      setSelectedUser(null);
      fetchData();
    } catch (err) {
      alert("Có lỗi khi duyệt đơn!");
    }
  };

  // Hủy duyệt đơn
  const handleCancelRequest = async () => {
    if (!selectedUser) return;
    if (!cancelReason.trim()) {
      toast.error("Vui lòng nhập lý do hủy!");
      return;
    }
    try {
      // Gửi lý do hủy (có thể cần API riêng, ví dụ PATCH hoặc POST log...)
      await fetch("/api/request-add-MUA", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: selectedUser.email, status: "rejected", reason: cancelReason })
      });
      setShowApproveModal(false);
      setSelectedUser(null);
      setCancelReason("");
      setShowCancelReason(false);
      fetchData();
    } catch (err) {
      alert("Có lỗi khi hủy đơn!");
    }
  };


  // Kiểm tra trạng thái đơn
  const getRequestStatus = (email) => {
    const req = MUARequests.find((r) => r.email === email);
    return req ? req.status : null;
  };
  const getRequestReason = (email) => {
    const req = MUARequests.find((r) => r.email === email);
    return req && req.status === "rejected" ? req.reason : null;
  };
  const hasPendingRequest = (email) => getRequestStatus(email) === "pending";

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
                    {getRequestStatus(user.email) === "pending" ? (
                      <Button variant="contained" color="success" size="small" onClick={() => handleApproveClick(user)}>
                        Duyệt
                      </Button>
                    ) : getRequestStatus(user.email) === "rejected" ? (
                      <>
                        <Chip label="Đã từ chối" color="error" size="small" />
                        {getRequestReason(user.email) && (
                          <div style={{ color: '#b71c1c', fontSize: 12, marginTop: 4 }}>
                            Lý do: {getRequestReason(user.email)}
                          </div>
                        )}
                      </>
                    ) : (
                      <span style={{ color: "#aaa" }}>-</span>
                    )}
                  </TableCell>
      {/* Modal duyệt đơn và xem profile */}
      <Modal open={showApproveModal} onClose={() => { setShowApproveModal(false); setShowCancelReason(false); }} maxWidth="md">
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'background.paper', boxShadow: 24, p: 4, minWidth: 600, maxHeight: '90vh', overflowY: 'auto' }}>
          <Typography variant="h6" mb={2}>Thông tin hồ sơ chuyên gia</Typography>
          {selectedUser && (
            <UpdateMakeupArtistProfileComponent currentUser={selectedUser} readOnly />
          )}
          {/* Nếu đơn đã bị từ chối, hiển thị lý do */}
          {selectedUser && getRequestStatus(selectedUser.email) === "rejected" && (
            <Box mt={2} color="#b71c1c">
              <Chip label="Đã từ chối" color="error" size="small" />
              {getRequestReason(selectedUser.email) && (
                <div style={{ fontSize: 14, marginTop: 4 }}>
                  Lý do từ chối: {getRequestReason(selectedUser.email)}
                </div>
              )}
            </Box>
          )}
          {/* Nếu đơn đang pending thì cho phép duyệt/hủy */}
          {selectedUser && getRequestStatus(selectedUser.email) === "pending" && (
            <Box mt={3} display="flex" gap={2}>
              {!showCancelReason ? (
                <>
                  <Button variant="contained" color="success" onClick={handleApproveConfirm}>Xác nhận duyệt</Button>
                  <Button variant="outlined" color="error" onClick={() => setShowCancelReason(true)}>Hủy đơn</Button>
                  <Button variant="text" onClick={() => { setShowApproveModal(false); setShowCancelReason(false); }}>Đóng</Button>
                </>
              ) : (
                <Box width="100%">
                  <TextField
                    label="Lý do hủy đơn"
                    value={cancelReason}
                    onChange={e => setCancelReason(e.target.value)}
                    fullWidth
                    multiline
                    minRows={2}
                    sx={{ mb: 2 }}
                  />
                  <Box display="flex" gap={2}>
                    <Button variant="contained" color="error" onClick={handleCancelRequest}>Xác nhận hủy</Button>
                    <Button variant="text" onClick={() => setShowCancelReason(false)}>Quay lại</Button>
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Modal>
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
