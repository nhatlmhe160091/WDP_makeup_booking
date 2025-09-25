import React, { useState } from "react";
import { Box, Typography, FormGroup, FormControlLabel, Button, Stack, Checkbox, CircularProgress } from "@mui/material";
import Link from "next/link";
import CustomTextField from "@quanlysanbong/app/chu-san/components/forms/theme-elements/CustomTextField";
import SendRequest from "@quanlysanbong/utils/SendRequest";
import toast from "react-hot-toast";
import SearchAddressComponent from "../../components/SearchAddressComponent";
import { ROLE_MANAGER } from "@quanlysanbong/constants/System";

const AuthRegister = ({ title, subtitle, subtext }) => {
  const [account, setAccount] = useState({
    name: "",
    email: "",
    password: "",
    location: ""
  });

  const [location, setLocation] = useState("");

  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!account.name) {
      toast.error("Vui lòng nhập tên.");
      return false;
    }
    if (!account.email) {
      toast.error("Vui lòng nhập email.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(account.email)) {
      toast.error("Vui lòng nhập email hợp lệ.");
      return false;
    }
    if (!account.password) {
      toast.error("Vui lòng nhập mật khẩu.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    try {
      const res = await SendRequest("POST", "/api/users", { ...account, address: location, role: ROLE_MANAGER.ADMIN });
      if (res.payload) {
        toast.success("Đăng ký thành công");
        window.location.href = "/chu-san/dang-nhap";
      } else {
        toast.error("Đăng ký thất bại, vui lòng kiểm tra thông tin của bạn.");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {title ? (
        <Typography fontWeight="700" variant="h2" mb={1}>
          {title}
        </Typography>
      ) : null}

      {subtext}

      <Stack>
        <Box>
          <Typography variant="subtitle1" fontWeight={600} component="label" htmlFor="name" mb="5px">
            Họ và tên
          </Typography>
          <CustomTextField
            variant="outlined"
            fullWidth
            value={account.name}
            onChange={(e) => setAccount({ ...account, name: e.target.value })}
          />
        </Box>
        <Box mt="25px">
          <Typography variant="subtitle1" fontWeight={600} component="label" htmlFor="email" mb="5px">
            Email
          </Typography>
          <CustomTextField
            variant="outlined"
            fullWidth
            value={account.email}
            onChange={(e) => setAccount({ ...account, email: e.target.value })}
          />
        </Box>
        <Box mt="25px">
          <Typography variant="subtitle1" fontWeight={600} component="label" htmlFor="password" mb="5px">
            Mật khẩu
          </Typography>
          <CustomTextField
            type="password"
            variant="outlined"
            fullWidth
            value={account.password}
            onChange={(e) => setAccount({ ...account, password: e.target.value })}
          />
        </Box>
        <Box mt="25px">
          <Typography variant="subtitle1" fontWeight={600} component="label" htmlFor="location" mb="5px">
            Nơi ở hiện tại (không bắt buộc)
          </Typography>
          {/* <CustomTextField
            variant="outlined"
            fullWidth
            value={account.location}
            onChange={(e) => setAccount({ ...account, location: e.target.value })}
          /> */}
          <SearchAddressComponent className={""} onSearch={setLocation} oldSearch="Hà Nội" />
        </Box>
      </Stack>
      <Box mt={3}>
        <Button
          color="primary"
          variant="contained"
          size="large"
          fullWidth
          onClick={handleSubmit}
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} color="inherit" />}
        >
          {loading ? "Đang đăng ký..." : "Đăng ký"}
        </Button>
      </Box>
      {subtitle}
    </>
  );
};

export default AuthRegister;
