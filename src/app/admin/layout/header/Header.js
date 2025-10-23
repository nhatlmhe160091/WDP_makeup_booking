import React, { useState, useEffect } from "react";
import { Box, AppBar, Toolbar, styled, Stack, IconButton, Badge, Button, Menu, MenuItem, Typography } from "@mui/material";
import PropTypes from "prop-types";
import Link from "next/link";
// components
import Profile from "./Profile";
import { IconBellRinging, IconMenu } from "@tabler/icons-react";

const Header = ({ toggleMobileSidebar }) => {
  // const lgUp = useMediaQuery((theme) => theme.breakpoints.up('lg'));
  // const lgDown = useMediaQuery((theme) => theme.breakpoints.down('lg'));

  const AppBarStyled = styled(AppBar)(({ theme }) => ({
    boxShadow: "none",
    background: theme.palette.background.paper,
    justifyContent: "center",
    backdropFilter: "blur(4px)",
    [theme.breakpoints.up("lg")]: {
      minHeight: "70px"
    }
  }));
  const ToolbarStyled = styled(Toolbar)(({ theme }) => ({
    width: "100%",
    color: theme.palette.text.secondary
  }));

  // State cho thông báo
  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        // Lấy tất cả thông báo, không lọc isRead
        const res = await fetch(`/api/notifications/admin`);
        const data = await res.json();
        if (data.success) setNotifications(data.data);
      } catch (err) {
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  // Hàm đánh dấu đã đọc
  const markAsRead = async (id) => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      // Sau khi đánh dấu, cập nhật trạng thái isRead cho thông báo
      setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n));
    } catch (e) {}
  };

  // Hàm giải phóng thông báo quá hạn
  const handleClearNotifications = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tất cả thông báo quá hạn?')) return;
    try {
      setLoading(true);
      const res = await fetch('/api/notifications', { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        // Sau khi xóa, reload lại danh sách
        setNotifications((prev) => prev.filter(n => new Date(n.created_at) >= new Date()));
        // Hoặc gọi lại fetchNotifications nếu muốn chắc chắn
        // fetchNotifications();
      }
    } catch (e) {} finally {
      setLoading(false);
    }
  };

  return (
    <AppBarStyled position="sticky" color="default">
      <ToolbarStyled>
        <IconButton
          color="inherit"
          aria-label="menu"
          onClick={toggleMobileSidebar}
          sx={{
            display: {
              lg: "none",
              xs: "inline"
            }
          }}
        >
          <IconMenu width="20" height="20" />
        </IconButton>

        <IconButton
          size="large"
          aria-label="show notifications"
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
            sx: {
              width: 350,
              maxHeight: 400,
              p: 0,
              mt: 1.5,
            }
          }}
        >
          <Box sx={{ p: 2, borderBottom: "1px solid #eee", fontWeight: 600 }}>Thông báo mới</Box>
          {loading ? (
            <MenuItem disabled><Box sx={{ p: 2 }}>Đang tải...</Box></MenuItem>
          ) : notifications.length === 0 ? (
            <MenuItem disabled><Box sx={{ p: 2, color: "#888" }}>Không có thông báo</Box></MenuItem>
          ) : (
            notifications.map((item) => (
              <MenuItem
                key={item._id}
                sx={{
                  alignItems: 'flex-start',
                  whiteSpace: 'normal',
                  borderBottom: '1px solid #eee',
                  cursor: item.isRead ? 'default' : 'pointer',
                  opacity: item.isRead ? 0.6 : 1,
                  backgroundColor: item.isRead ? '#f5f5f5' : 'inherit',
                  '&:hover': { backgroundColor: item.isRead ? '#f5f5f5' : '#f0f7ff' }
                }}
                onClick={() => !item.isRead && markAsRead(item._id)}
                disabled={item.isRead}
              >
                <Box display="flex" alignItems="center" gap={1}>
                  <Box>
                    <Typography fontWeight={item.isRead ? 400 : 500}>{item.message}</Typography>
                    <Typography fontSize={12} color="#888">{new Date(item.created_at).toLocaleString()}</Typography>
                  </Box>
                  {item.isRead && (
                    <Box display="flex" alignItems="center" gap={0.5} ml={1}>
                      <span style={{ color: '#4caf50', fontSize: 16 }}>✔</span>
                      <Typography fontSize={12} color="#4caf50">Đã đọc</Typography>
                    </Box>
                  )}
                </Box>
              </MenuItem>
            ))
          )}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1 }}>
            <Button size="small" color="error" onClick={handleClearNotifications}>Giải phóng thông báo</Button>
            <Button size="small" onClick={handleCloseMenu}>Đóng</Button>
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
  sx: PropTypes.object
};

export default Header;
