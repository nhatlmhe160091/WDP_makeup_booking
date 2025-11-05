import React, { useState, useEffect } from "react";
import {
  Box, AppBar, Toolbar, styled, Stack, IconButton, Badge, Button, Menu, MenuItem, Typography
} from "@mui/material";
import PropTypes from "prop-types";
import Profile from "./Profile";
import { IconBellRinging, IconMenu } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

const Header = ({ toggleMobileSidebar }) => {
  const AppBarStyled = styled(AppBar)(({ theme }) => ({
    boxShadow: "none",
    background: theme.palette.background.paper,
    justifyContent: "center",
    backdropFilter: "blur(4px)",
    [theme.breakpoints.up("lg")]: { minHeight: "70px" },
  }));

  const ToolbarStyled = styled(Toolbar)(({ theme }) => ({
    width: "100%",
    color: theme.palette.text.secondary,
  }));

  const [notifications, setNotifications] = useState([]);
  const [visibleCount, setVisibleCount] = useState(10); // 👈 số lượng hiển thị ban đầu
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Hàm fetch thông báo
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/notifications/admin`);
      const data = await res.json();
      if (data.success) setNotifications(data.data || []);
    } catch (err) {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  // Polling: tự động cập nhật thông báo mỗi 30 giây, dừng khi menu đang mở
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => {
      if (!anchorEl) fetchNotifications();
    }, 30000); // 30 giây
    return () => clearInterval(interval);
  }, [anchorEl]);

  const handleOpenMenu = (e) => setAnchorEl(e.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);

  const handleReadAndGo = async (item) => {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item._id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n._id === item._id ? { ...n, isRead: true } : n))
      );
    } catch {}
    if (item.orderId) router.push(`/admin/danh-sach-dat-lich?orderId=${item.orderId}`);
    else router.push("/admin/danh-sach-dat-lich");
    setAnchorEl(null);
  };

  const handleClearNotifications = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa tất cả thông báo quá hạn?")) return;
    try {
      setLoading(true);
      const res = await fetch("/api/notifications", { method: "DELETE" });
      const data = await res.json();
      if (data.success) setNotifications([]);
    } catch {} finally {
      setLoading(false);
    }
  };

  // ✅ Load thêm khi scroll tới cuối
  const handleScroll = (e) => {
    const bottom =
      e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight + 50;
    if (bottom && visibleCount < notifications.length && !loading) {
      setVisibleCount((prev) => prev + 10); // mỗi lần thêm 10
    }
  };

  const visibleNotifications = notifications.slice(0, visibleCount);

  return (
    <AppBarStyled position="sticky" color="default">
      <ToolbarStyled>
        <IconButton
          color="inherit"
          aria-label="menu"
          onClick={toggleMobileSidebar}
          sx={{ display: { lg: "none", xs: "inline" } }}
        >
          <IconMenu width="20" height="20" />
        </IconButton>

        <IconButton
          size="large"
          color="inherit"
          aria-controls="msgs-menu"
          aria-haspopup="true"
          onClick={handleOpenMenu}
        >
          <Badge badgeContent={notifications.length} color="primary">
            <IconBellRinging size="21" stroke="1.5" />
          </Badge>
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleCloseMenu}
          PaperProps={{
            sx: { width: 350, maxHeight: 400, p: 0, mt: 1.5, overflowY: "auto" },
            onScroll: handleScroll, // 👈 theo dõi scroll
          }}
        >
          <Box sx={{ p: 2, borderBottom: "1px solid #eee", fontWeight: 600 }}>
            Thông báo mới
          </Box>

          {loading ? (
            <MenuItem disabled>
              <Box sx={{ p: 2 }}>Đang tải...</Box>
            </MenuItem>
          ) : notifications.length === 0 ? (
            <MenuItem disabled>
              <Box sx={{ p: 2, color: "#888" }}>Không có thông báo</Box>
            </MenuItem>
          ) : (
            visibleNotifications.map((item) => (
              <MenuItem
                key={item._id}
                sx={{
                  alignItems: "flex-start",
                  whiteSpace: "normal",
                  borderBottom: "1px solid #eee",
                  cursor: item.isRead ? "default" : "pointer",
                  opacity: item.isRead ? 0.6 : 1,
                  backgroundColor: item.isRead ? "#f5f5f5" : "inherit",
                  "&:hover": {
                    backgroundColor: item.isRead ? "#f5f5f5" : "#f0f7ff",
                  },
                }}
                onClick={() => !item.isRead && handleReadAndGo(item)}
                disabled={item.isRead}
              >
                <Box display="flex" alignItems="center" gap={1}>
                  <Box>
                    <Typography fontWeight={item.isRead ? 400 : 500}>
                      {item.message}
                    </Typography>
                    <Typography fontSize={12} color="#888">
                      {new Date(item.created_at).toLocaleString()}
                    </Typography>
                  </Box>
                  {item.isRead && (
                    <Box display="flex" alignItems="center" gap={0.5} ml={1}>
                      <span style={{ color: "#4caf50", fontSize: 16 }}>✔</span>
                      <Typography fontSize={12} color="#4caf50">
                        Đã đọc
                      </Typography>
                    </Box>
                  )}
                </Box>
              </MenuItem>
            ))
          )}

          {/* Hiển thị thông báo trạng thái */}
          {visibleCount < notifications.length && !loading && (
            <MenuItem disabled>
              <Box sx={{ p: 1, textAlign: "center", color: "#888" }}>
                Kéo xuống để xem thêm...
              </Box>
            </MenuItem>
          )}
          {visibleCount >= notifications.length && notifications.length > 0 && (
            <MenuItem disabled>
              <Box sx={{ p: 1, textAlign: "center", color: "#888" }}>
                Hết thông báo
              </Box>
            </MenuItem>
          )}

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              p: 1,
              borderTop: "1px solid #eee",
            }}
          >
            <Button size="small" color="error" onClick={handleClearNotifications}>
              Giải phóng
            </Button>
            <Button size="small" onClick={handleCloseMenu}>
              Đóng
            </Button>
          </Box>
        </Menu>

        <Box flexGrow={1} />
        <Stack spacing={1} direction="row" alignItems="center">
          <Profile />
        </Stack>
      </ToolbarStyled>
    </AppBarStyled>
  );
};

Header.propTypes = {
  sx: PropTypes.object,
};

export default Header;
