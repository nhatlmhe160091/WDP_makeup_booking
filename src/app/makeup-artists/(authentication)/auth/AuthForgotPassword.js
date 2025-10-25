import React, { useState } from "react";
import { Box, Typography, Button, Stack, CircularProgress } from "@mui/material";
import Link from "next/link";
import CustomTextField from "@muahub/app/makeup-artists/components/forms/theme-elements/CustomTextField";
import SendRequest from "@muahub/utils/SendRequest";
import toast from "react-hot-toast";
import Button from '@mui/material/Button';
const AuthForgotPassword = ({ title, subtitle, subtext }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!email) {
      toast.error("Vui lòng nhập email.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Vui lòng nhập email hợp lệ.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    try {
      const res = await SendRequest("POST", "/api/users/forgot-password", { email });
      if (res.success) {
        toast.success("Yêu cầu đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra email.");
      } else {
        toast.error("Không thể gửi yêu cầu, vui lòng thử lại.");
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
          <Typography variant="subtitle1" fontWeight={600} component="label" htmlFor="Email" mb="5px">
            Email
          </Typography>
          <CustomTextField variant="outlined" fullWidth value={email} onChange={(e) => setEmail(e.target.value)} />
        </Box>
      </Stack>

      <Box mt="25px">
        <Button
          color="primary"
          variant="contained"
          size="large"
          fullWidth
          onClick={handleSubmit}
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} color="inherit" />}
        >
          {loading ? "Đang gửi yêu cầu..." : "Gửi yêu cầu"}
        </Button>
      </Box>

      <Typography mt={2} textAlign="center">
        <Link href="/login" style={{ textDecoration: "none", color: "primary.main" }}>
          Quay lại trang đăng nhập
        </Link>
      </Typography>

      {subtitle}
    </>
  );
};

export default AuthForgotPassword;
