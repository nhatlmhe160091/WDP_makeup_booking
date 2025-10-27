"use client";
import Script from "next/script";
import FooterComponent from "./components/FooterComponent";
import HeaderComponent from "./components/HeaderComponent";
import { useApp } from "../contexts/AppContext";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
const UserAppLayout = ({ children }) => {
  const { currentUser, loading } = useApp();
  const { data: session, status } = useSession();
  const pathUrl = usePathname();
  const router = useRouter();

  const linkNeedAuth = ["/trang-ca-nhan"];
  const linkNeedNotAuth = ["/quen-mat-khau", "/dang-nhap", "/dang-ky"];

  // Kiểm tra xác thực từ cả hai nguồn (NextAuth và hệ thống hiện tại)
  const isAuthenticated = (!loading && Object.keys(currentUser).length > 0) || (status === "authenticated" && session);
  const isLoading = loading || status === "loading";

  // Chuyển hướng nếu chưa đăng nhập và cố truy cập trang cần xác thực
  if (!isLoading && !isAuthenticated && linkNeedAuth.includes(pathUrl)) {
    router.push("/dang-nhap");
    return null;
  }

  // Chuyển hướng nếu đã đăng nhập và cố truy cập trang đăng nhập/đăng ký
  if (!isLoading && isAuthenticated && linkNeedNotAuth.includes(pathUrl)) {
    router.push("/trang-ca-nhan");
    return null;
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
