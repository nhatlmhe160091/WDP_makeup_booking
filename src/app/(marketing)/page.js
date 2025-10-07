/* eslint-disable @next/next/no-img-element */
import "@muahub/styles/style.css";
import Script from "next/script";
import AboutUsComponent from "./components/AboutUsComponent";
import OurFeaturesComponent from "./components/OurFeaturesComponent";
import OurOfferComponent from "./components/OurOfferComponent";
import FAQsComponent from "./components/FAQsComponent";
import OurTeamComponent from "./components/OurTeamComponent";
import TestimonialComponent from "./components/TestimonialComponent";
import META_DATA from "./metaData";
import BoxFieldComponent from "./components/BoxFieldComponent";
import SanBongNoiBatComponent from "./components/SanBongNoiBatComponent";

export const metadata = {
  title: `${META_DATA.TITLE}`,
  description: META_DATA.DESCRIPTION,
  applicationName: META_DATA.APPLICATION_NAME,
  keywords: META_DATA.KEYWORDS,
  robots: META_DATA.ROBOTS,
  openGraph: {
    title: META_DATA.TITLE,
    description: META_DATA.DESCRIPTION,
    images: META_DATA.IMAGE,
    type: "website",
    url: META_DATA.URL
  }
};
export default function Home() {
  const fields = [
    {
      id: 1,
      name: "Sân 5 người",
      image: "/assets/img/service-1.jpg",
      description: "Sân bóng đá 5 người với mặt cỏ nhân tạo chất lượng cao, hệ thống chiếu sáng hiện đại, đảm bảo trải nghiệm tốt nhất cho người chơi.",
      link: "/san-bong-da-5-nguoi"
    },
    {
      id: 2,
      name: "Sân 7 người",
      image: "/assets/img/service-2.jpg",
      description: "Sân bóng đá 7 người rộng rãi, phù hợp cho các trận đấu nhóm và sự kiện thể thao, với cơ sở vật chất tiện nghi.",
      link: "/san-bong-da-7-nguoi"
    },
    {
      id: 3,
      name: "Sân 11 người",
      image: "/assets/img/service-3.jpg",
      description: "Sân bóng đá 11 người đạt tiêu chuẩn thi đấu, với mặt cỏ tự nhiên hoặc nhân tạo, phục vụ cho các giải đấu chuyên nghiệp.",
      link: "/san-bong-da-11-nguoi"
    }
  ];
  return (
    <div>
      <AboutUsComponent />
      <SanBongNoiBatComponent />

      <div className="container-fluid service pb-5">
        <div className="container">
          <div className="text-center mx-auto pb-3 wow fadeInUp" data-wow-delay="0.2s" style={{ maxWidth: "800px" }}>
            <h4 className="text-primary">Dịch vụ phổ biến</h4>
            <h1 className="display-5">Các dịch vụ phổ biến tại Hà Nội</h1>
          </div>
          <div className="row g-3">
            {fields.map((field) => (
              <BoxFieldComponent key={field.id} field={field} />
            ))}
          </div>
        </div>
      </div>
      <OurTeamComponent />
      <TestimonialComponent />
      <OurFeaturesComponent />
      <OurOfferComponent />
      <FAQsComponent />

      {/* <OurTeamComponent /> */}

      {/* <TestimonialComponent /> */}

      <a href="#" className="btn btn-primary btn-lg-square rounded-circle back-to-top">
        <i className="fa fa-arrow-up"></i>
      </a>
    </div>
  );
}
