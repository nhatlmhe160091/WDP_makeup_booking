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
    return (
      <Box sx={{ px: 3 }}>
        <div style={{ padding: "16px", textAlign: "center", color: "#888" }}>
          Vui lòng lựa chọn gói admin để tiếp tục sử dụng chức năng này.
        </div>
      </Box>
    );
  }

  return (
    <Box sx={{ px: 3 }}>
      <List sx={{ pt: 0 }} className="sidebarNav" component="div">
        {Menuitems.map((item) => {
          // Ẩn mục onlyUser cho admin
          if (item.onlyUser && currentUser?.role === ROLE_MANAGER.ADMIN) {
            return null;
          }
          // Ẩn mục onlyAdmin cho MUA
          if (item.onlyAdmin && currentUser?.role === ROLE_MANAGER.MUA) {
            return null;
          }
          // Hiển thị mục onlyMua nếu payment_type hợp lệ
          if (
            item.onlyMua &&
            !(
              currentUser?.payment_type === "monthly_6" ||
              currentUser?.payment_type === "yearly"
            )
          ) {
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