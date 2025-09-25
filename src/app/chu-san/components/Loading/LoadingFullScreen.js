import React from "react";
import { Backdrop, CircularProgress, Typography } from "@mui/material";

const LoadingFullScreen = () => {
  return (
    <Backdrop sx={{ color: "#fff", zIndex: 1201 }} open>
      <div style={{ textAlign: "center" }}>
        <CircularProgress color="inherit" />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Vui lòng chờ
        </Typography>
      </div>
    </Backdrop>
  );
};

export default LoadingFullScreen;
