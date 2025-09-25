"use client";

import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination } from "swiper/modules";
import { useApp } from "@quanlysanbong/app/contexts/AppContext";
import toast from "react-hot-toast";
import SendRequest from "@quanlysanbong/utils/SendRequest";
import { usePathname } from "next/navigation";
import { formatCurrency } from "@quanlysanbong/utils/Main";
import OrderStadiumModal from "./OrderStadiumModal";
import { ROLE_MANAGER } from "@quanlysanbong/constants/System";
import Link from "next/link";
import { Button, Card, Form, Modal, Collapse } from "react-bootstrap";
import { Avatar, Box, Typography } from "@mui/material";

const SanBongDetail = () => {
  const { currentUser } = useApp();
  const pathUrl = usePathname();
  const id = pathUrl.split("/").pop();

  const [stadiumData, setStadiumData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [replies, setReplies] = useState({});
  const [showReplies, setShowReplies] = useState({});
  const [pageDanhGia, setPageDanhGia] = useState(1);
  const [pageComments, setPageComments] = useState(1);
  const [repliesByComment, setRepliesByComment] = useState({});
  const [replyInputByComment, setReplyInputByComment] = useState({});
  const [openReplyBox, setOpenReplyBox] = useState({});

  // States cho comments
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComment, setLoadingComment] = useState(false);
  const [commentImages, setCommentImages] = useState([]); // File[]
  const [commentImagePreviews, setCommentImagePreviews] = useState([]); // string[]

  useEffect(() => {
    const fetchStadiumData = async (id) => {
      const res = await SendRequest("get", `/api/stadiums/${id}`);
      if (res.payload) {
        setStadiumData(res.payload);
      }
    };
    if (id) {
      fetchStadiumData(id);
    }
  }, [id]);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      const res = await SendRequest("GET", "/api/feedbacks");
      if (res) {
        const stadiumFeedbacks = res.payload.filter(
          (feedback) => feedback.stadiumId && feedback.stadiumId.toString() === id
        );
        setFeedbacks(stadiumFeedbacks);
      }
    };
    if (id) {
      fetchFeedbacks();
    }
  }, [id]);

  useEffect(() => {
    const fetchReplies = async () => {
      const res = await SendRequest("GET", "/api/users/replies");

      if (res) {
        const repliesByFeedback = {};
        res.payload.forEach((reply) => {
          if (!repliesByFeedback[reply.feedbackId]) {
            repliesByFeedback[reply.feedbackId] = [];
          }
          repliesByFeedback[reply.feedbackId].push(reply);
        });
        setReplies(repliesByFeedback);
      }
    };
    fetchReplies();
  }, []);

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      if (id) {
        const res = await SendRequest("GET", `/api/comments?stadiumId=${id}`);

        if (res) {
          setComments(res.payload);
          // Load replies for these comments
          const allIds = res.payload.map((c) => c._id);
          const replyPromises = allIds.map((cid) => SendRequest("GET", `/api/comment-replies?commentId=${cid}`));
          const all = await Promise.all(replyPromises);
          const map = {};
          all.forEach((r, idx) => {
            if (r?.payload) map[allIds[idx]] = r.payload;
          });
          setRepliesByComment(map);
        }
      }
    };
    fetchComments();
  }, [id]);

  const handleOrder = () => {
    if (currentUser) {
      setShowModal(true);
    } else {
      toast.error("Vui lòng đăng nhập để đặt lịch");
    }
  };

  const handleReply = (feedback) => {
    setSelectedFeedback(feedback);
    setShowReplyModal(true);
  };

  const toggleReplies = (feedbackId) => {
    setShowReplies((prev) => ({
      ...prev,
      [feedbackId]: !prev[feedbackId]
    }));
  };

  const submitReply = async () => {
    if (!replyContent.trim()) {
      toast.error("Vui lòng nhập nội dung phản hồi");
      return;
    }

    const payload = {
      feedbackId: selectedFeedback._id,
      userId: currentUser._id,
      content: replyContent
    };

    try {
      const res = await SendRequest("POST", "/api/users/replies", payload);

      if (res) {
        toast.success("Phản hồi đã được gửi thành công!");
        setShowReplyModal(false);
        setReplyContent("");
        setSelectedFeedback(null);

        const repliesRes = await SendRequest("GET", "/api/users/replies");

        if (repliesRes) {
          const repliesByFeedback = {};
          repliesRes.payload.forEach((reply) => {
            if (!repliesByFeedback[reply.feedbackId]) {
              repliesByFeedback[reply.feedbackId] = [];
            }
            repliesByFeedback[reply.feedbackId].push(reply);
          });
          setReplies(repliesByFeedback);
        }
      } else {
        toast.error(res.error || "Có lỗi xảy ra khi gửi phản hồi");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi gửi phản hồi");
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const ok = typeof window !== "undefined" ? window.confirm("Xóa bình luận này?") : true;
      if (!ok) return;
      const res = await SendRequest("DELETE", "/api/comments", { _id: commentId });
      if (res) {
        toast.success("Đã xóa bình luận");
        const commentsRes = await SendRequest("GET", `/api/comments?stadiumId=${id}`);
        if (commentsRes) setComments(commentsRes.payload);
      } else {
        toast.error(res?.error || "Xóa bình luận thất bại");
      }
    } catch (err) {
      toast.error("Có lỗi khi xóa bình luận");
    }
  };

  // Handle submit comment
  const handleSubmitComment = async () => {
    if (!currentUser || Object.keys(currentUser).length === 0) {
      toast.error("Vui lòng đăng nhập để bình luận");
      return;
    }

    if (!newComment.trim()) {
      toast.error("Vui lòng nhập nội dung bình luận");
      return;
    }

    setLoadingComment(true);

    try {
      let imageUrls = [];
      // Upload nhiều ảnh nếu có
      if (Array.isArray(commentImages) && commentImages.length > 0) {
        const uploadTasks = commentImages.map(async (file) => {
          const formData = new FormData();
          formData.append("file", file);
          const response = await fetch("/api/upload", { method: "POST", body: formData });
          if (!response.ok) throw new Error("Lỗi khi tải ảnh lên");
          const data = await response.json();
          return data.url;
        });
        imageUrls = await Promise.all(uploadTasks);
      }

      const payload = {
        stadiumId: id,
        userId: currentUser._id,
        content: newComment.trim(),
        images: imageUrls
      };

      const res = await SendRequest("POST", "/api/comments", payload);

      if (res) {
        toast.success("Bình luận đã được gửi thành công!");
        setNewComment("");
        setCommentImages([]);
        setCommentImagePreviews([]);

        // Refresh comments - PHẢI có stadiumId
        const commentsRes = await SendRequest("GET", `/api/comments?stadiumId=${id}`);
        if (commentsRes) {
          setComments(commentsRes.payload);
        }
      } else {
        toast.error(res?.error || "Có lỗi xảy ra 222 khi gửi bình luận");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi gửi bình luận");
    } finally {
      setLoadingComment(false);
    }
  };

  const handleCommentImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setCommentImages((prev) => [...prev, ...files]);
    const urls = files.map((f) => {
      try {
        return URL.createObjectURL(f);
      } catch {
        return "";
      }
    });
    setCommentImagePreviews((prev) => [...prev, ...urls]);
  };

  const handlePasteIntoComment = (e) => {
    if (!e.clipboardData || !e.clipboardData.items) return;
    const item = Array.from(e.clipboardData.items).find((it) => it.type && it.type.startsWith("image/"));
    if (!item) return;
    const file = item.getAsFile();
    if (!file) return;
    setCommentImages((prev) => [...prev, file]);
    try {
      const url = URL.createObjectURL(file);
      setCommentImagePreviews((prev) => [...prev, url]);
    } catch (err) {
      // ignore
    }
  };

  const clearCommentImage = (index) => {
    setCommentImages((prev) => prev.filter((_, i) => i !== index));
    setCommentImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const renderStars = (rating) => {
    return (
      <div className="d-flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <i
            key={star}
            className={`fas fa-star ${rating >= star ? "text-warning" : "text-muted"}`}
            style={{ fontSize: "1rem" }}
          />
        ))}
        <span className="ms-2 text-muted">({rating}/5)</span>
      </div>
    );
  };

  const getAverageRating = () => {
    if (feedbacks.length === 0) return 0;
    const totalRating = feedbacks.reduce((sum, feedback) => sum + (feedback.rating || 0), 0);
    return (totalRating / feedbacks.length).toFixed(1);
  };

  const isStadiumOwner = (userId) => {
    return stadiumData && stadiumData.owner && stadiumData.owner._id === userId;
  };

  if (!stadiumData) return <p className="text-center">Đang tải dữ liệu...</p>;

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-md-12 mb-4">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <div className="d-flex align-items-center mb-4">
                <div className="flex-shrink-0">
                  <div className="position-relative">
                    <Avatar
                      alt={stadiumData.owner.name}
                      src={stadiumData.owner.avatar}
                      sx={{ width: 80, height: 80 }}
                    />
                    <div 
                      className="position-absolute" 
                      style={{ 
                        bottom: -5, 
                        right: -5, 
                        background: '#E91E63', 
                        borderRadius: '50%',
                        padding: '4px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }}
                    >
                      <i className="fas fa-crown text-white"></i>
                    </div>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h2 className="mb-1" style={{ color: '#E91E63' }}>{stadiumData.stadiumName}</h2>
                  <p className="text-muted mb-0">
                    <i className="fas fa-user-circle me-2"></i>
                    Chuyên viên: <strong>{stadiumData.owner.name}</strong>
                    {stadiumData.owner.phone && (
                      <a href={`tel:${stadiumData.owner.phone}`} className="ms-2 text-decoration-none">
                        <i className="fas fa-phone-alt me-1"></i>
                        {stadiumData.owner.phone}
                      </a>
                    )}
                  </p>
                </div>
              </div>

              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <div className="d-flex align-items-center">
                    <i className="fas fa-map-marker-alt text-primary me-2"></i>
                    <div>
                      <small className="text-muted d-block">Địa điểm</small>
                      <strong>{stadiumData.locationDetail}, {stadiumData.location}</strong>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="d-flex align-items-center">
                    <i className="fas fa-clock text-primary me-2"></i>
                    <div>
                      <small className="text-muted d-block">Giờ làm việc</small>
                      <strong>{stadiumData.openingTime} - {stadiumData.closingTime}</strong>
                    </div>
                  </div>
                </div>
                {(stadiumData.experienceYears || stadiumData.experienceMonths) && (
                  <div className="col-md-6">
                    <div className="d-flex align-items-center">
                      <i className="fas fa-medal text-primary me-2"></i>
                      <div>
                        <small className="text-muted d-block">Kinh nghiệm</small>
                        <strong>
                          {stadiumData.experienceYears || 0} năm {stadiumData.experienceMonths || 0} tháng
                        </strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <h5 className="mb-3">
                  <i className="fas fa-palette me-2" style={{ color: '#E91E63' }}></i>
                  Bảng giá dịch vụ
                </h5>
                <div className="row g-3">
                  {Object.values(stadiumData.fields)
                    .filter((f) => f.isAvailable)
                    .map((service, index) => (
                      <div key={index} className="col-md-6">
                        <div className="p-3 border rounded bg-light">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <h6 className="mb-1">{service.name}</h6>
                              <small className="text-muted">Thời gian: {service.timeMatch} phút</small>
                            </div>
                            <div className="text-end">
                              <h5 className="mb-0 text-primary">{formatCurrency(service.price)}</h5>
                              {service.count > 1 && (
                                <small className="text-success">
                                  <i className="fas fa-users me-1"></i>
                                  Phục vụ {service.count} khách/lần
                                </small>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="mb-3">
                <h5 className="mb-3">
                  <i className="fas fa-star me-2" style={{ color: '#E91E63' }}></i>
                  Tiện ích & Dịch vụ đi kèm
                </h5>
                <div className="d-flex flex-wrap gap-2">
                  {stadiumData?.amenities?.map((amenity, index) => (
                    <span
                      key={index}
                      className="badge"
                      style={{
                        background: 'linear-gradient(45deg, #E91E63, #ad1457)',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        fontSize: '0.9rem'
                      }}
                    >
                      <i className="fas fa-check-circle me-1"></i>
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>

          {feedbacks.length > 0 && (
            <div className="mb-3">
              <strong>Đánh giá:</strong>
              <div className="d-flex align-items-center">
                {renderStars(parseFloat(getAverageRating()))}
                <span className="ms-2">({feedbacks.length} đánh giá)</span>
              </div>
            </div>
          )}

          {currentUser && currentUser.role === ROLE_MANAGER.USER && (
            <button
              className="btn btn-primary w-100 btn-lg"
              onClick={handleOrder}
              disabled={currentUser.active !== true || currentUser.role !== ROLE_MANAGER.USER}
            >
              Đặt lịch makeup
            </button>
          )}

          {currentUser && currentUser.active !== true && (
            <div className="alert alert-warning mt-3">
              <strong>Chú ý:</strong> Tài khoản của bạn chưa được kích hoạt. Vui lòng kiểm tra email để xác nhận tài
              khoản hoặc liên hệ với quản trị viên để được hỗ trợ.
            </div>
          )}

          {Object.keys(currentUser).length === 0 && (
            <Link href="/dang-nhap">
              <button className="btn btn-primary mt-3 w-100 btn-lg">Đăng nhập để đặt lịch</button>
            </Link>
          )}
        </div>
      </div>
    </div>

        {showModal && (
          <OrderStadiumModal
            show={showModal}
            handleClose={() => setShowModal(false)}
            stadiumData={stadiumData}
            currentUser={currentUser}
          />
        )}
        <div className="col-md-12 mt-4">
          <h4>Mô tả dịch vụ</h4>
          <p>{stadiumData.description}</p>
          <Swiper modules={[Navigation, Pagination]} navigation pagination={{ clickable: true }} className="mb-4">
            {stadiumData.images.map((image, index) => (
              <SwiperSlide key={index}>
                {/* <img src={image} className="img-fluid w-100 rounded" alt="Dịch vụ makeup" /> */}
                 <img src={"/img/ab0.jpg"} className="img-fluid w-100 rounded" alt="Dịch vụ makeup" />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
        <div className="col-md-12 mt-4">
          <h4>Vị trí trên bản đồ</h4>
          {stadiumData && (
            <iframe
              src={`https://maps.google.com/maps?width=600&height=400&hl=en&q=${encodeURIComponent(
                stadiumData.locationDetail + ", " + stadiumData.location
              )}&t=&z=14&ie=UTF8&iwloc=B&output=embed`}
              width="100%"
              height="300"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
            ></iframe>
          )}
        </div>
        <div className="col-md-12 mt-4">
          <h4>Đánh giá từ khách hàng</h4>
          {feedbacks.length > 0 ? (
            <div>
              {feedbacks.slice((pageDanhGia - 1) * 5, pageDanhGia * 5).map((feedback) => (
                <Card key={feedback._id} className="mb-3">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <h6 className="mb-1">{feedback.user?.name || "Người dùng ẩn danh"}</h6>
                        {renderStars(feedback.rating || 0)}
                        <h6 className="mt-2">{feedback.title}</h6>
                        <p className="mb-2">{feedback.reason}</p>
                        <small className="text-muted">
                          {new Date(feedback.created_at).toLocaleDateString("vi-VN")}
                        </small>
                      </div>
                      {currentUser && Object.keys(currentUser).length > 0 && (
                        <Button variant="outline-primary" size="sm" onClick={() => handleReply(feedback)}>
                          <i className="fas fa-reply me-1"></i>
                          Phản hồi
                        </Button>
                      )}
                    </div>

                    <div className="mt-2">
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0 text-decoration-none"
                        onClick={() => toggleReplies(feedback._id)}
                      >
                        {showReplies[feedback._id]
                          ? "Ẩn bình luận"
                          : `Xem bình luận (${replies[feedback._id]?.length || 0})`}
                      </Button>
                    </div>

                    <Collapse in={showReplies[feedback._id]}>
                      <div className="mt-3 ps-4 border-start border-2 border-primary">
                        <h6 className="text-muted mb-3">
                          <i className="fas fa-comments me-2"></i>
                          Bình luận ({replies[feedback._id]?.length || 0})
                        </h6>
                        {replies[feedback._id]?.map((reply) => (
                          <div key={reply._id} className="mb-3 p-3 bg-light rounded">
                            <div className="d-flex justify-content-between align-items-start">
                              <div className="d-flex align-items-center">
                                <strong className="me-2">{reply.user?.name || "Người dùng ẩn danh"}</strong>
                                {isStadiumOwner(reply.userId) && (
                                  <span className="badge bg-success">
                                    <i className="fas fa-crown me-1"></i>
                                    Chuyên viên
                                  </span>
                                )}
                              </div>
                              <small className="text-muted">
                                {new Date(reply.created_at).toLocaleDateString("vi-VN")}
                              </small>
                            </div>
                            <p className="mb-0 mt-2">{reply.content}</p>
                          </div>
                        ))}
                      </div>
                    </Collapse>
                  </Card.Body>
                </Card>
              ))}
              {/* Pagination for feedbacks */}
              {feedbacks.length > 5 && (
                <div className="d-flex justify-content-center mt-3">
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    className="me-2"
                    disabled={pageDanhGia === 1}
                    onClick={() => setPageDanhGia((prev) => prev - 1)}
                  >
                    Trước
                  </Button>
                  <span className="align-self-center">
                    Trang {pageDanhGia} / {Math.ceil(feedbacks.length / 5)}
                  </span>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    className="ms-2"
                    disabled={pageDanhGia === Math.ceil(feedbacks.length / 5)}
                    onClick={() => setPageDanhGia((prev) => prev + 1)}
                  >
                    Sau
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted">Chưa có đánh giá nào cho dịch vụ này.</p>
          )}
        </div>
        {/* Phần bình luận về dịch vụ */}
        <div className="col-md-12 mt-5">
          <div className="border-top pt-4">
            <h4 className="mb-4">
              <i className="fas fa-comments me-2"></i>
              Bình luận về dịch vụ ({comments?.length})
            </h4>

            {/* Form bình luận */}
            {currentUser && Object.keys(currentUser).length > 0 ? (
              <Card className="mb-4">
                <Card.Body>
                  <div className="d-flex align-items-start">
                    <div className="flex-shrink-0 me-3">
                      <div
                        className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                        style={{ width: "40px", height: "40px" }}
                      >
                        <Avatar
                          alt={currentUser?.name || "Người dùng ẩn danh"}
                          src={currentUser?.avatar || ""}
                          sx={{ width: 40, height: 40 }}
                        />
                      </div>
                    </div>
                    <div className="flex-grow-1">
                      <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder="Chia sẻ ý kiến của bạn về dịch vụ này..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onPaste={handlePasteIntoComment}
                        disabled={loadingComment}
                      />
                      <div className="d-flex align-items-center mt-2 flex-wrap">
                        <input type="file" accept="image/*" multiple onChange={handleCommentImageChange} />
                        {commentImagePreviews.map((preview, idx) => (
                          <div
                            key={idx}
                            className="ms-2 mt-2"
                            style={{ position: "relative", display: "inline-block" }}
                          >
                            <img
                              src={preview}
                              alt="Xem trước ảnh bình luận"
                              style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 6 }}
                            />
                            <span
                              onClick={() => clearCommentImage(idx)}
                              role="button"
                              aria-label="Xóa ảnh"
                              title="Xóa ảnh"
                              style={{
                                position: "absolute",
                                top: -6,
                                right: -6,
                                width: 20,
                                height: 20,
                                borderRadius: "50%",
                                background: "#dc3545",
                                color: "#fff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 700,
                                lineHeight: 1,
                                cursor: "pointer",
                              }}
                            >
                              ×
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="d-flex justify-content-end mt-2">
                        <Button
                          variant="primary"
                          onClick={handleSubmitComment}
                          disabled={loadingComment || !newComment.trim()}
                        >
                          {loadingComment ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                                aria-hidden="true"
                              ></span>
                              Đang gửi...
                            </>
                          ) : (
                            "Gửi bình luận"
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            ) : (
              <Card className="mb-4">
                <Card.Body className="text-center">
                  <p className="mb-3">Bạn cần đăng nhập để có thể bình luận</p>
                  <Link href="/dang-nhap">
                    <Button variant="primary">Đăng nhập</Button>
                  </Link>
                </Card.Body>
              </Card>
            )}

            {comments?.length > 0 ? (
              <div>
                {comments.slice((pageComments - 1) * 5, pageComments * 5).map((comment) => (
                  <Card key={comment._id} className="mb-3">
                    <Card.Body>
                      <div className="d-flex align-items-start">
                        <div className="flex-shrink-0 me-3">
                          {/* avatar img */}
                          <div
                            className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                            style={{ width: "40px", height: "40px" }}
                          >
                            <Avatar
                              alt={comment.user?.name || "Người dùng ẩn danh"}
                              src={comment.user?.avatar || ""}
                              sx={{ width: 40, height: 40 }}
                            />
                          </div>
                        </div>
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <h6 className="mb-1 d-flex align-items-center">
                                {comment.user?.name || "Người dùng ẩn danh"}
                                {isStadiumOwner(comment.user?._id) && (
                                  <span className="badge bg-success ms-2">
                                    <i className="fas fa-crown me-1"></i>
                                    Chuyên viên
                                  </span>
                                )}
                              </h6>
                              <small className="text-muted">
                                {new Date(comment.created_at).toLocaleDateString("vi-VN", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit"
                                })}
                              </small>
                            </div>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDeleteComment(comment._id)}
                              title="Xóa bình luận"
                            >
                              <i className="fas fa-trash-alt"></i>
                            </Button>
                          </div>
                          <p className="mb-0 mt-2">{comment.content}</p>
                          {/* Replies list */}
                          {Array.isArray(repliesByComment[comment._id]) && repliesByComment[comment._id].length > 0 && (
                            <div className="mt-2 ps-3 border-start">
                              {repliesByComment[comment._id].map((rep) => (
                                <div key={rep._id} className="mb-2">
                                  <small className="text-muted d-block">{new Date(rep.created_at).toLocaleString("vi-VN")}</small>
                                  <div>{rep.content}</div>
                                </div>
                              ))}
                            </div>
                          )}
                          {/* Reply box */}
                          <div className="mt-2">
                            <Button
                              variant="link"
                              size="sm"
                              className="p-0"
                              onClick={() => setOpenReplyBox((prev) => ({ ...prev, [comment._id]: !prev[comment._id] }))}
                            >
                              Trả lời
                            </Button>
                            {openReplyBox[comment._id] && (
                              <div className="d-flex mt-2">
                                <Form.Control
                                  size="sm"
                                  placeholder="Viết phản hồi..."
                                  value={replyInputByComment[comment._id] || ""}
                                  onChange={(e) =>
                                    setReplyInputByComment((prev) => ({ ...prev, [comment._id]: e.target.value }))
                                  }
                                />
                                <Button
                                  size="sm"
                                  className="ms-2"
                                  onClick={async () => {
                                    const content = (replyInputByComment[comment._id] || "").trim();
                                    if (!currentUser || !content) return;
                                    const res = await SendRequest("POST", "/api/comment-replies", {
                                      commentId: comment._id,
                                      userId: currentUser._id,
                                      content
                                    });
                                    if (res?.success) {
                                      const listRes = await SendRequest(
                                        "GET",
                                        `/api/comment-replies?commentId=${comment._id}`
                                      );
                                      setRepliesByComment((prev) => ({
                                        ...prev,
                                        [comment._id]: listRes?.payload || []
                                      }));
                                      setReplyInputByComment((prev) => ({ ...prev, [comment._id]: "" }));
                                    }
                                  }}
                                >
                                  Gửi
                                </Button>
                              </div>
                            )}
                          </div>
                          {Array.isArray(comment.images) && comment.images.length > 0 && (
                            <div className="mt-2">
                              {comment.images.map((imgUrl, i) => (
                                <img
                                  key={i}
                                  src={imgUrl}
                                  alt="Ảnh đính kèm bình luận"
                                  style={{ maxWidth: "100%", borderRadius: 8, marginRight: 8, marginBottom: 8 }}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                ))}
                {/* Pagination for comments */}
                {comments.length > 5 && (
                  <div className="d-flex justify-content-center mt-3">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      className="me-2"
                      disabled={pageComments === 1}
                      onClick={() => setPageComments((prev) => prev - 1)}
                    >
                      Trước
                    </Button>
                    <span className="align-self-center">
                      Trang {pageComments} / {Math.ceil(comments.length / 5)}
                    </span>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      className="ms-2"
                      disabled={pageComments === Math.ceil(comments.length / 5)}
                      onClick={() => setPageComments((prev) => prev + 1)}
                    >
                      Sau
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <Card>
                <Card.Body className="text-center text-muted">
                  <i className="fas fa-comment-slash fa-3x mb-3"></i>
                  <p>Chưa có bình luận nào cho dịch vụ này. Hãy là người đầu tiên chia sẻ ý kiến!</p>
                </Card.Body>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Modal đặt lịch */}
      <OrderStadiumModal open={showModal} onClose={() => setShowModal(false)} stadiumData={stadiumData} />

      {/* Modal phản hồi */}
      <Modal show={showReplyModal} onHide={() => setShowReplyModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Phản hồi đánh giá</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedFeedback && (
            <div className="mb-3">
              <h6>Đánh giá của: {selectedFeedback.user?.name || "Người dùng ẩn danh"}</h6>
              <p className="text-muted">"{selectedFeedback.reason}"</p>
            </div>
          )}
          <Form.Group>
            <Form.Label>Nội dung phản hồi</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Nhập nội dung phản hồi..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReplyModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={submitReply}>
            Gửi phản hồi
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SanBongDetail;
