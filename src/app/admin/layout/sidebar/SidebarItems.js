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
      currentUser.role === ROLE_MANAGER.MUA &&
      !currentUser.payment_type &&
      pathname !== "/admin/thanh-toan-nen-tang"
    ) {
      router.push("/admin/thanh-toan-nen-tang");
    }
  }, [currentUser, pathname, router]);

  if (
    currentUser.role === ROLE_MANAGER.MUA &&
    !currentUser.payment_type &&
    pathname === "/admin/thanh-toan-nen-tang"
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
          // {/********SubHeader**********/}
          if (item.onlyUser && currentUser.role === ROLE_MANAGER.ADMIN) {
            return null;
          }
          if (item.onlyAdmin && currentUser.role === ROLE_MANAGER.MUA) {
            return null;
          }
          if (item.subheader) {
            return <NavGroup item={item} key={item.subheader} />;

            // {/********If Sub Menu**********/}
            /* eslint no-else-return: "off" */
          } else {
            return <NavItem item={item} key={item.id} pathDirect={pathDirect} onClick={toggleMobileSidebar} />;
          }
        })}
      </List>
    </Box>
  );
};
export default SidebarItems;
