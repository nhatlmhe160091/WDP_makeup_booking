import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "@mui/material/styles";
import { Grid, Stack, Typography, Avatar, CircularProgress, Box } from "@mui/material";
import { IconArrowUpLeft } from "@tabler/icons-react";
import DashboardCard from "@muahub/app/makeup-artists/components/shared/DashboardCard";
import SendRequest from "@muahub/utils/SendRequest";
import { useApp } from "@muahub/app/contexts/AppContext";
import { formatCurrency } from "@muahub/utils/Main";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const ProductTotal = () => {
  const { currentUser } = useApp();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [available, setAvailable] = useState(0);
  const [used, setUsed] = useState(0);
  const [series, setSeries] = useState([]);

  // Lấy màu sắc từ theme
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const primarylight = "#ecf2ff";
  const successlight = theme.palette.success.light;

  // Hàm lấy dữ liệu từ API

  // Xử lý dữ liệu sản phẩm cho biểu đồ
  const processProductData = (currentUser) => {
    const totalPrice = currentUser.totalPrice;
    const totalWithdrawn = currentUser.withdrawn;

    setTotal(totalPrice);
    setAvailable(totalPrice - totalWithdrawn);
    setUsed(totalWithdrawn);

    // Cập nhật dữ liệu cho biểu đồ
    setSeries([totalPrice - totalWithdrawn, totalWithdrawn, 0]);
  };

  useEffect(() => {
    if (Object.keys(currentUser).length !== 0) {
      processProductData(currentUser);
    }
  }, [currentUser]);

  // Cấu hình biểu đồ
  const optionscolumnchart = {
    chart: {
      type: "donut",
      fontFamily: "'Plus Jakarta Sans', sans-serif;",
      foreColor: "#adb0bb",
      toolbar: { show: false },
      height: 155
    },
    colors: [primary, primarylight, "#F9F9FD"],
    plotOptions: {
      pie: {
        startAngle: 0,
        endAngle: 360,
        donut: {
          size: "75%",
          background: "transparent"
        }
      }
    },
    tooltip: {
      theme: theme.palette.mode === "dark" ? "dark" : "light",
      fillSeriesColor: false
    },
    stroke: { show: false },
    dataLabels: { enabled: false },
    legend: { show: false }
  };

  return (
    <DashboardCard title="Tổng quan tài chính">
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height={150}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Thông tin sản phẩm */}
          <Grid item xs={7} sm={7}>
            <Typography variant="h5" fontWeight="500">
              Tổng tiền: {formatCurrency(total)}
            </Typography>
            <Stack direction="row" spacing={1} mt={1} alignItems="center">
              <IconArrowUpLeft size={20} color={successlight} />
              <Typography variant="subtitle2" color="textSecondary">
                Còn lại: {formatCurrency(available)}
              </Typography>
            </Stack>
            <Stack spacing={3} mt={5} direction="row">
              <Stack direction="row" spacing={1} alignItems="center">
                <Avatar sx={{ width: 9, height: 9, bgcolor: primary }}></Avatar>
                <Typography variant="subtitle2" color="textSecondary">
                  Còn lại
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Avatar sx={{ width: 9, height: 9, bgcolor: primarylight }}></Avatar>
                <Typography variant="subtitle2" color="textSecondary">
                  Đã rút
                </Typography>
              </Stack>
            </Stack>
          </Grid>
          {/* Biểu đồ tổng quan */}
          <Grid item xs={5} sm={5}>
            <Chart options={optionscolumnchart} series={series} type="donut" height={150} width={"100%"} />
          </Grid>
        </Grid>
      )}
    </DashboardCard>
  );
};

export default ProductTotal;
