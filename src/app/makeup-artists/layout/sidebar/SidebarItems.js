import React, { useEffect } from "react";
import Menuitems from "./MenuItems";
import { usePathname } from "next/navigation";
import { Box, List } from "@mui/material";
import NavItem from "./NavItem";
import NavGroup from "./NavGroup/NavGroup";
import { useApp } from "@muahub/app/contexts/AppContext";
import { ROLE_MANAGER } from "@muahub/constants/System";
import { useRouter } from "next/navigation";
const SidebarItems = ({ toggleMobileSidebar }) => {
  const { currentUser } = useApp();
  const pathname = usePathname();
  const pathDirect = pathname;
  const router = useRouter();
  useEffect(() => {
    if (
      currentUser?.role === ROLE_MANAGER.MUA &&
      !currentUser.payment_type &&
      pathname !== "/makeup-artists/thanh-toan-nen-tang"
    ) {
      router.push("/makeup-artists/thanh-toan-nen-tang");
    }
  }, [currentUser, pathname, router]);

  if (
    currentUser?.role === ROLE_MANAGER.MUA &&
    !currentUser?.payment_type &&
    pathname === "/makeup-artists/thanh-toan-nen-tang"
  ) {
     console.log("[SidebarItems] Blocked: currentUser=", currentUser, "pathname=", pathname, "ROLE_MANAGER=", ROLE_MANAGER, "condition:", {
          isMua: currentUser.role === ROLE_MANAGER.MUA,
          noPayment: !currentUser.payment_type,
          isPaymentPage: pathname === "/admin/thanh-toan-nen-tang"
        });
    return (
      <Box sx={{ px: 3 }}>
        <div style={{ padding: "16px", textAlign: "center", color: "#888" }}>
          Vui lòng lựa chọn gói admin để tiếp tục sử dụng chức năng này.
        </div>
      </Box>
    );
  }

  // Thêm mục Quản lý Blog nếu user có payment_type phù hợp
  const shouldShowBlog =
    currentUser?.payment_type === "monthly_6" || currentUser?.payment_type === "yearly";

  // Tạo danh sách menu mới nếu cần
  let menuToRender = [...Menuitems];
  if (shouldShowBlog) {
    menuToRender.push(
      { navlabel: true, subheader: "Quản lý Blog" }
      // Có thể thêm các mục con ở đây nếu cần
    );
    // Ví dụ thêm mục blog quản lý:
    // menuToRender.push({ id: 'blog', title: 'Blog', icon: ..., href: '/makeup-artists/blog' });
  }

  return (
    <Box sx={{ px: 3 }}>
      <List sx={{ pt: 0 }} className="sidebarNav" component="div">
        {menuToRender.map((item) => {
          if (item.onlyUser && currentUser?.role === ROLE_MANAGER.ADMIN) {
            return null;
          }
          if (item.onlyAdmin && currentUser?.role === ROLE_MANAGER.MUA) {
            return null;
          }
          if (item.subheader) {
            return <NavGroup item={item} key={item.subheader} />;
          } else {
            return <NavItem item={item} key={item.id} pathDirect={pathDirect} onClick={toggleMobileSidebar} />;
          }
        })}
      </List>
    </Box>
  );
};
export default SidebarItems;
