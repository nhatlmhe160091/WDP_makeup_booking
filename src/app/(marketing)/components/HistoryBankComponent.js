"use client";

import { convertDateTime, formatCurrency } from "@muahub/utils/Main";
import SendRequest from "@muahub/utils/SendRequest";
import { useCallback, useEffect, useState } from "react";
import { Table } from "react-bootstrap";

const STATUS_MAP = {
  pending: { label: "Đang xử lý", className: "text-warning" },
  completed: { label: "Đã chuyển khoản", className: "text-success" },
  failed: { label: "Thất bại", className: "text-danger" }
};

const HistoryBankComponent = ({ currentUser }) => {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [banks, setBanks] = useState([]);

  useEffect(() => {
    fetch("https://api.vietqr.io/v2/banks")
      .then((response) => response.json())
      .then((data) => {
        if (data.code === "00") {
          setBanks(data.data);
        }
      })
      .catch((error) => console.error("Error fetching banks:", error));
  }, []);

  const fetchRefunds = useCallback(async () => {
    setLoading(true);
    const res = await SendRequest("GET", "/api/refund", { userId: currentUser._id });
    if (res.payload) {
      setRefunds(res.payload);
    }
    setLoading(false);
  }, [currentUser._id]);

  useEffect(() => {
    fetchRefunds();
  }, [fetchRefunds]);

  return (
    <div className="w-100 overflow-auto">
      <h5 className="mb-3">Lịch sử hoàn tiền</h5>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th className="text-center">Người nhận</th>
            <th className="text-center">Số tài khoản</th>
            <th className="text-center">Ngân hàng</th>
            <th className="text-center">Số tiền</th>
            <th className="text-center">Chiết khấu</th>
            <th className="text-center">Trạng thái</th>
            <th className="text-center">Ngày yêu cầu</th>
            <th className="text-center">Ngày chuyển</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={9} className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </td>
            </tr>
          ) : refunds.length === 0 ? (
            <tr>
              <td colSpan={9} className="text-center text-muted">
                Không có dữ liệu hoàn tiền.
              </td>
            </tr>
          ) : (
            refunds.map((refund) => {
              const statusInfo = STATUS_MAP[refund.status] || {
                label: refund.status,
                className: ""
              };

              return (
                <tr key={refund._id}>
                  <td className="text-nowrap text-center">{refund.name}</td>
                  <td className="text-nowrap text-center">{refund.bank_info_number}</td>
                  <td className="text-nowrap text-center">
                    {banks.find((b) => b.bin === refund.bank_info)?.shortName}
                  </td>
                  <td className="text-nowrap text-end">{formatCurrency(refund.totalAmount)}</td>
                  <td className="text-nowrap text-end">{refund.discount || "0"} %</td>
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
    </div>
  );
};

export default HistoryBankComponent;
