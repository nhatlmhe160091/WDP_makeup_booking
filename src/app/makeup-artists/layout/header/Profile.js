import React, { useState } from "react";
import { Avatar, Box, Menu, Button, IconButton, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import SendRequest from "@muahub/utils/SendRequest";
import { useCallback, useEffect } from "react";

import { IconKey, IconUser, IconUserEdit } from "@tabler/icons-react";
import { useApp } from "@muahub/app/contexts/AppContext";
import { ROLE_MANAGER_TEXT } from "@muahub/constants/System";
import Link from "next/link";

const Profile = () => {
  const { currentUser } = useApp();
  const [anchorEl2, setAnchorEl2] = useState(null);
  const [currentUserMe, setCurrentUserMe] = useState(null);
  const [remainingDays, setRemainingDays] = useState(0);

  const handleClick2 = (event) => {
    setAnchorEl2(event.currentTarget);
  };
  const handleClose2 = () => {
    setAnchorEl2(null);
  };

  const logout = () => {
    // Logout
    localStorage.removeItem("token");
    window.location.href = "/dang-nhap";
  };
  // call api me
  const fetchMe = useCallback(async () => {
    try {
      const res = await SendRequest("GET", "/api/me");
      if (res.payload) {
        setCurrentUserMe(res.payload);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }, []);
  useEffect(() => {
    if (!currentUser) {
      fetchMe();
    } else {
      setCurrentUserMe(currentUser);
    }
  }, [currentUser, fetchMe]);

  //  lọc ra ngày mới nhất trong payment_history
  const latestPayment = currentUserMe?.payment_history?.reduce((latest, payment) => {
    const paymentDate = new Date(payment.date);
    return paymentDate > latest ? paymentDate : latest;
  }, new Date(0));
  //  lấy ra ngày tháng hiện tại
  const currentDate = new Date();
  // lấy ra curentDate là ngày hôm nay + 7 ngày
  const currentDateDays = new Date(currentDate);

  // lấy currentDate và latestPayment so sánh xem đã qua bao nhiêu ngày rồi
  const daysSinceLastPayment = Math.floor((currentDateDays - latestPayment) / (1000 * 60 * 60 * 24));

  useEffect(() => {
    if (currentUserMe?.payment_history && currentUserMe?.payment_history.length > 0) {
      const latestPayment = currentUserMe.payment_history[currentUserMe.payment_history.length - 1];
      const paymentType = latestPayment.payment_type;
      let daysLeft = 0;

      switch (paymentType) {
        case "yearly":
          daysLeft = 365 - daysSinceLastPayment;
          break;
        case "monthly_6":
          daysLeft = 180 - daysSinceLastPayment;
          break;
        case "monthly_3":
          daysLeft = 90 - daysSinceLastPayment;
          break;
        case "revenue":
          daysLeft = null; // Không thông báo hết hạn
          break;
        default:
          daysLeft = null; // Không thông báo hết hạn
      }

      setRemainingDays(daysLeft);
    }
  }, [currentUserMe, daysSinceLastPayment, remainingDays]);

  return (
    <Box sx={{ display: "flex" }}>
      {/* hi account */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "text.primary",
          fontWeight: "medium",
          fontSize: "14px",
          mr: 1
        }}
      >
        Hi, {currentUser?.name || ""} !
      </Box>

      <IconButton
        size="large"
        aria-label="show 11 new notifications"
        color="inherit"
        aria-controls="msgs-menu"
        aria-haspopup="true"
        sx={{
          ...(typeof anchorEl2 === "object" && {
            color: "primary.main"
          })
        }}
        onClick={handleClick2}
      >
        <Avatar
          src={currentUser?.avatar || ""}
          alt="image"
          sx={{
            width: 35,
            height: 35
          }}
        />
      </IconButton>
      {/* ------------------------------------------- */}
      {/* Message Dropdown */}
      {/* ------------------------------------------- */}
      <Menu
        id="msgs-menu"
        anchorEl={anchorEl2}
        keepMounted
        open={Boolean(anchorEl2)}
        onClose={handleClose2}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        sx={{
          "& .MuiMenu-paper": {
            width: "200px"
          }
        }}
      >
        <MenuItem>
          <ListItemIcon>
            <IconKey width={20} />
          </ListItemIcon>
          <ListItemText>
            {ROLE_MANAGER_TEXT[currentUser?.role] || 1} {remainingDays == null ? "" : `(${remainingDays})`}
          </ListItemText>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <IconUserEdit width={20} />
          </ListItemIcon>
          <Link href="/trang-ca-nhan">
            <ListItemText>Tài khoản của tôi</ListItemText>
          </Link>
        </MenuItem>
        <Box mt={1} py={1} px={2}>
          <Button variant="outlined" color="primary" fullWidth onClick={logout}>
            Đăng xuất
          </Button>
        </Box>
      </Menu>
    </Box>
  );
};

export default Profile;
