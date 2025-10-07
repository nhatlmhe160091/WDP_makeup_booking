"use client";
import { Grid, Box, Card, Stack, Typography, Link } from "@mui/material";
// components
import PageContainer from "@muahub/app/makeup-artists/components/container/PageContainer";
import Logo from "@muahub/app/makeup-artists/layout/shared/logo/Logo";
import AuthLogin from "../auth/AuthLogin";

const Login2 = () => {
  return (
    <PageContainer title="Đăng nhập" description="Trang đăng nhập">
      <Box
        sx={{
          position: "relative",
          "&:before": {
            content: '""',
            background: "radial-gradient(#d2f1df, #d3d7fa, #bad8f4)",
            backgroundSize: "400% 400%",
            animation: "gradient 15s ease infinite",
            position: "absolute",
            height: "100%",
            width: "100%",
            opacity: "0.3"
          }
        }}
      >
        <Grid container spacing={0} justifyContent="center" sx={{ height: "100vh" }}>
          <Grid item xs={12} sm={12} lg={5} xl={4} display="flex" justifyContent="center" alignItems="center">
            <Card elevation={9} sx={{ p: 4, zIndex: 1, width: "100%", maxWidth: "600px" }}>
              <Box display="flex" alignItems="center" justifyContent="center">
                <Logo />
              </Box>
              <AuthLogin
                subtext={
                  <Typography variant="subtitle1" textAlign="center" color="textSecondary" mb={1}>
                    Đăng nhập vào trang quản lý dịch vụ makeup của bạn
                  </Typography>
                }
                subtitle={
                  <Typography variant="subtitle1" textAlign="center" color="textSecondary" mt={1}>
                    Nếu bạn có dịch vụ makeup và muốn quản lý dịch vụ makeup của mình, hãy đăng ký tài khoản{" "}
                    <Link href="/makeup-artists/dang-ky">tại đây</Link>
                  </Typography>
                }
              />
            </Card>
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
};
export default Login2;
