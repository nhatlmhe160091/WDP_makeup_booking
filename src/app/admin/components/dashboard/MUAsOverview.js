import React, { useEffect, useState } from "react";
import { Select, MenuItem, CircularProgress, Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import DashboardCard from "@muahub/app/admin/components/shared/DashboardCard";
import SendRequest from "@muahub/utils/SendRequest";
import { ROLE_MANAGER } from "@muahub/constants/System";
import { useApp } from "@muahub/app/contexts/AppContext";

let Chart = null;

const MUAsOverview = () => {
  const { currentUser } = useApp();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [years, setYears] = useState([now.getFullYear()]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [series, setSeries] = useState([]);
  const [categories, setCategories] = useState([]);

  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;

  // Hàm gọi API để lấy dữ liệu đặt lịch makeup
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

  // Xử lý dữ liệu giao dịch cho biểu đồ
  const processData = () => {
    // Lọc theo tháng và năm
    const filteredData = data.filter((item) => {
      const d = new Date(item.date);
      return d.getMonth() + 1 === month && d.getFullYear() === year;
    });

    let categories = filteredData.map((item) => new Date(item.date).toLocaleDateString("vi-VN"));
    let depositData = filteredData.map((item) => item.deposit);

    // set unique categories
    categories = [...new Set(categories)];
    // set depositData to 0 if no deposit
    depositData = categories.map((category) => {
      const index = filteredData.findIndex((item) => new Date(item.date).toLocaleDateString("vi-VN") === category);
      return index !== -1 ? filteredData[index].deposit : 0;
    });

    setCategories(categories);
    setSeries([{ name: "Đặt cọc", data: depositData }]);
  };

  useEffect(() => {
    // dynamic import react-apexcharts with error handling
    if (!Chart) {
      import("react-apexcharts")
        .then((mod) => {
          Chart = mod.default || mod;
          // reprocess to trigger chart render after module load
          if (data.length) {
            processData();
          }
        })
        .catch((e) => {
          console.error("Failed to load chart lib:", e);
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
  }, [data, month, year]);

  // Cấu hình biểu đồ
  const optionscolumnchart = {
    chart: {
      type: "bar",
      fontFamily: "'Plus Jakarta Sans', sans-serif;",
      foreColor: "#adb0bb",
      toolbar: { show: true },
      height: 370
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
    <DashboardCard
      title="Tổng quan đặt lịch makeup"
      action={
        <Box display="flex" gap={2}>
          <Select labelId="month-dd" id="month-dd" value={month} size="small" onChange={(e) => setMonth(Number(e.target.value))}>
            {[...Array(12).keys()].map((m) => (
              <MenuItem key={m + 1} value={m + 1}>{`Tháng ${m + 1}`}</MenuItem>
            ))}
          </Select>
          <Select labelId="year-dd" id="year-dd" value={year} size="small" onChange={(e) => setYear(Number(e.target.value))}>
            {years.map((y) => (
              <MenuItem key={y} value={y}>{y}</MenuItem>
            ))}
          </Select>
        </Box>
      }
    >
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="370px">
          <CircularProgress />
        </Box>
      ) : !Chart ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="370px">
          Không thể tải biểu đồ. Vui lòng refresh trang.
        </Box>
      ) : (
        <Chart options={optionscolumnchart} series={series} type="bar" height={370} width={"100%"} />
      )}
    </DashboardCard>
  );
};

export default MUAsOverview;
