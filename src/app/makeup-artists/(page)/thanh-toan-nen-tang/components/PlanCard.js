
import React, { useState } from "react";
import { Card, CardContent, Typography, Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import InfoIcon from '@mui/icons-material/Info';

const PlanCard = ({
  details,
  isCurrentPlan,
  onSelect,
  disabled = false,
  sx = {},
  paymentType
}) => {
  const [openBenefit, setOpenBenefit] = useState(false);
  const getBenefits = () => {
    switch (details.key) {
      case 'revenue':
        return [
          "Phí đặt cọc 10% trên mỗi lần yêu cầu",
          "Đăng tải dịch vụ cơ bản",
          "Thống kê doanh thu cơ bản",
          "Hỗ trợ khách hàng trong giờ hành chính"
        ];
      case 'monthly_3':
        return [
          "Miễn phí đặt cọc (0%)",
          "Đăng tải không giới hạn dịch vụ",
          "Thống kê doanh thu chi tiết",
          "Hỗ trợ khách hàng 24/7"
        ];
      case 'monthly_6':
        return [
          "Tất cả quyền lợi của gói 3 tháng",
          "Đăng tải blog làm đẹp",
          "Ưu tiên hiển thị trên trang tìm kiếm",
          "Tham gia các chương trình khuyến mãi đặc biệt"
        ];
      case 'yearly':
        return [
          "Tất cả quyền lợi của gói 6 tháng",
          "Hiển thị trong danh sách MUA nổi bật tại trang chủ",
          "Được giới thiệu trong các chiến dịch marketing",
          "Hỗ trợ tư vấn phát triển thương hiệu cá nhân"
        ];
      default:
        return [];
    }
  };
  const benefits = getBenefits();
  return (
    <Card
      sx={{
        height: "100%",
        position: "relative",
        border: isCurrentPlan ? 2 : 1,
        borderColor: isCurrentPlan ? "primary.main" : "grey.300",
        cursor: isCurrentPlan || disabled ? "default" : "pointer",
        borderRadius: 2,
        transition: "all .2s ease",
        ...(disabled ? { opacity: 0.5, pointerEvents: 'none', filter: 'grayscale(1)' } : {}),
        ...sx,
        '&:hover': {
          transform: isCurrentPlan || disabled ? 'none' : 'translateY(-2px)',
          boxShadow: 6,
          backgroundColor: details.key === 'revenue' ? '#FFF1EF' : 'inherit'
        }
      }}
      onClick={isCurrentPlan || disabled ? undefined : onSelect}
    >
      {details.popular && (
        <Chip label="Phổ biến" color="secondary" size="small" sx={{ position: "absolute", top: 8, right: 8 }} />
      )}
      <CardContent>
        <Typography
          variant="h6"
          gutterBottom
          sx={{
            fontWeight: 700,
            color:
              details.key === 'revenue'
                ? '#ff5c95ff'
                : details.key === 'monthly_3'
                ? '#ff5c95ff'
                : details.key === 'monthly_6'
                ? 'var(--mui-palette-info-main, #0288d1)'
                : 'var(--mui-palette-success-main, #2e7d32)'
          }}
        >
          {details.label}
        </Typography>
        <Typography variant="h4" color="text.primary" gutterBottom sx={{ fontWeight: 800 }}>
          {details.amount === 0 ? "Miễn phí" : details.amount.toLocaleString('vi-VN') + " ₫"}
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          {details.description}
        </Typography>
        <Button
          variant="text"
          color="info"
          size="small"
          startIcon={<InfoIcon />}
          sx={{ mb: 1, textTransform: 'none', fontWeight: 500 }}
          onClick={e => {
            e.stopPropagation();
            setOpenBenefit(true);
          }}
        >
          Xem quyền lợi
        </Button>
        <Dialog open={openBenefit} onClose={() => setOpenBenefit(false)} maxWidth="xs" fullWidth>
          <DialogTitle>Quyền lợi gói {details.label}</DialogTitle>
          <DialogContent>
            <List>
              {benefits.map((b, i) => (
                <ListItem key={i}>
                  <ListItemIcon><InfoIcon color="info" /></ListItemIcon>
                  <ListItemText primary={b} />
                </ListItem>
              ))}
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenBenefit(false)} color="primary">Đóng</Button>
          </DialogActions>
        </Dialog>
        <Typography variant="body2" color="info.main" sx={{ mb: 2, fontStyle: "italic" }}>
          Số tiền phải trả: {details.amount === 0 ? "Miễn phí" : details.amount.toLocaleString('vi-VN') + " ₫"}
        </Typography>
        <Button
          variant={isCurrentPlan ? "outlined" : "contained"}
          color={details.color}
          fullWidth
          disabled={isCurrentPlan || disabled}
          sx={{
            height: 48,
            py: 1.25,
            borderRadius: 2,
            fontWeight: 600,
            ...(isCurrentPlan ? {} : { bgcolor: '#ff5c95ff', '&:hover': { bgcolor: '#d81b60' } })
          }}
          onClick={e => {
            e.stopPropagation();
            if (!isCurrentPlan && !disabled) onSelect();
          }}
        >
          {isCurrentPlan ? "Gói hiện tại" : "Chọn gói này"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PlanCard;
