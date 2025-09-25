"use client";
import { Accordion, Card, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const FAQsComponent = () => {
  const faqs = [
    {
      question: "Làm thế nào để đặt lịch makeup?",
      answer:
        "Bạn có thể đặt lịch nhanh chóng trên nền tảng của chúng tôi: chọn dịch vụ, chuyên viên, thời gian phù hợp và xác nhận đặt lịch."
    },
    {
      question: "Có thể hủy/đổi lịch không?",
      answer:
        "Có. Bạn có thể hủy hoặc đổi lịch trước thời hạn quy định. Vui lòng tham khảo chính sách hủy/đổi lịch và hoàn tiền trên hệ thống."
    },
    {
      question: "Hình thức thanh toán nào được chấp nhận?",
      answer:
        "Chúng tôi hỗ trợ thanh toán qua ví điện tử, thẻ ngân hàng, chuyển khoản và thanh toán trực tiếp sau dịch vụ (nếu áp dụng)."
    },
    {
      question: "Tôi có thể đặt lịch định kỳ không?",
      answer:
        "Có. Bạn có thể đặt lịch định kỳ theo tuần/tháng cho nhu cầu cá nhân, chụp lookbook, đi làm… Liên hệ hỗ trợ để được sắp lịch nhanh."
    },
    {
      question: "Có hỗ trợ makeup cho sự kiện không?",
      answer:
        "Có. Chúng tôi nhận makeup sự kiện, dạ tiệc, kỷ yếu, cưới hỏi… và có thể đến tận nơi theo yêu cầu."
    },
    {
      question: "Có chính sách ưu đãi cho thành viên không?",
      answer:
        "Có. Thành viên thân thiết được tích điểm, giảm giá theo hạng và các ưu đãi theo mùa. Hãy đăng ký/đăng nhập để nhận khuyến mãi."
    }
  ];

  return (
    <div className="container-fluid faq-section pb-5 wow fadeInUp" data-wow-delay="0.2s">
      <div className="container pb-5 overflow-hidden">
        <div className="text-center mx-auto pb-5" style={{ maxWidth: "800px" }}>
          <h4 style={{ color: "#E91E63" }}>Câu Hỏi Thường Gặp</h4>
          <h1 className="display-5 mb-4">Giải Đáp Những Thắc Mắc Của Bạn</h1>
          <p className="mb-0">
            Chúng tôi đã tổng hợp những câu hỏi phổ biến nhất để giúp bạn hiểu rõ hơn về hệ thống đặt sân và các
            dịch vụ chúng tôi cung cấp.
          </p>
        </div>
        <div className="row g-5 align-items-center">
          <div className="col-lg-6 wow fadeInLeft" data-wow-delay="0.2s">
            <Accordion defaultActiveKey="0" className="bg-light rounded p-3">
              {faqs.map((faq, index) => (
                <Accordion.Item eventKey={String(index)} key={index}>
                  <Accordion.Header>{faq.question}</Accordion.Header>
                  <Accordion.Body>{faq.answer}</Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>
          </div>
          <div className="col-lg-6 wow fadeInRight" data-wow-delay="0.2s">
            <div className="rounded" style={{ backgroundColor: "#FED9D5" }}>
              <img src="img/about-2.png" className="img-fluid w-100" alt="FAQ Illustration" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQsComponent;
