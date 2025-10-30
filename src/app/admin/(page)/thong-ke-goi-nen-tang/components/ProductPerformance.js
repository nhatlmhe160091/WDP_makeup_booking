import {
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Button,
  CircularProgress,
  Link
} from "@mui/material";
import { useEffect, useState } from "react";
import DashboardCard from "@muahub/app/admin/components/shared/DashboardCard";
import SendRequest from "@muahub/utils/SendRequest";
import { ROLE_MANAGER } from "@muahub/constants/System";
import { useApp } from "@muahub/app/contexts/AppContext";

const ProductPerformance = () => {
  const { currentUser } = useApp();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch dữ liệu từ API
  const fetchData = async (currentUser) => {
    setLoading(true);
    try {
      const res = await SendRequest("GET", "/api/orders", {
        ownerId: currentUser.role === ROLE_MANAGER.MUA ? currentUser.id : ""
      });
      if (res.payload) {
        // Tính số lần đặt của từng dịch vụ makeup
        const serviceCounts = res.payload.reduce((acc, booking) => {
          const serviceId = booking.serviceId;
          if (!acc[serviceId]) {
            acc[serviceId] = {
              count: 0,
              serviceName: booking.service.serviceName,
              location: booking.service.location
            };
          }
          acc[serviceId].count += 1;
          return acc;
        }, {});

        // Chuyển đổi thành mảng và sắp xếp theo số lần đặt giảm dần
        const sortedServices = Object.values(serviceCounts).sort((a, b) => b.count - a.count);

        // Lấy top 5 dịch vụ được đặt nhiều nhất
        const top5Services = sortedServices.slice(0, 5);
        setData(top5Services);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (Object.keys(currentUser).length === 0) return;
    fetchData(currentUser);
  }, [currentUser]);

  return (
    <DashboardCard
      title="Top 5 dịch vụ makeup được đặt nhiều nhất"
      action={
        <Link href="/admin/danh-sach-dat-lich-makeup">
          <Button variant="contained" color="primary" size="small">
            Xem tất cả
          </Button>
        </Link>
      }
    >
      <Box sx={{ overflow: "auto", width: { xs: "280px", sm: "auto" } }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
            <CircularProgress />
          </Box>
        ) : (
          <Table
            aria-label="simple table"
            sx={{
              whiteSpace: "nowrap",
              mt: 2
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Tên dịch vụ
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Địa điểm
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="subtitle2" fontWeight={600}>
                    Số lần đặt
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Trạng thái
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((service, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight={500}>
                      {service.serviceName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight={400}>
                      {service.location}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="h6">{service.count}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={service.count > 0 ? "Hoạt động" : "Không hoạt động"}
                      color={service.count > 0 ? "success" : "error"}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Box>
    </DashboardCard>
  );
};

export default ProductPerformance;
