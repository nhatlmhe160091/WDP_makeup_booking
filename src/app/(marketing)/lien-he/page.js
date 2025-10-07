/* eslint-disable @next/next/no-img-element */
import "@muahub/styles/style.css";
import Script from "next/script";
import META_DATA from "./metaData";
import { ADDRESS, EMAIL, MAIN_URL_APP, PHONE_NUMBER } from "@muahub/constants/MainContent";
import ContactFormComponent from "../components/ContactFormComponent";

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

export default function ContactPage() {
  return (
    <>
      <div className="container-fluid contact py-5">
        <div className="container py-5">
          <div className="row g-5">
            <div className="col-xl-6">
              <div className="wow fadeInUp" data-wow-delay="0.2s">
                <div className="bg-light rounded p-5 mb-5" style={{ border: "1px solid #FED9D5" }}>
                  <h4 className="mb-4" style={{ color: "#ff5c95ff" }}>Liên Hệ Với Chúng Tôi</h4>
                  <div className="row g-4">
                    <div className="col-md-6">
                      <div className="contact-add-item">
                        <div className="contact-icon mb-4" style={{ color: "#ff5c95ff" }}>
                          <i className="fas fa-map-marker-alt fa-2x"></i>
                        </div>
                        <div>
                          <h4>Địa Chỉ</h4>
                          <p className="mb-0">{ADDRESS}</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="contact-add-item">
                        <div className="contact-icon mb-4" style={{ color: "#ff5c95ff" }}>
                          <i className="fas fa-paper-plane fa-2x"></i>
                        </div>
                        <div>
                          <h4>Email</h4>
                          <p className="mb-0">{EMAIL}</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="contact-add-item">
                        <div className="contact-icon mb-4" style={{ color: "#ff5c95ff" }}>
                          <i className="fas fa-phone fa-2x"></i>
                        </div>
                        <div>
                          <h4>Số Điện Thoại</h4>
                          <p className="mb-0">{PHONE_NUMBER}</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="contact-add-item">
                        <div className="contact-icon mb-4" style={{ color: "#ff5c95ff" }}>
                          <i className="fas fa-globe fa-2x"></i>
                        </div>
                        <div>
                          <h4>Website</h4>
                          <p className="mb-0">{MAIN_URL_APP}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <ContactFormComponent />
              </div>
            </div>
            <div className="col-xl-6 wow fadeInRight" data-wow-delay="0.2s">
              <div className="rounded h-100" style={{ border: "1px solid #FED9D5" }}>
                <iframe
                  className="rounded h-100 w-100"
                  style={{ height: "400px" }}
                  src="https://maps.google.com/maps?width=100%25&amp;height=600&amp;hl=en&amp;q=%C4%90%E1%BA%A1I%20h%E1%BB%8Cc%20fpt+(Qu%E1%BA%A3n%20l%C3%BD%20s%C3%A2n%20b%C3%B3ng)&amp;t=&amp;z=14&amp;ie=UTF8&amp;iwloc=B&amp;output=embed"
                  // src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d387191.33750346623!2d-73.97968099999999!3d40.6974881!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2sbd!4v1694259649153!5m2!1sen!2sbd"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>

      <a href="#" className="btn btn-primary btn-lg-square rounded-circle back-to-top">
        <i className="fa fa-arrow-up"></i>
      </a>
    </>
  );
}
