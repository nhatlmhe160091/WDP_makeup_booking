import { useMediaQuery, Box, Drawer } from "@mui/material";
import SidebarItems from "./SidebarItems";
// import { Upgrade } from "./Updrade";
import { Sidebar, Logo } from "react-mui-sidebar";

const MSidebar = ({ isMobileSidebarOpen, onSidebarClose, isSidebarOpen }) => {
  const lgUp = useMediaQuery((theme) => theme.breakpoints.up("lg"));

  const sidebarWidth = "270px";

  // Custom CSS for short scrollbar
  const scrollbarStyles = {
    "&::-webkit-scrollbar": {
      width: "7px"
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "#eff2f7",
      borderRadius: "15px"
    }
  };

  if (lgUp) {
    return (
      <Box
        sx={{
          width: sidebarWidth,
          flexShrink: 0
        }}
      >
        {/* ------------------------------------------- */}
        {/* Sidebar for desktop */}
        {/* ------------------------------------------- */}
        <Drawer
          anchor="left"
          open={isSidebarOpen}
          variant="permanent"
          PaperProps={{
            sx: {
              boxSizing: "border-box",
              ...scrollbarStyles
            }
          }}
        >
          {/* ------------------------------------------- */}
          {/* Sidebar Box */}
          {/* ------------------------------------------- */}
          <Box
            sx={{
              height: "100%"
            }}
          >
            <Sidebar
              width={"270px"}
              collapsewidth="80px"
              open={isSidebarOpen}
              themeColor="#FED9D5"
              themeSecondaryColor="#FED9D5"
              showProfile={false}
            >
              {/* ------------------------------------------- */}
              {/* Logo */}
              {/* ------------------------------------------- */}
              {/* <Logo img="/img/logo.png" /> */}

              {/* title ưeb */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  gap: 0,
                  mt: 2,
                  px: 0
                }}
              >
                <a href="/">
                  <img src="/img/MuaHub.png" alt="MuaHub" style={{ width: "170px", height: "170px", objectFit: "contain", mixBlendMode: "darken", backgroundColor: "transparent", display: "block" }} />
                </a>
                <Box
                  sx={{
                    color: "#ff5c95ff",
                    fontWeight: 700,
                    fontSize: "24px",
                    ml: -4
                  }}
                >
                  MuaHub
                </Box>
              </Box>

              <Box>
                {/* ------------------------------------------- */}
                {/* Sidebar Items */}
                {/* ------------------------------------------- */}
                <SidebarItems />
                {/* <Upgrade /> */}
              </Box>
            </Sidebar>
          </Box>
        </Drawer>
      </Box>
    );
  }

  return (
    <Drawer
      anchor="left"
      open={isMobileSidebarOpen}
      onClose={onSidebarClose}
      variant="temporary"
      PaperProps={{
        sx: {
          boxShadow: (theme) => theme.shadows[8],
          ...scrollbarStyles
        }
      }}
    >
      {/* ------------------------------------------- */}
      {/* Sidebar Box */}
      {/* ------------------------------------------- */}
      <Box px={2}>
        <Sidebar
          width={"270px"}
          collapsewidth="80px"
          isCollapse={false}
          mode="light"
          direction="ltr"
          themeColor="#FED9D5"
          themeSecondaryColor="#FED9D5"
          showProfile={false}
        >
          {/* ------------------------------------------- */}
          {/* Logo */}
          {/* ------------------------------------------- */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: 0,
              mt: 2,
              px: 0
            }}
          >
            <a href="/">
              <img src="/img/MuaHub.png" alt="MuaHub" style={{ width: "170px", height: "170px", objectFit: "contain", mixBlendMode: "darken", backgroundColor: "transparent", display: "block" }} />
            </a>
            <Box
              sx={{
                color: "#ff5c95ff",
                fontWeight: 700,
                fontSize: "24px",
                ml: -4
              }}
            >
              MuaHub
            </Box>
          </Box>
          {/* ------------------------------------------- */}
          {/* Sidebar Items */}
          {/* ------------------------------------------- */}
          <SidebarItems />
          {/* <Upgrade /> */}
        </Sidebar>
      </Box>
      {/* ------------------------------------------- */}
      {/* Sidebar For Mobile */}
      {/* ------------------------------------------- */}
    </Drawer>
  );
};

export default MSidebar;
