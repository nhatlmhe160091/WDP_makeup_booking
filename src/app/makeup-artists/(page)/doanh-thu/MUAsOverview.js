import React, { useEffect, useState } from "react";
import { Select, MenuItem, CircularProgress, Box, TextField } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import SendRequest from "@muahub/utils/SendRequest";
import { ROLE_MANAGER } from "@muahub/constants/System";
import { useApp } from "@muahub/app/contexts/AppContext";

let Chart = null;

const MUAsOverview = () => {
  const { currentUser } = useApp();
  const now = new Date();
  const [selectedDate, setSelectedDate] = useState(now.toISOString().slice(0, 10)); // yyyy-mm-dd
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [series, setSeries] = useState([]);
  const [categories, setCategories] = useState([]);

  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;

  // Fetch bookings
  const fetchBookings = async (currentUser) => {
    setLoading(true);
    try {
      const res = await SendRequest("GET", "/api/orders", {
        ownerId: currentUser.role === ROLE_MANAGER.MUA ? currentUser.id : ""
      });
      if (res.payload) {
        setData(res.payload);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  // Lọc và xử lý dữ liệu cho biểu đồ theo giờ trong ngày
  const processData = () => {
    if (!data.length) return;
    // Lọc theo ngày được chọn
    const filtered = data.filter((item) => {
      const d = new Date(item.date);
      // So sánh yyyy-mm-dd
      return d.toISOString().slice(0, 10) === selectedDate;
    });
    // Gom nhóm theo giờ (0-23)
    const revenueByHour = Array(24).fill(0);
    filtered.forEach((item) => {
      const d = new Date(item.date);
      const hour = d.getHours();
      revenueByHour[hour] += item.deposit;
    });
    setCategories(Array.from({ length: 24 }, (_, i) => `${i}:00`));
    setSeries([{ name: "Đặt cọc", data: revenueByHour }]);
  };

  useEffect(() => {
    if (!Chart) {
      import("react-apexcharts")
        .then((mod) => {
          Chart = mod.default || mod;
          if (data.length) processData();
        })
        .catch((e) => {
          console.error("Không thể tải thư viện biểu đồ:", e);
        });
    }
    if (Object.keys(currentUser).length === 0) return;
    fetchBookings(currentUser);
  }, [currentUser]);

  useEffect(() => {
    if (data.length) {
      processData();
    }
  }, [data, selectedDate]);

  const options = {
    chart: {
      type: "bar",
      fontFamily: "'Plus Jakarta Sans', sans-serif;",
      foreColor: "#adb0bb",
      toolbar: { show: true },
      height: 300
    },
    colors: [primary, secondary],
    plotOptions: {
      bar: {
        horizontal: false,
        barHeight: "60%",
        columnWidth: "42%",
        borderRadius: [6]
      }
    },
    stroke: {
      show: true,
      width: 5,
      colors: ["transparent"]
    },
    dataLabels: {
      enabled: false
    },
    legend: {
      show: false
    },
    grid: {
      borderColor: "rgba(0,0,0,0.1)",
      strokeDashArray: 3
    },
    yaxis: {
      tickAmount: 4
    },
    xaxis: {
      categories: categories,
      axisBorder: { show: false }
    },
    tooltip: {
      theme: "dark",
      fillSeriesColor: false
    }
  };

  return (
    <Box mb={4}>
      <Box mb={2} fontWeight={600} fontSize={20} display="flex" alignItems="center" gap={2}>
        Tổng quan doanh thu theo giờ trong ngày
        <TextField
          type="date"
          size="small"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          sx={{ minWidth: 160 }}
          inputProps={{ max: now.toISOString().slice(0, 10) }}
        />
      </Box>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="300px">
          <CircularProgress />
        </Box>
      ) : !Chart ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="300px">
          Không thể tải biểu đồ. Vui lòng refresh trang.
        </Box>
      ) : (
        <Chart options={options} series={series} type="bar" height={300} width={"100%"} />
      )}
    </Box>
  );
};

export default MUAsOverview;
