"use client";
import Script from "next/script";
import FooterComponent from "./components/FooterComponent";
import HeaderComponent from "./components/HeaderComponent";
import { useApp } from "../contexts/AppContext";
import { usePathname } from "next/navigation";

const UserAppLayout = ({ children }) => {
  const { currentUser, loading } = useApp();
  const pathUrl = usePathname();

  const linkNeedAuth = ["/trang-ca-nhan"];
  const linkNeedNotAuth = ["/quen-mat-khau", "/dang-nhap", "/dang-ky"];

  if (!loading && Object.keys(currentUser).length === 0 && linkNeedAuth.includes(pathUrl)) {
    window.location.href = "/dang-nhap";
    return null; // Prevent rendering while redirecting
  }

  if (!loading && Object.keys(currentUser).length > 0 && linkNeedNotAuth.includes(pathUrl)) {
    window.location.href = "/trang-ca-nhan";
    return null; // Prevent rendering while redirecting
  }

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Roboto:wght@400;500;700;900&display=swap"
        rel="stylesheet"
      />

      <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.15.4/css/all.css" />
      <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.4.1/font/bootstrap-icons.css" rel="stylesheet" />

      <link href="/lib/lightbox/css/lightbox.min.css" rel="stylesheet" />
      <link href="/lib/owlcarousel/assets/owl.carousel.min.css" rel="stylesheet" />

      <link href="/lib/css/bootstrap.min.css" rel="stylesheet" />

      <Script
        src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-MrcW6ZMFYlzcLA8Nl+NtUVF0sA7MsXsP1UyJoMp4YLEuNSfAP+JcXn/tWtIaxVXM"
        crossOrigin="anonymous"
      />

      <link href="/lib/css/style.css" rel="stylesheet" />
      <HeaderComponent />
      {children}
      <FooterComponent />
    </>
  );
};

export default UserAppLayout;
