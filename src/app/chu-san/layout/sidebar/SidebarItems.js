import React from "react";
import Menuitems from "./MenuItems";
import { usePathname } from "next/navigation";
import { Box, List } from "@mui/material";
import NavItem from "./NavItem";
import NavGroup from "./NavGroup/NavGroup";
import { useApp } from "@quanlysanbong/app/contexts/AppContext";
import { ROLE_MANAGER } from "@quanlysanbong/constants/System";

const SidebarItems = ({ toggleMobileSidebar }) => {
  const { currentUser } = useApp();
  const pathname = usePathname();
  const pathDirect = pathname;

  if (currentUser.role === ROLE_MANAGER.SALE && !currentUser.payment_type) {
    if (pathname !== "/chu-san/thanh-toan-nen-tang") {
      if (typeof window !== "undefined") {
        window.location.href = "/chu-san/thanh-toan-nen-tang";
      }
      return null;
    }
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
          if (item.onlyAdmin && currentUser.role === ROLE_MANAGER.SALE) {
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
