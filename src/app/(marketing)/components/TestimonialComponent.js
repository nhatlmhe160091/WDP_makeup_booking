import Image from "next/image";

const TestimonialComponent = () => {
  const testimonials = [
    {
      id: 1,
      name: "Nguyễn Văn A",
      role: "Cầu Thủ Nghiệp Dư",
      text: "Dịch vụ đặt dịch vụ cực kỳ nhanh chóng và tiện lợi. Makeup chất lượng, đội ngũ hỗ trợ nhiệt tình. Tôi rất hài lòng!",
      image: "/img/testimonial-1.jpg",
      stars: 5
    },
    {
      id: 2,
      name: "Trần Thị B",
      role: "Người Yêu Thể Thao",
      text: "Hệ thống đặt dịch vụ dễ sử dụng, nhiều khung giờ trống để lựa chọn. Tôi đã giới thiệu cho bạn bè cùng sử dụng.",
      image: "/img/testimonial-2.jpg",
      stars: 4.5
    },
    {
      id: 3,
      name: "Lê Văn C",
      role: "Huấn Luyện Viên Bóng Đá",
      text: "Makeup đẹp, chu đáo, đặt dịch vụ nhanh chóng mà không cần phải gọi điện nhiều lần. Rất đáng để trải nghiệm!",
      image: "/img/testimonial-3.jpg",
      stars: 5
    }
  ];

  const renderStars = (stars) => {
    const fullStars = Math.floor(stars);
    const halfStar = stars % 1 !== 0;

    const starElements = [];
    for (let i = 0; i < fullStars; i++) {
      starElements.push(<i key={`full-star-${i}`} className="fas fa-star"></i>);
    }
    if (halfStar) {
      starElements.push(<i key="half-star" className="fas fa-star-half-alt"></i>);
    }
    while (starElements.length < 5) {
      starElements.push(<i key={`empty-star-${starElements.length}`} className="fas fa-star"></i>);
    }

    return starElements;
  };

  return (
    <div className="container-fluid testimonial pb-5" style={{ background: "rgba(248,187,208,0.08)" }}>
      <div className="container pb-5">
        <div className="text-center mx-auto pb-5 wow fadeInUp" data-wow-delay="0.2s" style={{ maxWidth: "800px" }}>
          <h4 style={{ color: "#ff5c95ff", fontWeight: 600 }}>Đánh Giá</h4>
          <h1 className="display-5 mb-4">Khách Hàng Nói Gì Về Chúng Tôi?</h1>
          <p className="mb-0">
            Những phản hồi thực tế từ các khách hàng đã trải nghiệm dịch vụ đặt lịch makeup tại hệ thống của chúng tôi.
            Chúng tôi luôn cam kết mang lại trải nghiệm tốt nhất cho mọi người chơi.
          </p>
        </div>
        <div className="row justify-content-center">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="col-lg-4 col-md-6 col-12 mb-4">
              <div className="card h-100 rounded-4 shadow-sm p-4">
                <div className="d-flex align-items-start mb-3">
                  <div className="me-3 text-muted" style={{ fontSize: '28px' }}>
                    <i className="fas fa-quote-left" style={{ color: '#ff5c95ff' }}></i>
                  </div>
                  <div className="testimonial-img me-3">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      width={80}
                      height={80}
                      className="img-fluid rounded-circle"
                    />
                  </div>
                  <div>
                    <h5 className="mb-0">{testimonial.name}</h5>
                    <p className="mb-0 text-secondary small">{testimonial.role}</p>
                  </div>
                </div>
                <div className="testimonial-text mb-3">
                  <p className="mb-0 text-dark">{testimonial.text}</p>
                </div>
                <div className="d-flex justify-content-end text-warning">{renderStars(testimonial.stars)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestimonialComponent;
