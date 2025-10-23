import React, { useEffect, useState } from "react";
import { Select, MenuItem, CircularProgress, Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import SendRequest from "@muahub/utils/SendRequest";
import { ROLE_MANAGER } from "@muahub/constants/System";
import { useApp } from "@muahub/app/contexts/AppContext";

let Chart = null;

const MUAsOverview = () => {
  const { currentUser } = useApp();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [series, setSeries] = useState([]);
  const [categories, setCategories] = useState([]);
  const [years, setYears] = useState([now.getFullYear()]);

  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;

  // Fetch bookings
  const fetchBookings = async (currentUser) => {
    setLoading(true);
    try {
      const res = await SendRequest("GET", "/api/orders", {
        ownerId: currentUser.role === ROLE_MANAGER.MUA ? currentUser._id : ""
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

  // Lọc và xử lý dữ liệu cho biểu đồ theo tháng/năm
  const processData = () => {
    if (!data.length) return;
    // Lọc theo tháng và năm
    const filtered = data.filter((item) => {
      const d = new Date(item.date);
      return d.getMonth() + 1 === month && d.getFullYear() === year;
    });
    // Gom nhóm theo tuần
    const bookingsByWeek = {};
    filtered.forEach((item) => {
      const date = new Date(item.date);
      const firstDay = new Date(date.getFullYear(), 0, 1);
      const dayOfYear = ((date - firstDay + 86400000) / 86400000);
      const weekNum = Math.ceil(dayOfYear / 7);
      const key = `Tuần ${weekNum}`;
      if (!bookingsByWeek[key]) bookingsByWeek[key] = 0;
      bookingsByWeek[key] += item.deposit;
    });
    const sortedWeeks = Object.keys(bookingsByWeek).sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, ""));
      const numB = parseInt(b.replace(/\D/g, ""));
      return numA - numB;
    });
    setCategories(sortedWeeks);
    setSeries([{ name: "Đặt cọc", data: sortedWeeks.map((w) => bookingsByWeek[w]) }]);
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
      // Lấy danh sách năm có trong dữ liệu
      const yearSet = new Set(data.map((item) => new Date(item.date).getFullYear()));
      setYears(Array.from(yearSet).sort((a, b) => a - b));
      processData();
    }
    // eslint-disable-next-line
  }, [data, month, year]);

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
        Tổng quan đặt lịch theo tuần
        <Select
          size="small"
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          sx={{ minWidth: 100 }}
        >
          {[...Array(12).keys()].map((m) => (
            <MenuItem key={m + 1} value={m + 1}>{`Tháng ${m + 1}`}</MenuItem>
          ))}
        </Select>
        <Select
          size="small"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          sx={{ minWidth: 100 }}
        >
          {years.map((y) => (
            <MenuItem key={y} value={y}>{y}</MenuItem>
          ))}
        </Select>
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
