import { Card, CardContent, Typography, Chip, Button } from "@mui/material";

const PlanCard = ({
    details,
    isCurrentPlan,
    onSelect,
    disabled = false,
    sx = {},
    paymentType
  }) => (
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

export default PlanCard;
