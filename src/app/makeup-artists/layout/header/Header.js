import React, { useState, useEffect } from "react";
import { Box, AppBar, Toolbar, styled, Stack, IconButton, Badge, Button, Menu, MenuItem, Typography } from "@mui/material";
import PropTypes from "prop-types";
// import Link from "next/link";
import { useRouter } from "next/navigation";
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

  // Lấy userId từ localStorage (giả sử đã lưu khi đăng nhập)
  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        let userId = null;
        if (typeof window !== 'undefined') {
          userId = localStorage.getItem('userId');
        }
        // Lấy tất cả thông báo, không lọc isRead
        const url = userId
          ? `/api/notifications/owner?userId=${userId}`
          : `/api/notifications/owner`;
        const res = await fetch(url);
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
  const router = useRouter();
  // Hàm đánh dấu đã đọc và chuyển trang với orderId
  const handleReadAndGo = async (item) => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item._id })
      });
      setNotifications((prev) => prev.map((n) => n._id === item._id ? { ...n, isRead: true } : n));
    } catch (e) {}
    if (item.orderId) {
      router.push(`/makeup-artists/danh-sach-dat-lich?orderId=${item.orderId}`);
    } else {
      router.push('/makeup-artists/danh-sach-dat-lich');
    }
    setAnchorEl(null);
  };

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseMenu = () => {
    setAnchorEl(null);
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
                onClick={() => !item.isRead && handleReadAndGo(item)}
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
          <Box sx={{ textAlign: "right", p: 1 }}>
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
