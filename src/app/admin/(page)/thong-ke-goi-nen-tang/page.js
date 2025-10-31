"use client";
import React, { useEffect, useState } from "react";
import { Select, MenuItem, CircularProgress, Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import DashboardCard from "@muahub/app/admin/components/shared/DashboardCard";
import SendRequest from "@muahub/utils/SendRequest";
// import { ROLE_MANAGER } from "@muahub/constants/System";
import { useApp } from "@muahub/app/contexts/AppContext";

let Chart = null;

const AdminOverview = () => {
  const { currentUser } = useApp();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [years, setYears] = useState([now.getFullYear()]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [series, setSeries] = useState([]);
  const [categories, setCategories] = useState([]);
  const [topPackages, setTopPackages] = useState([]); // top các gói
  const [userPackages, setUserPackages] = useState([]); // danh sách user đang dùng gói

  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;


  const fetchBookings = async (currentUser) => {
    setLoading(true);
    try {
      const res = await SendRequest("GET", "/api/website-payments", {
        status: "CONFIRM"
        // ownerId: currentUser.role === ROLE_MANAGER.ADMIN ? currentUser.id : ""
      });
      if (res.payload) {
        // console.log("Fetched bookings:", res.payload.payload);
        setData(res.payload.payload);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý dữ liệu giao dịch cho dashboard gói nền tảng
  const [overview, setOverview] = useState({
    userCount: 0,
    totalRevenue: 0,
    totalTransactions: 0
  });

  const packageNameVN = {
    monthly_3: "Gói 3 tháng",
    monthly_6: "Gói 6 tháng",
    yearly: "Gói 1 năm"
  };

  const processData = () => {
    // Chỉ tính các gói monthly_3, monthly_6, yearly
    const validPackages = ["monthly_3", "monthly_6", "yearly"];
    // Lọc theo tháng và năm dựa vào created_at và chỉ lấy các gói hợp lệ
    const filteredData = data.filter((item) => {
      const d = new Date(item.created_at);
      return (
        d.getMonth() + 1 === month &&
        d.getFullYear() === year &&
        validPackages.includes(item.payment_package)
      );
    });

   
    const packageStats = {};
    filteredData.forEach((item) => {
      const pkg = item.payment_package;
      if (!packageStats[pkg]) {
        packageStats[pkg] = { count: 0, total: 0 };
      }
      packageStats[pkg].count += 1;
      packageStats[pkg].total += item.amount || 0;
    });

    // Đảm bảo thứ tự các gói
    const categories = validPackages.filter((pkg) => packageStats[pkg]);
    const countData = categories.map((pkg) => packageStats[pkg].count);
    const totalData = categories.map((pkg) => packageStats[pkg].total);

    // Hiển thị tên gói tiếng Việt trên trục x
    setCategories(categories.map((pkg) => packageNameVN[pkg] || pkg));
    setSeries([
      { name: "Số lượng giao dịch", data: countData },
      { name: "Tổng tiền (VNĐ)", data: totalData }
    ]);

    // Top các gói được đặt nhiều nhất (top 3)
    const sortedPackages = categories
      .map((pkg) => ({ name: packageNameVN[pkg] || pkg, count: packageStats[pkg].count, total: packageStats[pkg].total }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
    setTopPackages(sortedPackages);

    // Danh sách người dùng đang sử dụng các gói (status CONFIRM, payment_package hợp lệ)
    const users = [];
    data.forEach((item) => {
      if (
        item.status === "CONFIRM" &&
        item.owner &&
        item.owner.name &&
        validPackages.includes(item.payment_package)
      ) {
        users.push({
          name: item.owner.name,
          email: item.owner.email,
          payment_package: item.payment_package,
          amount: item.amount,
          avatar: item.owner.avatar,
          payment_expiry: item.owner.payment_expiry
        });
      }
    });
    setUserPackages(users);

    // Tổng quan: số người dùng, tổng giao dịch, tổng tiền
    setOverview({
      userCount: new Set(users.map(u => u.email)).size,
      totalRevenue: filteredData.reduce((sum, item) => sum + (item.amount || 0), 0),
      totalTransactions: filteredData.length
    });
  };

  useEffect(() => {
    if (!Chart) {
      import("react-apexcharts")
        .then((mod) => {
          Chart = mod.default || mod;

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

      const yearSet = new Set(data.map((item) => new Date(item.created_at).getFullYear()));
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
      show: true // Hiện legend để phân biệt 2 series
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
      title="Tổng quan gói nền tảng (theo tháng/năm)"
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
        <>
          {/* Thông tin tổng quan - UI màu hồng, bố cục đẹp */}
          <Box display="flex" gap={3} mb={3} flexWrap="wrap" justifyContent="center">
            <Box sx={{ minWidth: 200, border: '2px solid #fed9d5d7', borderRadius: 3, p: 2.5, background: '#fff0f6', textAlign: 'center', flex: 1, maxWidth: 300 }}>
              <div style={{ fontSize: 15, color: '#000000d9', fontWeight: 600, marginBottom: 4 }}>Người sử dụng dịch vụ</div>
              <div style={{ fontWeight: 700, fontSize: 26, color: '#000000d8' }}>{overview.userCount}</div>
            </Box>
            <Box sx={{ minWidth: 200, border: '2px solid #fed9d5d7', borderRadius: 3, p: 2.5, background: '#fff0f6', textAlign: 'center', flex: 1, maxWidth: 300 }}>
              <div style={{ fontSize: 15, color: '#000000d9', fontWeight: 600, marginBottom: 4 }}>Tổng số giao dịch</div>
              <div style={{ fontWeight: 700, fontSize: 26, color: '#000000d8' }}>{overview.totalTransactions}</div>
            </Box>
            <Box sx={{ minWidth: 200, border: '2px solid #fed9d5d7', borderRadius: 3, p: 2.5, background: '#fff0f6', textAlign: 'center', flex: 1, maxWidth: 300 }}>
              <div style={{ fontSize: 15, color: '#000000d9', fontWeight: 600, marginBottom: 4 }}>Tổng tiền kiếm được</div>
              <div style={{ fontWeight: 700, fontSize: 26, color: '#000000d8' }}>{overview.totalRevenue.toLocaleString()} VNĐ</div>
            </Box>
          </Box>
          <Chart options={optionscolumnchart} series={series} type="bar" height={370} width={"100%"} />
          {/* Top các gói được đặt nhiều nhất - UI màu hồng */}
          <Box mt={4}>
            <h4 style={{ margin: 0, marginBottom: 12, color: '#000000d9', fontWeight: 700, fontSize: 18 }}>Top gói được đặt nhiều nhất</h4>
            <Box display="flex" gap={2} flexWrap="wrap" justifyContent="center">
              {topPackages.length === 0 && (
                <Box sx={{ bgcolor: '#fce4ec', borderRadius: 2, p: 2, minWidth: 180, textAlign: 'center', color: '#888', fontSize: 15 }}>Không có dữ liệu</Box>
              )}
              {topPackages.map((pkg) => (
                <Box key={pkg.name} sx={{
                  border: '2px solid #fed9d5d7',
                  borderRadius: 3,
                  p: 2,
                  minWidth: 180,
                  background: '#fff0f6',
                  mb: 1,
                  textAlign: 'center',
                  flex: 1,
                  maxWidth: 250
                }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: '#000000d8' }}>{pkg.name}</div>
                  <div style={{ color: '#000000d9', fontSize: 14 }}>{pkg.count} lượt, tổng tiền <b style={{ color: '#000000d9' }}>{pkg.total.toLocaleString()} VNĐ</b></div>
                </Box>
              ))}
            </Box>
          </Box>
          {/* Danh sách người dùng đang sử dụng các gói - UI màu hồng */}
          <Box mt={4}>
            <h4 style={{ margin: 0, marginBottom: 12, color: '#000000d9', fontWeight: 700, fontSize: 18 }}>Người dùng đang sử dụng các gói</h4>
            <Box display="flex" flexWrap="wrap" gap={2} justifyContent="center">
              {userPackages.length === 0 && (
                <Box sx={{ bgcolor: '#fce4ec', borderRadius: 2, p: 2, minWidth: 180, textAlign: 'center', color: '#888', fontSize: 15 }}>Không có dữ liệu</Box>
              )}
              {userPackages.map((user, idx) => (
                <Box key={user.email + user.payment_package + idx} sx={{
                  border: '2px solid #fed9d5d7',
                  borderRadius: 3,
                  p: 2,
                  minWidth: 220,
                  background: '#fff0f6',
                  display: 'flex',
                  alignItems: 'center',
                  mb: 1,
                  maxWidth: 350
                }}>
                  {user.avatar && (
                    <img src={user.avatar} alt={user.name} style={{ width: 32, height: 32, borderRadius: "50%", marginRight: 14, objectFit: 'cover', border: '1.5px solid #fed9d5d7' }} />
                  )}
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: '#000000d8' }}>{user.name}</div>
                    <div style={{ color: '#000000d9', fontSize: 13 }}>{user.email}</div>
                    <div style={{ marginTop: 2 }}>
                      <span style={{ color: '#000000d9', fontWeight: 600 }}>{
                        packageNameVN[user.payment_package] || user.payment_package
                      }</span>
                      {user.payment_expiry && (
                        <span style={{ marginLeft: 8, color: '#888', fontSize: 12 }}>
                          (HSD: {new Date(user.payment_expiry).toLocaleDateString("vi-VN")})
                        </span>
                      )}
                    </div>
                  </div>
                </Box>
              ))}
            </Box>
          </Box>
        </>
      )}
    </DashboardCard>
  );
};

export default AdminOverview;
