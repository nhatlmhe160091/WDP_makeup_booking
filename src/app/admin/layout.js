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
import { ROLE_MANAGER } from "@muahub/constants/System";
import { useRouter } from "next/navigation";
const AdminLayout = ({ children }) => {
  const { currentUser, loading } = useApp();
  const pathUrl = usePathname();
  const router = useRouter();

  if (currentUser.role === ROLE_MANAGER.USER) {
    router.push("/");
    return;
  }

  const url = ["/admin/dang-nhap", "/admin/dang-ky"];

  if (!loading && Object.keys(currentUser).length === 0 && !url.includes(pathUrl)) {
    router.push("/admin/dang-nhap");
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
      ) : pathUrl === "/admin/dang-nhap" || pathUrl === "/admin/dang-ky" ? (
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
