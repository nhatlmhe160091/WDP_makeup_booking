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

  // Hàm gọi API để lấy dữ liệu đặt lịch makeup
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

    // Gom nhóm theo payment_package
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

    setCategories(categories);
    setSeries([
      { name: "Số lượng giao dịch", data: countData },
      { name: "Tổng tiền (VNĐ)", data: totalData }
    ]);

    // Top các gói được đặt nhiều nhất (top 3)
    const sortedPackages = categories
      .map((pkg) => ({ name: pkg, count: packageStats[pkg].count, total: packageStats[pkg].total }))
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
      // Lấy danh sách năm có trong dữ liệu (dựa vào created_at)
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
          {/* Thông tin tổng quan - UI đẹp hơn */}
          <Box display="flex" gap={3} mb={3} flexWrap="wrap" justifyContent="center">
            <Box
              sx={{
                minWidth: 220,
                bgcolor: '#e3f2fd',
                borderRadius: 3,
                p: 2,
                boxShadow: 2,
                display: 'flex',
                alignItems: 'center',
                mb: { xs: 2, md: 0 }
              }}
            >
              <span style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: '#1976d2',
                color: '#fff',
                marginRight: 16,
                fontSize: 24
              }}>👥</span>
              <div>
                <div style={{ fontSize: 15, color: '#1976d2', fontWeight: 500 }}>Người sử dụng dịch vụ</div>
                <div style={{ fontWeight: 700, fontSize: 26 }}>{overview.userCount}</div>
              </div>
            </Box>
            <Box
              sx={{
                minWidth: 220,
                bgcolor: '#fff3e0',
                borderRadius: 3,
                p: 2,
                boxShadow: 2,
                display: 'flex',
                alignItems: 'center',
                mb: { xs: 2, md: 0 }
              }}
            >
              <span style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: '#ff9800',
                color: '#fff',
                marginRight: 16,
                fontSize: 24
              }}>📦</span>
              <div>
                <div style={{ fontSize: 15, color: '#ff9800', fontWeight: 500 }}>Tổng số giao dịch</div>
                <div style={{ fontWeight: 700, fontSize: 26 }}>{overview.totalTransactions}</div>
              </div>
            </Box>
            <Box
              sx={{
                minWidth: 220,
                bgcolor: '#e8f5e9',
                borderRadius: 3,
                p: 2,
                boxShadow: 2,
                display: 'flex',
                alignItems: 'center',
                mb: { xs: 2, md: 0 }
              }}
            >
              <span style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: '#43a047',
                color: '#fff',
                marginRight: 16,
                fontSize: 24
              }}>💰</span>
              <div>
                <div style={{ fontSize: 15, color: '#43a047', fontWeight: 500 }}>Tổng tiền kiếm được</div>
                <div style={{ fontWeight: 700, fontSize: 26 }}>{overview.totalRevenue.toLocaleString()} VNĐ</div>
              </div>
            </Box>
          </Box>
          <Chart options={optionscolumnchart} series={series} type="bar" height={370} width={"100%"} />
          {/* Top các gói được đặt nhiều nhất - UI đẹp hơn */}
          <Box mt={4}>
            <h4 style={{ margin: 0, marginBottom: 16, color: '#1976d2', fontWeight: 600, fontSize: 20, letterSpacing: 0.5 }}>Top gói được đặt nhiều nhất</h4>
            <Box display="flex" gap={2} flexWrap="wrap">
              {topPackages.length === 0 && (
                <Box sx={{ bgcolor: '#f5f5f5', borderRadius: 2, p: 2, minWidth: 220, textAlign: 'center', color: '#888' }}>Không có dữ liệu</Box>
              )}
              {topPackages.map((pkg, idx) => (
                <Box key={pkg.name} sx={{
                  bgcolor: idx === 0 ? '#e3f2fd' : idx === 1 ? '#fff3e0' : '#e8f5e9',
                  borderRadius: 3,
                  p: 2,
                  minWidth: 220,
                  boxShadow: 1,
                  display: 'flex',
                  alignItems: 'center',
                  mb: 1
                }}>
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    background: idx === 0 ? '#1976d2' : idx === 1 ? '#ff9800' : '#43a047',
                    color: '#fff',
                    marginRight: 14,
                    fontSize: 20
                  }}>🏆</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 17 }}>{pkg.name}</div>
                    <div style={{ color: '#888', fontSize: 14 }}>{pkg.count} lượt, tổng tiền <b style={{ color: '#1976d2' }}>{pkg.total.toLocaleString()} VNĐ</b></div>
                  </div>
                </Box>
              ))}
            </Box>
          </Box>
          {/* Danh sách người dùng đang sử dụng các gói - UI đẹp hơn */}
          <Box mt={4}>
            <h4 style={{ margin: 0, marginBottom: 16, color: '#43a047', fontWeight: 600, fontSize: 20, letterSpacing: 0.5 }}>Người dùng đang sử dụng các gói</h4>
            <Box display="flex" flexWrap="wrap" gap={2}>
              {userPackages.length === 0 && (
                <Box sx={{ bgcolor: '#f5f5f5', borderRadius: 2, p: 2, minWidth: 220, textAlign: 'center', color: '#888' }}>Không có dữ liệu</Box>
              )}
              {userPackages.map((user, idx) => (
                <Box key={user.email + user.payment_package + idx} sx={{
                  bgcolor: '#fff',
                  borderRadius: 3,
                  p: 2,
                  minWidth: 260,
                  boxShadow: 1,
                  display: 'flex',
                  alignItems: 'center',
                  mb: 1,
                  border: '1px solid #e0e0e0'
                }}>
                  {user.avatar && (
                    <img src={user.avatar} alt={user.name} style={{ width: 36, height: 36, borderRadius: "50%", marginRight: 14, objectFit: 'cover', border: '2px solid #1976d2' }} />
                  )}
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>{user.name}</div>
                    <div style={{ color: '#888', fontSize: 13 }}>{user.email}</div>
                    <div style={{ marginTop: 2 }}>
                      <span style={{ color: '#1976d2', fontWeight: 500 }}>{user.payment_package}</span>
                      {user.payment_expiry && (
                        <span style={{ marginLeft: 8, color: '#888', fontSize: 13 }}>
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
