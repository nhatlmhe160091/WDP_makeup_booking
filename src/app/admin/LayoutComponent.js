"use client";
import { styled, Container, Box } from "@mui/material";
import React, { useState } from "react";
import Header from "@muahub/app/admin/layout/header/Header";
import Sidebar from "@muahub/app/admin/layout/sidebar/Sidebar";
import { AppProvider } from "@muahub/app/contexts/AppContext";

const MainWrapper = styled("div")(() => ({
  display: "flex",
  minHeight: "100vh",
  width: "100%"
}));

const PageWrapper = styled("div")(() => ({
  display: "flex",
  flexGrow: 1,
  paddingBottom: "60px",
  flexDirection: "column",
  zIndex: 1,
  backgroundColor: "transparent"
}));

export default function RootAdminLayout({ children }) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  return (
    <AppProvider>
      <MainWrapper className="mainwrapper">
        {/* ------------------------------------------- */}
        {/* Sidebar */}
        {/* ------------------------------------------- */}
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          isMobileSidebarOpen={isMobileSidebarOpen}
          onSidebarClose={() => setMobileSidebarOpen(false)}
        />
        {/* ------------------------------------------- */}
        {/* Main Wrapper */}
        {/* ------------------------------------------- */}
        <PageWrapper className="page-wrapper">
          {/* ------------------------------------------- */}
          {/* Header */}
          {/* ------------------------------------------- */}
          <Header toggleMobileSidebar={() => setMobileSidebarOpen(true)} />
          {/* ------------------------------------------- */}
          {/* PageContent */}
          {/* ------------------------------------------- */}
          <Container
            sx={{
              paddingTop: "20px",
              maxWidth: "1600px !important"
            }}
          >
            {/* ------------------------------------------- */}
            {/* Page Route */}
            {/* ------------------------------------------- */}
            <Box sx={{ minHeight: "calc(100vh - 170px)" }}>{children}</Box>
            {/* ------------------------------------------- */}
            {/* End Page */}
            {/* ------------------------------------------- */}
          </Container>
        </PageWrapper>
      </MainWrapper>
    </AppProvider>
  );
}
