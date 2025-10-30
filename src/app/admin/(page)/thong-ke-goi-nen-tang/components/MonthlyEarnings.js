import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "@mui/material/styles";
import { Stack, Typography, Avatar, Fab, CircularProgress, Box } from "@mui/material";
import { IconArrowDownRight, IconCurrencyDollar } from "@tabler/icons-react";
import DashboardCard from "@muahub/app/admin/components/shared/DashboardCard";
import SendRequest from "@muahub/utils/SendRequest";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const MonthlyEarnings = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [series, setSeries] = useState([]);

  // chart color
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;
  const secondarylight = "#f5fcff";
  const errorlight = "#fdede8";

  // Hàm lấy dữ liệu từ API
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await SendRequest("GET", "/api/transactions");
      if (res.payload) {
        setData(res.payload);
        processEarningsData(res.payload);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý dữ liệu thu nhập
  const processEarningsData = (transactions) => {
    const currentMonth = new Date().getMonth() + 1;

    // Tính tổng thu nhập cho tháng hiện tại
    const total = transactions
      .filter((item) => item.type === "export" && new Date(item.created_at).getMonth() + 1 === currentMonth)
      .reduce((acc, item) => acc + item.totalPrice, 0);

    setTotalEarnings(total);

    // Dữ liệu cho biểu đồ
    const dates = transactions
      .filter((item) => new Date(item.created_at).getMonth() + 1 === currentMonth)
      .map((item) => new Date(item.created_at).toLocaleDateString("vi-VN"));

    const importData = transactions
      .filter((item) => item.type === "import" && new Date(item.created_at).getMonth() + 1 === currentMonth)
      .map((item) => item.totalPrice);

    const exportData = transactions
      .filter((item) => item.type === "export" && new Date(item.created_at).getMonth() + 1 === currentMonth)
      .map((item) => item.totalPrice);

    setSeries([
      { name: "Nhập hàng", data: importData },
      { name: "Xuất hàng", data: exportData }
    ]);
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Cấu hình biểu đồ
  const optionscolumnchart = {
    chart: {
      type: "area",
      fontFamily: "'Plus Jakarta Sans', sans-serif;",
      foreColor: "#adb0bb",
      toolbar: { show: false },
      height: 60,
      sparkline: { enabled: true }
    },
    stroke: {
      curve: "smooth",
      width: 2
    },
    fill: {
      colors: [secondarylight],
      type: "solid",
      opacity: 0.1
    },
    markers: { size: 0 },
    tooltip: {
      theme: theme.palette.mode === "dark" ? "dark" : "light"
    }
  };

  return (
    <DashboardCard
      title="Thu nhập theo tháng"
      action={
        <Fab color="secondary" size="medium" sx={{ color: "#ffffff" }}>
          <IconCurrencyDollar width={24} />
        </Fab>
      }
      footer={
        loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height={60}>
            <CircularProgress />
          </Box>
        ) : (
          <Chart options={optionscolumnchart} series={series} type="area" height={60} width="100%" />
        )
      }
    >
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height={100}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Typography variant="h3" fontWeight="700" mt="-20px">
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND"
            }).format(totalEarnings)}
          </Typography>
          <Stack direction="row" spacing={1} my={1} alignItems="center">
            <Avatar sx={{ bgcolor: errorlight, width: 27, height: 27 }}>
              <IconArrowDownRight width={20} color="#FA896B" />
            </Avatar>
            <Typography variant="subtitle2" fontWeight="600">
              +9%
            </Typography>
            <Typography variant="subtitle2" color="textSecondary">
              last year
            </Typography>
          </Stack>
        </>
      )}
    </DashboardCard>
  );
};

export default MonthlyEarnings;
