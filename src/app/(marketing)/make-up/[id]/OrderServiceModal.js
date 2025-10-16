"use client";

import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { formatCurrency } from "@muahub/utils/Main";
import SendRequest from "@muahub/utils/SendRequest";
import { ACCOUNT_NO, ACQ_ID, WEB_NAME } from "@muahub/constants/MainContent";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";
import FormMakeupLocation from "./FormMakeupLocation";

const OrderServiceModal = ({ open, onClose, serviceData }) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedField, setSelectedField] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [orderDone, setOrderDone] = useState(false);
  const [latitude, setLatitude] = useState(16.0544);
  const [longitude, setLongitude] = useState(108.2022);

  const [qrCode, setQrCode] = useState("");
  const [payosQr, setPayosQr] = useState("");
  const [payosInfo, setPayosInfo] = useState(null); // lưu toàn bộ object trả về từ PayOS
  const [paymentMethod, setPaymentMethod] = useState("vietqr"); // 'vietqr' | 'payos'
  const [dataOrder, setDataOrder] = useState([]);

  const [selectedFieldSlot, setSelectedFieldSlot] = useState([]); // {time: "7:00-8:00", fieldIndex: 2}
  const [makeupLocation, setMakeupLocation] = useState(""); // 'at-home' | 'at-studio'

  // useEffect(() => {
  //   const fetchOrderData = async () => {
  //     const res = await SendRequest("GET", `/api/orders?serviceId=${serviceData._id}`);
  //     if (res && res.payload) {
  //       setDataOrder(res.payload);
  //     }
  //   };
  //   if (serviceData && serviceData._id) {
  //     fetchOrderData();
  //   }
  // }, [serviceData]);

  useEffect(() => {
    if (open) {
      // reset all
      setErrorMessage("");
      // setOrderSuccess(null); // Bỏ comment dòng này

      // reset form
      setSelectedDate("");
      setSelectedField("");
      setSelectedFieldSlot([]); // Thêm reset cho selectedFieldSlot
    }
  }, [open]);

  // Thêm hàm handleClose để reset tất cả state
  const handleClose = () => {
    // Reset tất cả state về trạng thái ban đầu
    setOrderDone(false);
    setQrCode("");
    setErrorMessage("");
    setSelectedDate("");
    setSelectedField("");
    setSelectedFieldSlot([]);
    setMakeupLocation("");

    // Gọi hàm onClose từ parent component
    onClose();
  };

  // Nhận thêm orderCode nếu là PayOS
  const handleGetQr = async (uuid, amount = 10000, orderCode = null) => {
    const content = `dat coc ${uuid}`;
    if (paymentMethod === "vietqr") {
      const payload = {
        accountNo: ACCOUNT_NO,
        accountName: `${WEB_NAME} Thanh toán`,
        acqId: ACQ_ID,
        amount: 2000,
        addInfo: content,
        format: "text",
        template: "compact2"
      };
      const res = await fetch("https://api.vietqr.io/v2/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setQrCode(data?.data?.qrDataURL || "");
      setPayosQr("");
    } else if (paymentMethod === "payos") {
      try {
        let safeContent = content;
        if (safeContent.length > 25) safeContent = safeContent.slice(0, 25);
        const res = await fetch("/api/payos-link", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderCode: orderCode,
            amount: 2000,
            description: safeContent,
            cancelUrl: window.location.origin + "/thanh-toan-that-bai",
            returnUrl: window.location.origin + "/thanh-toan-thanh-cong"
          })
        });
        const raw = await res.json();
        const data = raw.data || raw;
        setPayosInfo(data);
        setPayosQr(data.qrCode || "");
        setQrCode("");
      } catch (err) {
        setErrorMessage("Không thể tạo QR PayOS. Vui lòng thử lại.");
        setPayosQr("");
        setQrCode("");
      }
    }
  };

  const today = new Date();
  const dateOptions = [];
  for (let i = 0; i < 30; i++) { // Cho phép chọn 30 ngày tới
    const futureDate = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
    dateOptions.push(
      `${futureDate.getFullYear()}-${(futureDate.getMonth() + 1).toString().padStart(2, "0")}-${futureDate
        .getDate()
        .toString()
        .padStart(2, "0")}`
    );
  }

  // useEffect(() => {
  //   setSelectedDate(dateOptions[0]);
  // }, [dateOptions]);

  const convertDateFormat = (dateString) => {
    const [year, month, day] = dateString.split("-");
    return `${day}-${month}-${year}`;
  };

  // Thêm state để lưu dịch vụ makeup đã chọn cụ thể

  // Reset selectedFieldSlot khi thay đổi ngày hoặc loại dịch vụ makeup
  useEffect(() => {
    setSelectedFieldSlot([]);
  }, [selectedDate, selectedField]);

  const handleOrder = async () => {
    const payloadArr = [];
    let orderCost = 0;
    selectedFieldSlot.forEach((slot) => {
      const payload = {
        serviceId: serviceData._id,
        ownerId: serviceData.ownerId,
        deposit: serviceData.packages[selectedField].price,
        field: selectedField,
        time: slot.time,
        date: selectedDate,
        fieldSlot: slot.fieldIndex,
        location: makeupLocation,
        status: "confirmed"
      };
      orderCost += payload.deposit * 0.3;
      payloadArr.push(payload);
    });

    let uuid = uuidv4();
    uuid = uuid.replace(/-/g, "");

    let orderCode = null;
    if (paymentMethod === "payos") {
      orderCode = Math.floor(Math.random() * 1000000);
      await handleGetQr(uuid, orderCost, orderCode);
    } else {
      await handleGetQr(uuid, orderCost);
    }

    setTimeout(() => {
      const intervalId = setInterval(async () => {
        const resPayment = await SendRequest("get", `/api/webhooks`);
        let paymentDone = false;
        if (resPayment.payload) {
          // console.log('resPayment.payload:', resPayment.payload);
          resPayment.payload.forEach((item) => {
            // console.log("paymentMethod:", paymentMethod);
            if (paymentMethod === "vietqr") {
              // console.log('item.content vietqr:', item.content, 'looking for:', `dat coc ${uuid}`);
              if (item.content && item.content.includes(`dat coc ${uuid}`)) {
                paymentDone = true;
              }
            } else if (paymentMethod === "payos") {
              // console.log('item.data payos:', item.data, 'looking for:', `orderCode ${orderCode}`);
              if (item.data) {
                console.log('item.data.orderCode:', item.data.orderCode, 'orderCode:', orderCode, 'equal:', item.data.orderCode === orderCode);
                if (item.data.orderCode === orderCode) {
                  console.log('Payment confirmed for orderCode:', orderCode);
                  paymentDone = true;
                }
              }
            }
          });
        }
        if (!paymentDone) return;
        payloadArr.forEach(async (payload) => {
          await SendRequest("post", "/api/orders", payload);
        });
        setOrderDone(true);
        clearInterval(intervalId);
      }, 5000);
    }, 5000);
  };

  const toggleSelectedFieldSlot = ({ time, fieldIndex }) => {
    for (let i = 0; i < selectedFieldSlot.length; i++) {
      if (selectedFieldSlot[i].time === time && selectedFieldSlot[i].fieldIndex === fieldIndex) {
        // Nếu đã chọn, bỏ chọn
        setSelectedFieldSlot(
          selectedFieldSlot.filter((slot) => !(slot.time === time && slot.fieldIndex === fieldIndex))
        );
        return;
      }
    }
    // Nếu chưa chọn, thêm vào
    setSelectedFieldSlot([...selectedFieldSlot, { time, fieldIndex }]);
  };

  return (
    <Modal show={open} onHide={onClose} centered size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Đặt lịch trang điểm cho {serviceData.serviceName}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {(qrCode.length || payosQr.length) ? (
          <div className="card shadow-sm p-4 border-0">
            <h5 className="mb-3">
              <strong>Thông tin đặt lịch</strong>
            </h5>

            <div className="row mb-2">
              <div className="col-sm-6">
                <strong>Ngày đặt:</strong> {convertDateFormat(selectedDate)}
              </div>
              <div className="col-sm-6">
                <strong>Dịch vụ:</strong> {selectedField && serviceData?.packages?.[selectedField]?.name || 'Chưa chọn'}
              </div>
            </div>

            <div className="mb-3">
              <strong>Khung giờ đặt:</strong>
              <ul className="mb-1">
                {selectedFieldSlot.map((slot, index) => (
                  <li key={index}>
                    {slot.time} - Slot {slot.fieldIndex + 1}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-3">
              <strong>Địa điểm:</strong> {makeupLocation === 'at-studio' ? 'Đến studio' : makeupLocation === 'at-home' ? 'Đến tận nơi' : 'Chưa chọn'}
            </div>

            <div className="row mb-2">
              <div className="col-sm-6">
                <strong>Tiền cọc (30%):</strong>
                <br />
                {formatCurrency(serviceData.packages[selectedField].price * 0.3 * selectedFieldSlot.length)}
              </div>
              <div className="col-sm-6">
                <strong>Cần thanh toán (70%):</strong>
                <br />
                {formatCurrency(serviceData.packages[selectedField].price * 0.7 * selectedFieldSlot.length)}
              </div>
            </div>

            <div className="mb-3">
              <strong>Chuyên viên:</strong> {serviceData?.owner?.name} ({serviceData?.owner?.phone})
            </div>

            {orderDone ? (
              <div className="alert alert-success text-center">
                <i className="fa fa-check-circle fa-2x mb-2" />
                <h5 className="mb-0">Đã nhận tiền cọc thành công</h5>
              </div>
            ) : (
              <div>
                <h6 className="mb-2">
                  <strong>Phương thức thanh toán:</strong> {paymentMethod === "vietqr" ? "Chuyển khoản ngân hàng (VietQR)" : "Thanh toán PayOS"}
                </h6>
                <div className="d-flex justify-content-center mt-3">
                  {paymentMethod === "vietqr" && qrCode.length > 0 && (
                    <img
                      src={qrCode}
                      alt="Mã QR chuyển khoản VietQR"
                      className="img-fluid rounded border"
                      style={{ maxWidth: 250 }}
                    />
                  )}
                  {paymentMethod === "payos" && payosQr.length > 0 && (
                    <img
                      src={`https://img.vietqr.io/image/${ACQ_ID}-${payosInfo?.accountNumber || ''}-compact2.png?amount=${2000}&addInfo=${encodeURIComponent(payosInfo?.description || '')}&accountName=${encodeURIComponent(payosInfo?.accountName || '')}`}
                      alt="Mã QR PayOS"
                      className="img-fluid rounded border"
                      style={{ maxWidth: 250 }}
                    />
                  )}
                  {/* Nếu muốn hiển thị raw QR text: <div>{payosQr}</div> */}
                  {(!qrCode.length && !payosQr.length) && <Spinner animation="border" variant="primary" />}
                </div>
              </div>
            )}
          </div>
        ) : (
          <Form>
            <FormMakeupLocation 
              makeupLocation={makeupLocation} 
              setMakeupLocation={setMakeupLocation}
              latitude={latitude}
              longitude={longitude}
            />

            <Form.Group className="mb-3">
              <Form.Label>Chọn phương thức thanh toán</Form.Label>
              <div className="d-flex gap-2">
                <Button
                  variant={paymentMethod === "vietqr" ? "primary" : "outline-primary"}
                  onClick={() => setPaymentMethod("vietqr")}
                  size="sm"
                >
                  Chuyển khoản ngân hàng (VietQR)
                </Button>
                <Button
                  variant={paymentMethod === "payos" ? "primary" : "outline-primary"}
                  onClick={() => setPaymentMethod("payos")}
                  size="sm"
                >
                  Thanh toán PayOS
                </Button>
              </div>
            </Form.Group>
            <p className="mb-2">Chọn ngày đặt lịch</p>
            <Form.Group className="mb-3">
              <div style={{ display: "flex", overflowX: "auto", gap: 8, paddingBottom: 4 }}>
                {dateOptions.map((date, index) => (
                  <Button
                    key={index}
                    variant={selectedDate === date ? "primary" : "light"}
                    size="sm"
                    onClick={() => setSelectedDate(date)}
                    style={{
                      minWidth: 70,
                      margin: 0,
                      textAlign: "center",
                      borderRadius: 8,
                      border: selectedDate === date ? "2px solid #ff5c95" : undefined,
                      fontWeight: selectedDate === date ? 700 : 400
                    }}
                  >
                    <div className="text-muted" style={{ fontSize: "0.8rem" }}>
                      <div style={{ color: selectedDate === date ? "#fff" : "#adafb3" }}>
                        {new Date(date).toLocaleString("default", { month: "short" })}
                      </div>
                      <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: selectedDate === date ? "#fff" : "#000" }}>
                        {new Date(date).getDate()}
                      </div>
                      <div style={{ fontSize: "0.8rem", color: selectedDate === date ? "#fff" : "#adafb3" }}>
                        {new Date(date).toLocaleString("default", { weekday: "short" })}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Chọn dịch vụ</Form.Label>
              <div className="d-flex flex-wrap gap-2">
                {Object.keys(serviceData.packages).map((field, index) => {
                  if (!serviceData.packages[field].isAvailable) return null;
                  return (
                    <Button
                      key={index}
                      variant={selectedField === field ? "primary" : "outline-primary"}
                      size="sm"
                      onClick={() => setSelectedField(field)}
                      className="mb-2 d-flex flex-column align-items-center px-3 py-2"
                      style={{ minWidth: "120px", height: "auto", color: selectedField === field ? "#fff" : "#adafb3" }}
                    >
                      <div
                        style={{
                          fontSize: "0.9rem",
                          fontWeight: "bold",
                          lineHeight: "1.2",
                          color: selectedField === field ? "#fff" : "#adafb3"
                        }}
                      >
                        {serviceData.packages[field].name}
                      </div>
                      <div
                        style={{
                          fontSize: "0.8rem",
                          lineHeight: "1",
                          marginTop: "4px",
                          color: selectedField === field ? "#fff" : "#414142"
                        }}
                      >
                        {formatCurrency(serviceData.packages[field].price)} VND
                      </div>
                    </Button>
                  );
                })}
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Chọn khung giờ</Form.Label>
              {selectedField && serviceData.packages[selectedField] ? (
                <div className="table-responsive">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th style={{ width: "120px", backgroundColor: "#f8f9fa" }}>Khung giờ</th>
                        {Array.from({ length: serviceData.packages[selectedField].count }, (_, i) => (
                          <th key={i} className="text-center" style={{ backgroundColor: "#f8f9fa" }}>
                            Slot {i + 1}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {serviceData.packages[selectedField].timeDetail.map((time, timeIndex) => {
                        const maxCapacity = serviceData.packages[selectedField].count || 0;
                        // Ẩn khung giờ nếu ngày được chọn là hôm nay và khung giờ đã qua
                        const [startTime] = time.split("-");
                        if (
                          selectedDate ===
                          `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, "0")}-${today
                            .getDate()
                            .toString()
                            .padStart(2, "0")}` &&
                          (() => {
                            // Lấy giờ phút hiện tại
                            const now = new Date();
                            const [startHour, startMinute] = startTime.trim().split(":").map(Number);
                            const slotDate = new Date(
                              today.getFullYear(),
                              today.getMonth(),
                              today.getDate(),
                              startHour,
                              startMinute
                            );
                            return slotDate < now;
                          })()
                        ) {
                          return null;
                        }

                        return (
                          <tr key={timeIndex}>
                            <td className="fw-bold text-center align-middle" style={{ backgroundColor: "#f8f9fa" }}>
                              <p className="mb-0" style={{ fontSize: "0.9rem" }}>
                                {time}
                              </p>
                            </td>
                            {Array.from({ length: maxCapacity }, (_, fieldIndex) => {
                              const isOccupied = false;
                              const canSelect = true;

                              // Kiểm tra xem ô này có được chọn không
                              const isThisSlotSelected = selectedFieldSlot.some(
                                (slot) => slot.time === time && slot.fieldIndex === fieldIndex
                              );

                              return (
                                <td key={fieldIndex} className="p-1">
                                  <Button
                                    variant={
                                      isThisSlotSelected ? "primary" : isOccupied ? "secondary" : "outline-success"
                                    }
                                    size="sm"
                                    disabled={isOccupied}
                                    onClick={() => {
                                      if (canSelect) {
                                        toggleSelectedFieldSlot({ time, fieldIndex });
                                      }
                                    }}
                                    className="w-100"
                                    style={{
                                      minHeight: "35px",
                                      fontSize: "0.8rem",
                                      cursor: canSelect ? "pointer" : "not-allowed"
                                    }}
                                  >
                                    {isOccupied ? "Đã đặt" : isThisSlotSelected ? "Đã chọn" : "Trống"}
                                  </Button>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* Hiển thị khung giờ đã chọn */}
                  {selectedFieldSlot.length > 0 ? (
                    <div className="mt-3 p-2 bg-light rounded">
                      <strong>Đã chọn:</strong>
                      <ul>
                        {selectedFieldSlot.map((slot, index) => (
                          <li key={index}>
                            {slot.time} - Slot {slot.fieldIndex + 1}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-muted">Chưa chọn khung giờ nào</p>
                  )}
                </div>
              ) : (
                <p className="text-muted">Vui lòng chọn dịch vụ trước</p>
              )}
            </Form.Group>

            {errorMessage && <div className="text-danger mb-3">{errorMessage}</div>}
          </Form>
        )}
      </Modal.Body>
      <Modal.Footer>
        {/* Hiển thị thông tin PayOS nếu có */}
        {/* {paymentMethod === "payos" && payosInfo && (
              <div className="alert alert-info mt-3">
                <div><b>Số tài khoản:</b> {payosInfo.accountNumber}</div>
                <div><b>Tên tài khoản:</b> {payosInfo.accountName}</div>
                <div><b>Số tiền:</b> {formatCurrency(payosInfo.amount)} VND</div>
                <div><b>Nội dung:</b> {payosInfo.description}</div>
                <div><b>Trạng thái:</b> {payosInfo.status}</div>
                <div><b>Link thanh toán:</b> <a href={payosInfo.checkoutUrl} target="_blank" rel="noopener noreferrer">{payosInfo.checkoutUrl}</a></div>
              </div>
            )} */}
        {orderDone ? (
          <>
            <Link href="/trang-ca-nhan">
              <Button variant="primary">Xem lịch sử đặt lịch</Button>
            </Link>
            <Button variant="secondary" onClick={handleClose}>
              Đóng
            </Button>
          </>
        ) : (
          <>
            <Button variant="secondary" onClick={handleClose}>
              Hủy
            </Button>
            <Button
              variant="primary"
              onClick={handleOrder}
              disabled={selectedFieldSlot.length === 0 || qrCode.length > 0 ? true : false}
            >
              Xác nhận đặt lịch
            </Button>
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default OrderServiceModal;
