"use client";

import { useApp } from "@muahub/app/contexts/AppContext";
import { convertDateTime, formatCurrency } from "@muahub/utils/Main";
import SendRequest from "@muahub/utils/SendRequest";
import { useCallback, useEffect, useState } from "react";
import { Table, Form, Button } from "react-bootstrap";
import { Modal } from "@mui/material";
import toast from "react-hot-toast";
import {
  Box,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  TextField
} from "@mui/material";
import { ROLE_MANAGER } from "@muahub/constants/System";

const STATUS_MAP = {
  pending: { label: "Đang xử lý", className: "text-warning" },
  completed: { label: "Đã chuyển khoản", className: "text-success" },
  failed: { label: "Thất bại", className: "text-danger" }
};

const HistoryBankComponent = () => {
  const { currentUser, updateUser } = useApp();
  const [refunds, setRefunds] = useState([]);
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [tabIndex, setTabIndex] = useState(0);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");

  useEffect(() => {
    fetch("https://api.vietqr.io/v2/banks")
      .then((res) => res.json())
      .then((data) => {
        if (data.code === "00") setBanks(data.data);
      })
      .catch((err) => console.error("Lỗi khi tải ngân hàng:", err));
  }, []);

  const fetchRefunds = useCallback(async () => {
    setLoading(true);
    let id_user = currentUser._id;
    if (currentUser.role === "admin") {
      id_user = "";
    }
    const res = await SendRequest("GET", "/api/refund", { userId: id_user });
    if (res.payload) setRefunds(res.payload);
    setLoading(false);
  }, [currentUser._id, currentUser.role]);

  useEffect(() => {
    fetchRefunds();
  }, [fetchRefunds]);

  const handleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleSelectAll = (checked, list) => {
    if (checked) {
      const selectableIds = list.filter((r) => r.status === "pending").map((r) => r._id);
      setSelectedIds(selectableIds);
    } else {
      setSelectedIds([]);
    }
  };

  const totalSelectedAmount = refunds
    .filter((r) => selectedIds.includes(r._id))
    .reduce((sum, r) => sum + r.totalAmount, 0);

  const handleWithdraw = async () => {
    const balance = currentUser.totalPrice - (currentUser.withdrawn || 0);
    const amount = parseFloat(withdrawAmount);

    if (isNaN(amount) || amount <= 0) {
      toast.error("Số tiền rút không hợp lệ");
      return;
    }
    if (amount < 5000) {
      toast.error("Số tiền rút không được nhỏ hơn 5,000 VND");
      return;
    }
    if (amount > balance) {
      toast.error("Số tiền rút không được lớn hơn số dư hiện tại");
      return;
    }

    try {
      await SendRequest("PUT", "/api/users", {
        id: currentUser._id,
        withdrawn: (currentUser.withdrawn || 0) + amount
      });
      await SendRequest("POST", "/api/refund", {
        totalAmount: amount,
        discount: currentUser.payment_type ? 0 : 10, // Giả sử chiết khấu là 10% nếu không có gói thanh toán
        type: "get_money",
        userId: currentUser._id,
        bank_info_number: currentUser.bank_info_number,
        bank_info: currentUser.bank_info,
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.role
      });
      updateUser({
        ...currentUser,
        withdrawn: (currentUser.withdrawn || 0) + amount
      });
      toast.success("Yêu cầu rút tiền thành công");
      setWithdrawAmount("");
      setOpenModal(false);
      fetchRefunds();
    } catch (error) {
      toast.error("Yêu cầu rút tiền thất bại");
    }
  };

  const handlePay = async () => {
    handleExportCSV();
    for (const id of selectedIds) {
      await SendRequest("PUT", "/api/refund", {
        id,
        status: "completed"
      });
    }
    toast.success("Yêu cầu rút tiền đã được gửi.");
    setSelectedIds([]);
    fetchRefunds();

    setConfirmDialog(false);
  };

  const handleExportCSV = () => {
    const headers = ["Recipient Name", "Account Number", "Bank", "bank_code", "Amount", "Request Date", "Status"];

    const rows = refunds
      .filter((r) => r.status === "pending")
      .map((r) => {
        const mapped = r.bank_info_mapped || {};
        const bankName = banks.find((b) => b.bin === r.bank_info)?.shortName || "";
        const realAmount = r.discount ? r.totalAmount - r.totalAmount * (r.discount / 100) : r.totalAmount;

        return [
          mapped.account_name || r.name,
          r.bank_info_number,
          bankName,
          r.bank_info,
          realAmount,
          convertDateTime(r.created_at),
          r.status
        ];
      });

    const csvContent = [headers, ...rows].map((e) => e.map((cell) => `"${cell}"`).join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `refund_history_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderTable = (list, isPendingTab = false) => (
    <>
      {isPendingTab && currentUser.role == "admin" && (
        <div className="mb-2 d-flex justify-content-between align-items-center flex-wrap gap-2">
          <Form.Check
            type="checkbox"
            label="Chọn tất cả"
            checked={selectedIds.length > 0 && selectedIds.length === list.filter((r) => r.status === "pending").length}
            onChange={(e) => handleSelectAll(e.target.checked, list)}
          />
          <div>
            <Button
              variant="secondary"
              onClick={handleExportCSV}
              disabled={list.length === 0 || selectedIds.length === 0}
              className="me-2"
              style={{ marginRight: "10px" }}
            >
              Xuất CSV
            </Button>

            <Button variant="primary" disabled={selectedIds.length === 0} onClick={() => setConfirmDialog(true)}>
              Tiến hành trả tiền ({formatCurrency(totalSelectedAmount)})
            </Button>
          </div>
        </div>
      )}

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th className="text-center">Chọn</th>
            <th className="text-center">Tên người nhận</th>
            <th className="text-center">Số tài khoản</th>
            <th className="text-center">Ngân hàng</th>
            <th className="text-center">Số tiền</th>
            <th className="text-center">Chiết khấu</th>
            <th className="text-center">Thực nhận</th>
            <th className="text-center">Trạng thái</th>
            <th className="text-center">Ngày yêu cầu</th>
            <th className="text-center">Ngày chuyển tiền</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={10} className="text-center py-4">
                <div className="spinner-border text-primary" role="status" />
              </td>
            </tr>
          ) : list.length === 0 ? (
            <tr>
              <td colSpan={10} className="text-center text-muted">
                Không có dữ liệu.
              </td>
            </tr>
          ) : (
            list.map((refund) => {
              const statusInfo = STATUS_MAP[refund.status] || { label: refund.status, className: "" };
              const disabled = refund.status !== "pending";
              const mapped = refund.bank_info_mapped || {};

              return (
                <tr key={refund._id}>
                  <td className="text-center">
                    <Form.Check
                      type="checkbox"
                      checked={selectedIds.includes(refund._id)}
                      disabled={disabled}
                      onChange={() => handleSelect(refund._id)}
                    />
                  </td>
                  <td className="text-nowrap text-center">{mapped.account_name || refund.name}</td>
                  <td className="text-nowrap text-center">{refund.bank_info_number}</td>
                  <td className="text-nowrap text-center">
                    {banks.find((b) => b.bin === refund.bank_info)?.shortName}
                  </td>
                  <td className="text-nowrap text-end">{formatCurrency(refund.totalAmount)}</td>
                  <td className="text-nowrap text-end">{refund.discount || "0"} %</td>
                  <td className="text-nowrap text-end">
                    {!refund.discount
                      ? formatCurrency(refund.totalAmount)
                      : formatCurrency(refund.totalAmount - refund.totalAmount * (refund.discount / 100))}
                  </td>
                  <td className={`text-center fw-bold ${statusInfo.className}`}>{statusInfo.label}</td>
                  <td className="text-nowrap text-center">{convertDateTime(refund.created_at)}</td>
                  <td className="text-nowrap text-center">
                    {refund.transactionDate ? convertDateTime(refund.transactionDate) : "-"}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </Table>
    </>
  );

  const pendingRefunds = refunds.filter((r) => r.status === "pending");
  const processedRefunds = refunds.filter((r) => r.status !== "pending");

  return (
    <div className="w-100 overflow-auto">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Lịch sử rút tiền</Typography>
        {currentUser.role === ROLE_MANAGER.SALE && (
          <Button variant="primary" color="primary" onClick={() => setOpenModal(true)}>
            Rút tiền
          </Button>
        )}
      </Box>
      {currentUser.role === ROLE_MANAGER.SALE && (
        <Box display="flex" justifyContent="space-between" mb={3}>
          <Typography variant="h6">Tổng số tiền: {formatCurrency(currentUser.totalPrice || 0)}</Typography>
          <Typography variant="h6">
            Số dư hiện tại: {formatCurrency(currentUser.totalPrice - (currentUser.withdrawn || 0))}
          </Typography>
          <Typography variant="h6">Số tiền đã rút: {formatCurrency(currentUser.withdrawn || 0)}</Typography>
        </Box>
      )}

      <Box sx={{ width: "100%" }}>
        <Tabs value={tabIndex} onChange={(e, val) => setTabIndex(val)} aria-label="bank refund tabs">
          <Tab label="🔄 Chưa chuyển" />
          <Tab label="✅ Đã chuyển" />
        </Tabs>

        <Box sx={{ mt: 2 }}>
          {tabIndex === 0 && renderTable(pendingRefunds, true)}
          {tabIndex === 1 && renderTable(processedRefunds)}
        </Box>
      </Box>

      {/* Dialog xác nhận rút tiền */}
      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)}>
        <DialogTitle>Xác nhận rút tiền</DialogTitle>
        <DialogContent>
          Bạn sẽ chuyển <strong>{formatCurrency(totalSelectedAmount)}</strong> cho <strong>{selectedIds.length}</strong>{" "}
          người. Bạn có chắc chắn?
        </DialogContent>
        <DialogActions>
          <Button variant="secondary" onClick={() => setConfirmDialog(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handlePay}>
            OK
          </Button>
        </DialogActions>
      </Dialog>

      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            p: 4,
            borderRadius: 2,
            boxShadow: 24
          }}
        >
          <Typography variant="h6" gutterBottom>
            Nhập số tiền muốn rút
          </Typography>
          <TextField
            fullWidth
            label="Số tiền"
            type="number"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            margin="normal"
          />
          <Box display="flex" justifyContent="space-between" mt={2}>
            <Button variant="contained" color="primary" onClick={handleWithdraw}>
              Xác nhận
            </Button>
            <Button variant="outlined" onClick={() => setOpenModal(false)}>
              Hủy
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

export default HistoryBankComponent;
