"use client";

import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { formatCurrency } from "@quanlysanbong/utils/Main";
import SendRequest from "@quanlysanbong/utils/SendRequest";
import { ACCOUNT_NO, ACQ_ID, WEB_NAME } from "@quanlysanbong/constants/MainContent";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";

const OrderStadiumModal = ({ open, onClose, stadiumData }) => {
  const [selectedDate, setSelectedDate] = useState(""),
    [selectedField, setSelectedField] = useState(""),
    [errorMessage, setErrorMessage] = useState(""),
    [orderDone, setOrderDone] = useState(false);

  const [qrCode, setQrCode] = useState("");
  const [dataOrder, setDataOrder] = useState([]);

  const [selectedFieldSlot, setSelectedFieldSlot] = useState([]); // {time: "7:00-8:00", fieldIndex: 2}

  // useEffect(() => {
  //   const fetchOrderData = async () => {
  //     const res = await SendRequest("GET", `/api/orders?stadiumId=${stadiumData._id}`);
  //     if (res && res.payload) {
  //       setDataOrder(res.payload);
  //     }
  //   };
  //   if (stadiumData && stadiumData._id) {
  //     fetchOrderData();
  //   }
  // }, [stadiumData]);

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

    // Gọi hàm onClose từ parent component
    onClose();
  };

  const handleGetQr = async (uuid, amount = 10000) => {
    const content = `dat coc ${uuid}`;

    const payload = {
      accountNo: ACCOUNT_NO,
      accountName: `${WEB_NAME} Thanh toán`,
      acqId: ACQ_ID,
      amount: amount,
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
  };

  const today = new Date();
  const dateOptions = [];
  for (let i = 0; i < 5; i++) {
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
        stadiumId: stadiumData._id,
        ownerId: stadiumData.ownerId,
        deposit: stadiumData.fields[selectedField].price,
        field: selectedField,
        time: slot.time,
        date: selectedDate,
        fieldSlot: slot.fieldIndex,
        status: "confirmed"
      };
      orderCost += payload.deposit * 0.3;
      payloadArr.push(payload);
    });

    let uuid = uuidv4(); // Tạo UUID cho đơn hàng
    uuid = uuid.replace(/-/g, ""); // Loại bỏ dấu gạch ngang để sử dụng trong nội dung

    await handleGetQr(uuid, orderCost);

    setTimeout(() => {
      const intervalId = setInterval(async () => {
        const resPayment = await SendRequest("get", `/api/webhooks`);
        let paymentDone = false;
        if (resPayment.payload) {
          resPayment.payload.forEach((item) => {
            if (item.content.includes(`dat coc ${uuid}`)) {
              paymentDone = true;
            }
          });
        }
        if (!paymentDone) return;
        // Cập nhật trạng thái đơn hàng thành confirmed ngay lập tức
        payloadArr.forEach(async (payload) => {
          await SendRequest("post", "/api/orders", payload);
        });
        // Cập nhật state với trạng thái đã xác nhận
        setOrderDone(true);
        clearInterval(intervalId); // Stop polling when success
      }, 1500);
    }, 5000); // Simulate loading

    // setSelectedDate("");
    // setSelectedField("");
    // setSelectedFieldSlot([]);
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
        <Modal.Title>Đặt lịch trang điểm cho {stadiumData.stadiumName}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {qrCode.length ? (
          <div className="card shadow-sm p-4 border-0">
            <h5 className="mb-3">
              <strong>Thông tin đặt lịch</strong>
            </h5>

            <div className="row mb-2">
              <div className="col-sm-6">
                <strong>Ngày đặt:</strong> {convertDateFormat(selectedDate)}
              </div>
              <div className="col-sm-6">
                <strong>Dịch vụ:</strong> {stadiumData.fields[selectedField].name}
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

            <div className="row mb-2">
              <div className="col-sm-6">
                <strong>Tiền cọc (30%):</strong>
                <br />
                {formatCurrency(stadiumData.fields[selectedField].price * 0.3 * selectedFieldSlot.length)}
              </div>
              <div className="col-sm-6">
                <strong>Cần thanh toán (70%):</strong>
                <br />
                {formatCurrency(stadiumData.fields[selectedField].price * 0.7 * selectedFieldSlot.length)}
              </div>
            </div>

            <div className="mb-3">
              <strong>Chuyên viên:</strong> {stadiumData?.owner?.name} ({stadiumData?.owner?.phone})
            </div>

            {orderDone ? (
              <div className="alert alert-success text-center">
                <i className="fa fa-check-circle fa-2x mb-2" />
                <h5 className="mb-0">Đã nhận tiền cọc thành công</h5>
              </div>
            ) : (
              <div>
                <h6 className="mb-2">
                  <strong>Chuyển khoản qua ngân hàng:</strong>
                </h6>
                <div className="d-flex justify-content-center mt-3">
                  {qrCode.length > 0 ? (
                    <img
                      src={qrCode}
                      alt="Mã QR chuyển khoản"
                      className="img-fluid rounded border"
                      style={{ maxWidth: 250 }}
                    />
                  ) : (
                    <Spinner animation="border" variant="primary" />
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <Form>
            <p className="mb-2">Chọn ngày đặt lịch</p>
            <Form.Group className="mb-3" style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between" }}>
              {dateOptions.map((date, index) => (
                <Button
                  key={index}
                  variant={selectedDate === date ? "primary" : "light"}
                  size="sm"
                  onClick={() => setSelectedDate(date)}
                  className="mb-2"
                  style={{
                    flex: "1 0 18%",
                    margin: "2px",
                    textAlign: "center"
                  }}
                >
                  <div>
                    <div className="text-muted" style={{ fontSize: "0.8rem" }}>
                      <p
                        style={{
                          color: selectedDate === date ? "#fff" : "#adafb3"
                        }}
                      >
                        {new Date(date).toLocaleString("default", { month: "short" })}{" "}
                      </p>
                      <p
                        style={{
                          fontSize: "1.2rem",
                          fontWeight: "bold",

                          color: selectedDate === date ? "#fff" : "#000"
                        }}
                      >
                        {new Date(date).getDate()}
                      </p>
                      <p
                        style={{
                          fontSize: "0.8rem",
                          color: selectedDate === date ? "#fff" : "#adafb3"
                        }}
                      >
                        {new Date(date).toLocaleString("default", { weekday: "short" })}
                      </p>
                    </div>
                  </div>
                </Button>
              ))}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Chọn dịch vụ</Form.Label>
              <div className="d-flex flex-wrap gap-2">
                {Object.keys(stadiumData.fields).map((field, index) => {
                  if (!stadiumData.fields[field].isAvailable) return null;
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
                        {stadiumData.fields[field].name}
                      </div>
                      <div
                        style={{
                          fontSize: "0.8rem",
                          lineHeight: "1",
                          marginTop: "4px",
                          color: selectedField === field ? "#fff" : "#414142"
                        }}
                      >
                        {formatCurrency(stadiumData.fields[field].price)} VND
                      </div>
                    </Button>
                  );
                })}
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Chọn khung giờ</Form.Label>
              {selectedField && stadiumData.fields[selectedField] ? (
                <div className="table-responsive">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th style={{ width: "120px", backgroundColor: "#f8f9fa" }}>Khung giờ</th>
                        {Array.from({ length: stadiumData.fields[selectedField].count }, (_, i) => (
                          <th key={i} className="text-center" style={{ backgroundColor: "#f8f9fa" }}>
                            Slot {i + 1}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {stadiumData.fields[selectedField].timeDetail.map((time, timeIndex) => {
                        const maxCapacity = stadiumData.fields[selectedField].count || 0;
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

export default OrderStadiumModal;
