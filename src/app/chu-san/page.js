"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  Avatar
} from "@mui/material";
import PageContainer from "./components/container/PageContainer";
import { useApp } from "@muahub/app/contexts/AppContext";
import { convertDate, convertDateTime } from "@muahub/utils/Main";
import { ROLE_MANAGER, ROLE_MANAGER_TEXT } from "@muahub/constants/System";
import SalesOverview from "./components/dashboard/SalesOverview";
import MonthlyEarnings from "./components/dashboard/MonthlyEarnings";
import RecentNotifies from "./components/dashboard/RecentTransactions";
import ProductPerformance from "./components/dashboard/ProductPerformance";
import YearlyBreakup from "./components/dashboard/YearlyBreakup";

const Dashboard = () => {
  const { currentUser } = useApp();

  return (
    <PageContainer title="Lịch sử đặt lịch makeup" description="Danh sách các lịch makeup của bạn">
      <PageContainer title="Bảng điều khiển" description="Tổng quan hệ thống đặt lịch makeup">
        <Box>
          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              <SalesOverview />
            </Grid>
            <Grid item xs={12} lg={4}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Paper sx={{ padding: 3, textAlign: "center" }}>
                    <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column">
                      <Avatar
                        src={currentUser.avatar || "/default-avatar.png"}
                        alt={currentUser.name}
                        sx={{ width: 80, height: 80, mb: 2 }}
                      />
                      <Typography variant="h4">Xin chào, {currentUser.name}!</Typography>
                      <Typography marginTop={1} variant="subtitle1" color="textSecondary">
                        Vai trò: {ROLE_MANAGER_TEXT[currentUser.role]}
                      </Typography>
                      <Typography marginTop={2} variant="h4" color={currentUser.active ? "green" : "red"}>
                        {currentUser.active ? "Hoạt động" : "Bị khóa"}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <YearlyBreakup />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} lg={5}>
              <RecentNotifies />
            </Grid>
            <Grid item xs={12} lg={7}>
              <ProductPerformance />
            </Grid>
          </Grid>
        </Box>
      </PageContainer>
    </PageContainer>
  );
};

export default Dashboard;
