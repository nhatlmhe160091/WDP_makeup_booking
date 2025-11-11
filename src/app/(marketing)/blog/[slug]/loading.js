import { Container, Box, Skeleton, Grid, Card, CardContent, Stack } from "@mui/material";

export default function BlogDetailLoading() {
  return (
    <div className="blog-detail-container container-fluid py-5">
      <Container maxWidth="lg">
        {/* Breadcrumbs Skeleton */}
        <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
          <Skeleton variant="text" width={60} />
          <Skeleton variant="text" width={20} />
          <Skeleton variant="text" width={40} />
          <Skeleton variant="text" width={20} />
          <Skeleton variant="text" width={200} />
        </Stack>

        <Grid >
          {/* Main Content */}
          <Grid item xs={12} lg={8}>
            <Card sx={{ mb: 3, overflow: "visible" }}>
              <CardContent sx={{ p: 4 }}>
                {/* Back Button */}
                <Skeleton variant="text" width={150} sx={{ mb: 3 }} />

                {/* Blog Header */}
                <Box sx={{ mb: 3 }}>
                  <Skeleton variant="text" width="80%" height={48} sx={{ mb: 2 }} />
                  
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <Skeleton variant="rounded" width={80} height={24} />
                    <Skeleton variant="text" width={120} />
                  </Stack>

                  {/* Author Info */}
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <Skeleton variant="circular" width={40} height={40} />
                    <Box>
                      <Skeleton variant="text" width={120} />
                      <Skeleton variant="text" width={80} />
                    </Box>
                  </Stack>

                  {/* Stats */}
                  <Stack direction="row" spacing={3} alignItems="center" sx={{ mb: 3 }}>
                    <Skeleton variant="text" width={60} />
                    <Skeleton variant="text" width={60} />
                    <Skeleton variant="text" width={60} />
                    <Skeleton variant="text" width={60} />
                  </Stack>
                </Box>

                {/* Cover Image */}
                <Skeleton variant="rectangular" width="100%" height={400} sx={{ mb: 4, borderRadius: 2 }} />

                {/* Summary */}
                <Box sx={{ mb: 3, p: 3, bgcolor: "grey.50", borderRadius: 2 }}>
                  <Skeleton variant="text" width={80} height={32} sx={{ mb: 2 }} />
                  <Skeleton variant="text" width="100%" />
                  <Skeleton variant="text" width="90%" />
                  <Skeleton variant="text" width="70%" />
                </Box>

                {/* Content */}
                <Box sx={{ mb: 4 }}>
                  {[...Array(10)].map((_, i) => (
                    <Skeleton key={i} variant="text" width={i % 3 === 0 ? "70%" : "100%"} sx={{ mb: 1 }} />
                  ))}
                </Box>

                {/* Tags */}
                <Box sx={{ mb: 3 }}>
                  <Skeleton variant="text" width={60} sx={{ mb: 2 }} />
                  <Stack direction="row" spacing={1}>
                    <Skeleton variant="rounded" width={80} height={24} />
                    <Skeleton variant="rounded" width={100} height={24} />
                    <Skeleton variant="rounded" width={60} height={24} />
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} lg={4}>
            {/* Related Blogs */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Skeleton variant="text" width={120} height={32} sx={{ mb: 2 }} />
                <Stack spacing={2}>
                  {[...Array(3)].map((_, i) => (
                    <Box key={i}>
                      <Stack direction="row" spacing={2}>
                        <Skeleton variant="rectangular" width={80} height={60} />
                        <Box sx={{ flex: 1 }}>
                          <Skeleton variant="text" width="100%" />
                          <Skeleton variant="text" width="80%" />
                          <Skeleton variant="text" width="60%" />
                        </Box>
                      </Stack>
                      {i < 2 && <Box sx={{ height: 16 }} />}
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>

            {/* Author Card */}
            <Card>
              <CardContent>
                <Skeleton variant="text" width={80} height={32} sx={{ mb: 2 }} />
                <Stack direction="row" spacing={2} alignItems="center">
                  <Skeleton variant="circular" width={60} height={60} />
                  <Box>
                    <Skeleton variant="text" width={120} />
                    <Skeleton variant="text" width={100} />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}