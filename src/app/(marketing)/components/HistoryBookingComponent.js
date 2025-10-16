"use client";

import { convertDate, convertDateTime, formatCurrency } from "@muahub/utils/Main";
import SendRequest from "@muahub/utils/SendRequest";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Table, Button, Modal, Form } from "react-bootstrap";
import toast from "react-hot-toast";

const HistoryBookingComponent = ({ currentUser }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [serviceFeedback, setServiceFeedback] = useState(null);
  const [feedback, setFeedback] = useState({ title: "", reason: "", rating: 0 });
  const [userFeedback, setUserFeedback] = useState([]);
  const [modalHuySan, setModalHuySan] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const onHuyDichVu = (booking) => {
    setSelectedBooking(booking);
    setModalHuySan(true);
  };

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    const res = await SendRequest("GET", "/api/orders/user", { userId: currentUser._id });
    if (res.payload) {
      setBookings(res.payload);
    }
    setLoading(false);
  }, [currentUser._id]);

  const handleCancelBooking = async () => {
    if (!currentUser.bank_info_number || !currentUser.bank_info) {
      toast.error("Bạn cần cập nhật thông tin ngân hàng để hủy dịch vụ!");
      return;
    }
    await SendRequest("PUT", "/api/orders", {
      id: selectedBooking._id,
      status: "cancelled"
    });
    await SendRequest("POST", "/api/refund", {
      totalAmount: selectedBooking.deposit,
      discount: 10,
      type: "cancel_booking",
      userId: currentUser._id,
      bank_info_number: currentUser.bank_info_number,
      bank_info: currentUser.bank_info,
      name: currentUser.name,
      email: currentUser.email,
      role: currentUser.role
    });
    fetchBookings();
    setModalHuySan(false);
    toast.success("Đã hủy dịch vụ thành công!. Tiền cọc sẽ được hoàn trả trong vòng 3-5 ngày làm việc.");
  };

  useEffect(() => {
    fetchBookings();
  }, [currentUser._id, fetchBookings, showModal]);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      const res = await SendRequest("GET", "/api/feedbacks");
      if (res.payload) {
        setUserFeedback(res.payload);
      }
    };
    fetchFeedbacks();
  }, [currentUser._id]);

  // disable feedback for bookings that have already been rated
  const ratedOrderIds = userFeedback
    .filter((feedback) => feedback.userId === currentUser._id)
    .map((feedback) => feedback.orderId);
  const bookingsFiltered = bookings.filter((booking) => !ratedOrderIds.includes(booking._id));

  const servicesRated = [];
  bookingsFiltered.forEach((booking) => {
    const matchedOrder = userFeedback.find(
      (feedback) => feedback.orderId === booking._id && feedback.userId === currentUser._id
    );

    if (matchedOrder && matchedOrder.service) {
      servicesRated.push({
        serviceId: matchedOrder.serviceId,
        serviceName: matchedOrder.service.serviceName
      });
    }
  });

  const handleFeedbackSubmit = async () => {
    if (!feedback.title || !feedback.reason || feedback.rating === 0) {
      alert("Vui lòng điền đầy đủ thông tin và chọn số sao đánh giá!");
      return;
    }

    const payload = {
      userId: currentUser._id,
      orderId: serviceFeedback._id,
      serviceId: serviceFeedback.serviceId,
      title: feedback.title,
      reason: feedback.reason,
      rating: feedback.rating
    };

    const res = await SendRequest("POST", "/api/feedbacks", payload);
    if (res) {
      toast.success("Phản ánh và đánh giá của bạn đã được gửi thành công!");
      setShowModal(false);
      setFeedback({ title: "", reason: "", rating: 0 });
      setServiceFeedback(null);

      const updatedBookings = bookings.map((booking) => {
        if (booking._id === serviceFeedback._id) {
          return { ...booking, rated: true };
        }
        return booking;
      });
      setBookings(updatedBookings);
    }

    const fetchBookings = async () => {
      const res = await SendRequest("GET", "/api/orders", { userId: currentUser._id });
      if (res) {
        setBookings(res.payload);
      }
    };
    fetchBookings();
    setShowModal(false);
  };

  const onFeedBack = (booking) => {
    setServiceFeedback(booking);
    setShowModal(true);
  };

  const renderStars = () => {
    return (
      <div className="d-flex align-items-center gap-2">
        <span>Đánh giá:</span>
        {[1, 2, 3, 4, 5].map((star) => (
          <i
            key={star}
            className={`fas fa-star ${feedback.rating >= star ? "text-warning" : "text-muted"}`}
            style={{
              cursor: "pointer",
              fontSize: "1.2rem",
              transition: "color 0.2s ease"
            }}
            onClick={() => setFeedback({ ...feedback, rating: star })}
            onMouseEnter={(e) => {
              // Highlight stars on hover
              const stars = e.target.parentElement.querySelectorAll(".fa-star");
              stars.forEach((s, index) => {
                if (index < star) {
                  s.classList.add("text-warning");
                  s.classList.remove("text-muted");
                } else {
                  s.classList.add("text-muted");
                  s.classList.remove("text-warning");
                }
              });
            }}
            onMouseLeave={() => {
              // Reset to selected rating
              const stars = document.querySelectorAll(".fa-star");
              stars.forEach((s, index) => {
                if (index < feedback.rating) {
                  s.classList.add("text-warning");
                  s.classList.remove("text-muted");
                } else {
                  s.classList.add("text-muted");
                  s.classList.remove("text-warning");
                }
              });
            }}
          />
        ))}
        <span className="text-muted ms-2">{feedback.rating > 0 ? `${feedback.rating}/5 sao` : "Chọn số sao"}</span>
      </div>
    );
  };

  const checkTime = (booking) => {
    const isAlreadyRated = ratedOrderIds.includes(booking._id);
    
    // Parse booking date and time để tính thời gian đánh giá
    const [startTime] = booking.time.split(" - ");
    const [year, month, day] = booking.date.split("-").map(Number);
    const [hour, minute] = startTime.split(":").map(Number);
    const bookingDateTime = new Date(year, month - 1, day, hour, minute);
    
    // Kiểm tra xem có phải đặt trong ngày không
    const today = new Date();
    const bookingDate = new Date(booking.date);
    today.setHours(0, 0, 0, 0);
    bookingDate.setHours(0, 0, 0, 0);
    const isToday = bookingDate.getTime() === today.getTime();

    // Nếu đặt trong ngày, không cho phép hủy
    if (isToday) {
      return {
        isAlreadyRated,
        canCancel: false,
        canRate: false,
        isToday: true,
        remainingTimeToCancel: 0,
        bookingDateTime
      };
    }

    // Lấy thời gian tạo (MongoDB lưu UTC, new Date() sẽ tự chuyển sang giờ địa phương)
    const createdTime = new Date(booking.created_at);
    
    const now = new Date();
    const oneHourInMs = 60 * 60 * 1000; // 1 tiếng tính bằng milliseconds
    
    // Tính thời gian còn lại để hủy (1 tiếng từ lúc tạo)
    const cancelDeadline = new Date(createdTime.getTime() + oneHourInMs);
    const remainingTimeToCancel = Math.floor((cancelDeadline - now) / (60 * 1000)); // Còn bao nhiêu phút

    // Cho phép hủy nếu trong vòng 1 tiếng từ lúc tạo
    const canCancel = now < cancelDeadline;
    
    // Cho phép đánh giá nếu đã qua thời gian dịch vụ
    const canRate = now > bookingDateTime;

    return { 
      isAlreadyRated, 
      canCancel, 
      canRate, 
      bookingDateTime,
      isToday: false,
      remainingTimeToCancel: remainingTimeToCancel
    };
  };

  return (
    <div className="w-100 overflow-auto">
      {/* Bảng cho desktop (từ md trở lên) */}
      <div className="d-none d-md-block">
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th className="text-center">Dịch vụ</th>
              <th className="text-center">Ngày đặt</th>
              <th className="text-center">Loại dịch vụ</th>
              <th className="text-center">Mã dịch vụ</th>
              <th className="text-center">Khung giờ</th>
              <th className="text-center">Tiền cọc</th>
              <th className="text-center">Còn lại</th>
              <th className="text-center">Đánh giá</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan="7" className="text-center">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </td>
              </tr>
            )}
            {bookings.map((booking) => {
              const { isAlreadyRated, canCancel, canRate, isToday, remainingTimeToCancel } = checkTime(booking);

              return (
                <tr key={booking._id}>
                  <td>
                    <Link href={`/make-up/${booking.serviceId}`}>{booking.service?.serviceName}</Link>
                  </td>
                  <td>{convertDate(booking.date)}</td>
                  <td>Dịch vụ {booking.field} người</td>
                  <td>Dịch vụ số {booking.fieldSlot + 1}</td>
                  <td>{booking.time}</td>
                  <td>{formatCurrency(booking.deposit)}</td>
                  <td>{formatCurrency(booking.remaining)}</td>
                  <td className="text-center">
                      <button
                        className={`btn btn-sm ${isAlreadyRated ? "btn-secondary" : "btn-primary"}`}
                        onClick={() => onFeedBack(booking)}
                        disabled={isAlreadyRated || !canRate}
                        title={isAlreadyRated ? "Bạn đã đánh giá dịch vụ này rồi" : "Phản ánh và đánh giá"}
                      >
                        <i className="fas fa-comment me-1"></i>
                        <i className="fas fa-star"></i>
                        {isAlreadyRated && <span className="ms-1">✓</span>}
                      </button>

                      {!isToday && canCancel && remainingTimeToCancel > 0 && (
                        <div className="d-inline-block">
                          <button
                            className="btn btn-sm btn-danger ms-2"
                            title={`Còn ${Math.floor(remainingTimeToCancel / 60)} giờ ${remainingTimeToCancel % 60} phút để hủy`}
                            onClick={() => onHuyDichVu(booking)}
                          >
                            Hủy dịch vụ
                          </button>
                          <small className="d-block text-muted mt-1">
                            Còn {Math.floor(remainingTimeToCancel / 60)} giờ {remainingTimeToCancel % 60} phút để hủy
                          </small>
                        </div>
                      )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>

      {/* Danh sách card cho mobile (dưới md) */}
      <div className="d-block d-md-none">
        {loading && (
          <div className="text-center my-3">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}
          {bookings.map((booking) => {
          const { isAlreadyRated, canCancel, canRate, isToday, remainingTimeToCancel } = checkTime(booking);          return (
            <div key={booking._id} className="card mb-3 shadow-sm">
              <div className="card-body">
                <h6 className="card-title mb-1">
                  <Link href={`/make-up/${booking.serviceId}`} className="text-decoration-none">
                    {booking.service?.serviceName}
                  </Link>
                </h6>
                <div className="mb-1">
                  <strong>Ngày đặt:</strong> {convertDate(booking.date)}
                </div>
                <div className="mb-1">
                  <strong>Loại dịch vụ:</strong> Dịch vụ {booking.field}
                </div>
                <div className="mb-1">
                  <strong>Khung giờ:</strong> {booking.time}
                </div>
                <div className="mb-1">
                  <strong>Tiền cọc:</strong> {formatCurrency(booking.deposit)}
                </div>
                <div className="mb-2">
                  <strong>Còn lại:</strong> {formatCurrency(booking.remaining)}
                </div>
                <div className="text-center">
                  
                    <button
                      className={`btn btn-sm ${isAlreadyRated ? "btn-secondary" : "btn-primary"}`}
                      onClick={() => onFeedBack(booking)}
                      disabled={isAlreadyRated || !canRate}
                      title={isAlreadyRated ? "Bạn đã đánh giá dịch vụ này rồi" : "Phản ánh và đánh giá"}
                    >
                      <i className="fas fa-comment me-1"></i>
                      <i className="fas fa-star"></i>
                      {isAlreadyRated && <span className="ms-1">✓</span>}
                    </button>

                  {/* Hủy dịch vụ */}
                    {!isToday && canCancel && remainingTimeToCancel > 0 && (
                      <div className="d-inline-block">
                        <button
                          className="btn btn-sm btn-danger ms-2"
                          title={`Còn ${Math.floor(remainingTimeToCancel / 60)} giờ ${remainingTimeToCancel % 60} phút để hủy`}
                          onClick={() => onHuyDichVu(booking)}
                        >
                          Hủy dịch vụ
                        </button>
                        <small className="d-block text-muted mt-1">
                          Còn {Math.floor(remainingTimeToCancel / 60)} giờ {remainingTimeToCancel % 60} phút để hủy
                        </small>
                      </div>
                    )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for Feedback and Rating */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            Phản ánh và đánh giá dịch vụ
            <div className="text-muted" style={{ fontSize: "0.8rem" }}>
              {serviceFeedback?.service?.serviceName} - {new Date(serviceFeedback?.date).toLocaleDateString()} - Dịch vụ{" "}
              {serviceFeedback?.field} - {serviceFeedback?.time}
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {/* Rating Section */}
            <Form.Group className="mb-3">
              <Form.Label>Đánh giá dịch vụ</Form.Label>
              <div className="border rounded p-3 bg-light">{renderStars()}</div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Tiêu đề</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nhập tiêu đề"
                value={feedback.title}
                onChange={(e) => setFeedback({ ...feedback, title: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Lý do</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Nhập lý do phản ánh"
                value={feedback.reason}
                onChange={(e) => setFeedback({ ...feedback, reason: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleFeedbackSubmit}>
            Gửi phản ánh và đánh giá
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal for Cancel Booking */}
      <Modal show={modalHuySan} onHide={() => setModalHuySan(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-exclamation-triangle text-danger me-2"></i> Xác nhận hủy dịch vụ
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="alert alert-warning" role="alert">
            <p className="mb-2">
              Bạn có chắc chắn muốn <strong className="text-danger">hủy dịch vụ</strong> này không?
            </p>
            <ul className="mb-0">
              <li>
                <strong>Dịch vụ:</strong> {selectedBooking?.service?.serviceName}
              </li>
              <li>
                <strong>Ngày:</strong> {convertDate(selectedBooking?.date)}
              </li>
              <li>
                <strong>Loại dịch vụ:</strong> Dịch vụ {selectedBooking?.field}
              </li>
              <li>
                <strong>Khung giờ:</strong> {selectedBooking?.time}
              </li>
            </ul>
          </div>
          <p className="text-muted small mb-0">* Sau khi hủy, bạn sẽ không thể khôi phục đặt dịch vụ này.</p>
          {/* role huy se hoan tien nhung tru 10% */}
          <p className="text-muted small">
            * Bạn sẽ được hoàn tiền cọc, nhưng sẽ bị trừ 10% phí hủy dịch vụ theo quy định của chúng tôi.
          </p>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setModalHuySan(false)}>
            Đóng
          </Button>
          <Button variant="danger" onClick={handleCancelBooking}>
            <i className="fas fa-times-circle me-1"></i> Xác nhận hủy
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default HistoryBookingComponent;
