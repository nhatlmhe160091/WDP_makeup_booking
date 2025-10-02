"use client";

const ContactFormComponent = () => {
  return (
    <div className="bg-light p-5 rounded h-100 wow fadeInUp" data-wow-delay="0.2s" style={{ border: "1px solid #FED9D5" }}>
      <h4 style={{ color: "#ff5c95ff" }}>Gửi Tin Nhắn</h4>
      <p className="mb-4">
        Bạn có thể điền thông tin vào biểu mẫu dưới đây để chúng tôi hỗ trợ bạn nhanh nhất. Hãy chia sẻ yêu cầu của bạn
        với chúng tôi.
      </p>
      <form>
        <div className="row g-4">
          <div className="col-lg-12 col-xl-6">
            <div className="form-floating">
              <input type="text" className="form-control border-0" id="name" placeholder="Họ Tên" />
              <label htmlFor="name">Họ Tên</label>
            </div>
          </div>
          <div className="col-lg-12 col-xl-6">
            <div className="form-floating">
              <input type="email" className="form-control border-0" id="email" placeholder="Email" />
              <label htmlFor="email">Email</label>
            </div>
          </div>
          <div className="col-12">
            <div className="form-floating">
              <input type="text" className="form-control border-0" id="subject" placeholder="Tiêu Đề" />
              <label htmlFor="subject">Tiêu Đề</label>
            </div>
          </div>
          <div className="col-12">
            <div className="form-floating">
              <textarea
                className="form-control border-0"
                placeholder="Để lại tin nhắn ở đây"
                id="message"
                style={{ height: "160px" }}
              ></textarea>
              <label htmlFor="message">Tin Nhắn</label>
            </div>
          </div>
          <div className="col-12">
            <button className="btn btn-primary w-100 py-3" style={{ backgroundColor: "#FED9D5", color: "#2A3547" }}>
              Gửi Tin Nhắn
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ContactFormComponent;
