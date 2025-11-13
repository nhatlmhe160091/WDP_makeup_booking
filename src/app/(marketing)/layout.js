"use client";
import { useEffect } from "react";
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
  const isLocalUserValid = currentUser && (currentUser.id || currentUser._id || currentUser.email);
  const isAuthenticated = (!loading && (session?.user || isLocalUserValid)) || (status === "authenticated" && session?.user);
  const isLoading = loading || status === "loading";

  // Lấy role từ currentUser hoặc session
  const userRole = currentUser?.role || session?.user?.role || null;

  // Chuyển hướng phải nằm trong useEffect để tránh lỗi setState khi render

  useEffect(() => {
    if (!isLoading && !isAuthenticated && linkNeedAuth.includes(pathUrl)) {
      router.push("/dang-nhap");
    } else if (!isLoading && isAuthenticated && linkNeedNotAuth.includes(pathUrl)) {
      if (userRole === "admin") {
        router.push("/admin");
      } else if (userRole === "makeup_artist") {
        router.push("/makeup-artists");
      } else {
        window.location.href = "/";
      }
    }
  }, [isLoading, isAuthenticated, pathUrl, userRole, router]);

  // Trả về null khi đang chuyển hướng
  if (
    (!isLoading && !isAuthenticated && linkNeedAuth.includes(pathUrl)) ||
    (!isLoading && isAuthenticated && linkNeedNotAuth.includes(pathUrl))
  ) {
    return null;
  }

  return (
    <>
      {/* CSS cho Botpress webchat - đảm bảo luôn hiển thị trên cùng */}
      <style jsx global>{`
        #bp-web-widget,
        #bp-web-widget-container,
        [id^="bp-"],
        [class*="bp-"],
        .bpWidget,
        .bpWebchat {
          z-index: 999999 !important;
        }

        #bp-web-widget-container {
          position: fixed !important;
          z-index: 999999 !important;
        }

        .bpWidget button,
        #bp-web-widget button {
          z-index: 999999 !important;
          position: fixed !important;
        }

        .bpWidget iframe,
        #bp-web-widget iframe {
          z-index: 999999 !important;
        }

        .bpWidget,
        #bp-web-widget {
          z-index: 999999 !important;
          position: fixed !important;
        }

        body #bp-web-widget,
        body .bpWidget {
          z-index: 999999 !important;
        }
      `}</style>

      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&family=Roboto:wght@400;500;700;900&display=swap"
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
      {/* Botpress webchat - chỉ cho marketing pages */}
      <Script
        src="https://cdn.botpress.cloud/webchat/v3.3/inject.js"
        strategy="lazyOnload"
        onError={(e) => console.error('Botpress inject failed:', e)}
      />
      {/* Botpress config - load sau inject */}
      <Script
        src="https://files.bpcontent.cloud/2025/11/07/06/20251107065809-TY9VOLUP.js"
        strategy="lazyOnload"
        onError={(e) => console.error('Botpress config failed:', e)}
        onLoad={() => console.log('Botpress loaded successfully for marketing')}
      />
      <link href="/lib/css/style.css" rel="stylesheet" />
      <HeaderComponent />
      {children}
      <FooterComponent />
    </>
  );
};

export default UserAppLayout;
