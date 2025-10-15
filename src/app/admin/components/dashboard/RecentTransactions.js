import { useEffect, useState } from "react";
import DashboardCard from "@muahub/app/makeup-artists/components/shared/DashboardCard";
import {
  Timeline,
  TimelineItem,
  TimelineOppositeContent,
  TimelineSeparator,
  TimelineDot,
  TimelineConnector,
  TimelineContent,
  timelineOppositeContentClasses
} from "@mui/lab";
import { Typography, Box, CircularProgress } from "@mui/material";
import SendRequest from "@muahub/utils/SendRequest";
import { useApp } from "@muahub/app/contexts/AppContext";
import { ROLE_MANAGER } from "@muahub/constants/System";

const RecentNotifies = () => {
  const { currentUser } = useApp();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch dữ liệu từ API
  const fetchTodayBookings = async (currentUser) => {
    setLoading(true);
    try {
      const res = await SendRequest("GET", "/api/orders", {
        ownerId: currentUser.role === ROLE_MANAGER.MUA ? currentUser._id : ""
      });
      if (res.payload) {
        // Lấy ngày hôm nay
        const today = new Date(new Date().getTime() + 7 * 60 * 60 * 1000).toISOString().split("T")[0];
        // Lọc các lịch makeup có ngày trùng với hôm nay
        const todayBookings = res.payload.filter((booking) => booking.date === today);
        setData(todayBookings);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (Object.keys(currentUser).length === 0) return;
    fetchTodayBookings(currentUser);
  }, [currentUser]);

  return (
    <DashboardCard title="Lịch makeup hôm nay">
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
          <CircularProgress />
        </Box>
      ) : data.length === 0 ? (
        <Typography variant="body1" align="center" sx={{ py: 3 }}>
          Hôm nay chưa có ai đặt lịch.
        </Typography>
      ) : (
        <Box display="flex" justifyContent="center" height="25vh">
          <Timeline
            className="theme-timeline"
            nonce={undefined}
            onResize={undefined}
            onResizeCapture={undefined}
            sx={{
              p: 0,
              mb: "-40px",
              "& .MuiTimelineConnector-root": {
                width: "1px",
                backgroundColor: "#efefef"
              },
              [`& .${timelineOppositeContentClasses.root}`]: {
                flex: 0.5,
                paddingLeft: 0
              }
            }}
          >
            {data.map((booking) => (
              <TimelineItem key={booking._id}>
                <TimelineOppositeContent>
                  <Typography variant="body2" color="textSecondary">
                    {booking.time}
                  </Typography>
                </TimelineOppositeContent>
                <TimelineSeparator>
                  <TimelineDot color="primary" variant="outlined" />
                  <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent>
                  <Typography fontWeight="600">{booking.service.serviceName}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {booking.service.location}
                  </Typography>
                  <Typography variant="body2">Người đặt: {booking.user.name}</Typography>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        </Box>
      )}
    </DashboardCard>
  );
};

export default RecentNotifies;
