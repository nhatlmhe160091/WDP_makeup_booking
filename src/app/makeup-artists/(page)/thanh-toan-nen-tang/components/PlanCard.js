import { Card, CardContent, Typography, Chip, Button } from "@mui/material";

const PlanCard = ({
  plan,
  isCurrent,
  onSelect,
  color,
  children
}) => (
  <Card
    sx={{
      height: "100%",
      position: "relative",
      border: isCurrent ? 2 : 1,
      borderColor: isCurrent ? "primary.main" : "grey.300",
      cursor: isCurrent ? "default" : "pointer",
      borderRadius: 2,
      transition: "all .2s ease",
      '&:hover': {
        transform: isCurrent ? 'none' : 'translateY(-2px)',
        boxShadow: 6,
        backgroundColor: plan.key === 'revenue' ? '#FFF1EF' : 'inherit'
      }
    }}
    onClick={isCurrent ? undefined : onSelect}
  >
    {plan.popular && (
      <Chip label="Phổ biến" color="secondary" size="small" sx={{ position: "absolute", top: 8, right: 8 }} />
    )}
    <CardContent>
      <Typography
        variant="h6"
        gutterBottom
        sx={{
          fontWeight: 700,
          color:
            plan.key === 'revenue'
              ? '#ff5c95ff'
              : plan.key === 'monthly_3'
              ? '#ff5c95ff'
              : plan.key === 'monthly_6'
              ? 'var(--mui-palette-info-main, #0288d1)'
              : 'var(--mui-palette-success-main, #2e7d32)'
        }}
      >
        {plan.label}
      </Typography>
      <Typography variant="h4" color="text.primary" gutterBottom sx={{ fontWeight: 800 }}>
        {plan.amount === 0 ? "Miễn phí" : children}
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        {plan.description}
      </Typography>
      <Typography variant="body2" color="info.main" sx={{ mb: 2, fontStyle: "italic" }}>
        Số tiền phải trả: {children}
      </Typography>
      <Button
        variant={isCurrent ? "outlined" : "contained"}
        color={color}
        fullWidth
        disabled={isCurrent}
        sx={{
          height: 48,
          py: 1.25,
          borderRadius: 2,
          fontWeight: 600,
          ...(isCurrent ? {} : { bgcolor: '#ff5c95ff', '&:hover': { bgcolor: '#d81b60' } })
        }}
        onClick={e => {
          e.stopPropagation();
          if (!isCurrent) onSelect();
        }}
      >
        {isCurrent ? "Gói hiện tại" : "Chọn gói này"}
      </Button>
    </CardContent>
  </Card>
);

export default PlanCard;
