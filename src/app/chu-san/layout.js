"use client";

import RootAdminLayout from "./LayoutComponent";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Toaster } from "react-hot-toast";
import { baselightTheme } from "./layout/theme/DefaultColors";
import { usePathname } from "next/navigation";
import LoadingFullScreen from "./components/Loading/LoadingFullScreen";
import "./baseCss.css";
import { useApp } from "../contexts/AppContext";
import { ROLE_MANAGER } from "@quanlysanbong/constants/System";

const AdminLayout = ({ children }) => {
  const { currentUser, loading } = useApp();
  const pathUrl = usePathname();

  if (currentUser.role === ROLE_MANAGER.USER) {
    window.location.href = "/";
    return;
  }

  const url = ["/chu-san/dang-nhap", "/chu-san/dang-ky"];

  if (!loading && Object.keys(currentUser).length === 0 && !url.includes(pathUrl)) {
    window.location.href = "/chu-san/dang-nhap";
    return;
  }

  return (
    <ThemeProvider theme={baselightTheme}>
      {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
      <CssBaseline />
      {loading ? (
        <div className="loading position-fixed" id="loading-full-screen">
          <LoadingFullScreen />
        </div>
      ) : pathUrl === "/chu-san/dang-nhap" || pathUrl === "/chu-san/dang-ky" ? (
        <>{children}</>
      ) : (
        <RootAdminLayout>{children}</RootAdminLayout>
      )}

      <div className="loading position-fixed" id="loading-full-screen">
        <LoadingFullScreen />
        <a href="#" className="btn btn-primary btn-lg-square rounded-circle back-to-top"></a>
      </div>
      <Toaster />
    </ThemeProvider>
  );
};

export default AdminLayout;
