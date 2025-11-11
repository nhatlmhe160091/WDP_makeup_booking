"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { 
  Container, 
  Typography, 
  Box, 
  Chip, 
  Avatar, 
  Stack, 
  Grid, 
  Card, 
  CardContent, 
  IconButton,
  Divider,
  Breadcrumbs,
  Modal,
  Backdrop
} from "@mui/material";
import { 
  FavoriteOutlined, 
  Favorite, 
  Visibility, 
  Comment, 
  Share,
  ArrowBack
} from "@mui/icons-material";

const BlogDetail = () => {
  const params = useParams();
  const { slug } = params;
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liked, setLiked] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);

  useEffect(() => {
    const fetchBlogDetail = async () => {
      if (!slug) return;
      
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/blogs/${slug}`);
        const data = await res.json();
        if (data.success) {
          setBlog(data.data);
        } else {
          setError(data.error || "Lỗi không xác định");
        }
      } catch (err) {
        setError("Không thể tải dữ liệu blog");
      } finally {
        setLoading(false);
      }
    };

    fetchBlogDetail();
  }, [slug]);

  const handleLike = async () => {
    try {
      const action = liked ? "unlike" : "like";
      const res = await fetch(`/api/blogs/${slug}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });

      if (res.ok) {
        setLiked(!liked);
        // Cập nhật số lượt thích trong state
        setBlog(prev => ({
          ...prev,
          likes: liked ? (prev.likes - 1) : (prev.likes + 1)
        }));
      }
    } catch (error) {
      console.error("Error handling like:", error);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: blog.title,
        text: blog.summary || blog.metaDescription,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Link đã được sao chép!");
    }
  };

  const handleImageClick = () => {
    setImageModalOpen(true);
  };

  const handleCloseModal = () => {
    setImageModalOpen(false);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Đang tải blog...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography color="error">{error}</Typography>
        <Link href="/blog">
          <Typography component="a" sx={{ color: "primary.main", mt: 2, display: "block" }}>
            ← Quay lại danh sách blog
          </Typography>
        </Link>
      </Container>
    );
  }

  if (!blog) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Blog không tồn tại</Typography>
      </Container>
    );
  }

  return (
    <div className="container-fluid py-5">
      <Container maxWidth="lg">
        <Grid >
          {/* Main Content */}
          <Grid item xs={12} lg={8}>
            <Card sx={{ mb: 3, overflow: "visible" }}>
              <CardContent sx={{ p: 4 }}>
                {/* Back Button */}
                <Link href="/blog" style={{ textDecoration: "none" }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 3, color: "#e91e63", "&:hover": { color: "#ad1457" } }}>
                    <ArrowBack sx={{ mr: 1 }} />
                    <Typography sx={{ color: "#e91e63" }}>Quay lại danh sách blog</Typography>
                  </Box>
                </Link>

                {/* Blog Header */}
                <Box sx={{ mb: 3, textAlign: "center" }}>
                  <Typography variant="h4" component="h1" sx={{ mb: 2, fontWeight: "bold" }}>
                    {blog.title}
                  </Typography>
                  
                  <Stack direction="row" spacing={2} alignItems="center" justifyContent="center" sx={{ mb: 2 }}>
                    {blog.category && <Chip label={blog.category} sx={{ backgroundColor: "#e91e63", color: "white" }} />}
                    <Typography variant="body2" color="text.secondary">
                      {blog.created_at ? new Date(blog.created_at).toLocaleDateString("vi-VN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                      }) : ""}
                    </Typography>
                  </Stack>

                  {/* Author Info */}
                  {blog.author && (
                    <Stack direction="row" spacing={2} alignItems="center" justifyContent="center" sx={{ mb: 2 }}>
                      <Avatar 
                        src={blog.author.avatar} 
                        sx={{ width: 40, height: 40 }}
                      >
                        {blog.author.fullname?.[0] || blog.author.name?.[0] || "A"}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {blog.author.fullname || blog.author.name || "Tác giả"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {blog.author.role === "mua" ? "Makeup Artist" : "Tác giả"}
                        </Typography>
                      </Box>
                    </Stack>
                  )}

                  {/* Stats and Actions */}
                  <Stack direction="row" spacing={3} alignItems="center" justifyContent="center" sx={{ mb: 3 }}>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <Visibility fontSize="small" color="action" />
                      <Typography variant="body2">{blog.views || 0}</Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <IconButton 
                        onClick={handleLike} 
                        sx={{ color: liked ? "#e91e63" : "#666" }}
                        size="small"
                      >
                        {liked ? <Favorite /> : <FavoriteOutlined />}
                      </IconButton>
                      <Typography variant="body2">{blog.likes || 0}</Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <Comment fontSize="small" color="action" />
                      <Typography variant="body2">{blog.comments?.length || 0}</Typography>
                    </Stack>
                    <IconButton onClick={handleShare} size="small" sx={{ color: "#e91e63" }}>
                      <Share fontSize="small" />
                    </IconButton>
                  </Stack>
                </Box>

                {/* Cover Image */}
                {blog.coverImage && (
                  <Box 
                    onClick={handleImageClick}
                    sx={{ 
                      mb: 4, 
                      borderRadius: 2, 
                      overflow: "hidden",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "scale(1.02)",
                        boxShadow: "0 8px 25px rgba(0,0,0,0.15)"
                      }
                    }}
                  >
                    <Image
                      src={blog.coverImage}
                      alt={blog.title}
                      width={800}
                      height={400}
                      style={{ 
                        width: "100%", 
                        height: "400px", 
                        objectFit: "cover",
                        transition: "transform 0.3s ease"
                      }}
                    />
                  </Box>
                )}

                {/* Summary */}
                {blog.summary && (
                  <Box sx={{ mb: 3, p: 3, bgcolor: "#fce4ec", borderRadius: 2, border: "1px solid #f8bbd9" }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: "medium", color: "#e91e63" }}>
                      Tóm tắt
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {blog.summary}
                    </Typography>
                  </Box>
                )}

                {/* Content */}
                <Box sx={{ mb: 4 }}>
                  <div 
                    className="blog-content"
                    dangerouslySetInnerHTML={{ __html: blog.content }}
                  />
                </Box>

                {/* Tags */}
                {blog.tags && blog.tags.length > 0 ? (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, color: "#e91e63" }}>Tags:</Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {blog.tags.map((tag, index) => (
                        <Chip key={index} label={tag} variant="outlined" size="small" sx={{ borderColor: "#e91e63", color: "#e91e63" }} />
                      ))}
                    </Stack>
                  </Box>
                ) : (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, color: "#e91e63" }}>Tags:</Typography>
                    <Typography variant="body2" color="text.secondary">Không có tag nào.</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} lg={4}>
            {/* Related Blogs */}
            {blog.relatedBlogs && blog.relatedBlogs.length > 0 && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Bài viết liên quan
                  </Typography>
                  <Stack spacing={2}>
                    {blog.relatedBlogs.map((relatedBlog) => (
                      <Box key={relatedBlog._id}>
                        <Link 
                          href={`/blog/${relatedBlog.slug || relatedBlog._id}`}
                          style={{ textDecoration: "none" }}
                        >
                          <Stack direction="row" spacing={2}>
                            {relatedBlog.coverImage ? (
                              <Box sx={{ width: 80, height: 60, position: "relative", flexShrink: 0 }}>
                                <Image
                                  src={relatedBlog.coverImage}
                                  alt={relatedBlog.title}
                                  fill
                                  style={{ objectFit: "cover", borderRadius: 4 }}
                                />
                              </Box>
                            ) : (
                              <Avatar 
                                variant="square" 
                                sx={{ width: 80, height: 60, fontSize: 14 }}
                              >
                                {relatedBlog.title?.[0] || "B"}
                              </Avatar>
                            )}
                            <Box sx={{ flex: 1 }}>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontWeight: "medium", 
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden"
                                }}
                              >
                                {relatedBlog.title}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {relatedBlog.created_at ? 
                                  new Date(relatedBlog.created_at).toLocaleDateString() : ""
                                }
                              </Typography>
                            </Box>
                          </Stack>
                        </Link>
                        <Divider sx={{ mt: 2 }} />
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            )}

            {/* Author Card */}
            {blog.author && (
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Về tác giả
                  </Typography>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar 
                      src={blog.author.avatar} 
                      sx={{ width: 60, height: 60 }}
                    >
                      {blog.author.fullname?.[0] || blog.author.name?.[0] || "A"}
                    </Avatar>
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        {blog.author.fullname || blog.author.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {blog.author.role === "mua" ? "Makeup Artist" : "Tác giả"}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>
      </Container>

      {/* Image Modal */}
      <Modal
        open={imageModalOpen}
        onClose={handleCloseModal}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
          sx: { backgroundColor: 'rgba(0, 0, 0, 0.9)' }
        }}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            outline: 'none',
            maxWidth: '95vw',
            maxHeight: '95vh',
            position: 'relative'
          }}
          onClick={handleCloseModal}
        >
          {blog.coverImage && (
            <Image
              src={blog.coverImage}
              alt={blog.title}
              width={1200}
              height={800}
              style={{ 
                width: "auto", 
                height: "auto",
                maxWidth: "95vw",
                maxHeight: "95vh",
                objectFit: "contain",
                borderRadius: 8
              }}
            />
          )}
        </Box>
      </Modal>
    </div>
  );
};

export default BlogDetail;