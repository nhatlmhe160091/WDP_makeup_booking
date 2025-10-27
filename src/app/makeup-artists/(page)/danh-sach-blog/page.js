"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  InputAdornment,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DraftIcon from "@mui/icons-material/Description";
import PublishedIcon from "@mui/icons-material/Public";
import ImageIcon from '@mui/icons-material/Image';
import SendRequest from "@muahub/utils/SendRequest";
import { useApp } from "@muahub/app/contexts/AppContext";
import toast from "react-hot-toast";
// import Image from "next/image";
import { useRouter } from "next/navigation";

const BlogManagementPage = () => {
  const { currentUser } = useApp();
  const router = useRouter();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [currentBlog, setCurrentBlog] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    summary: "",
    category: "",
    tags: "",
    coverImage: "",
    status: "draft",
    metaDescription: "",
  });

  const categories = [
    "Makeup cơ bản",
    "Makeup dự tiệc",
    "Makeup cô dâu",
    "Chăm sóc da",
    "Xu hướng makeup",
    "Mẹo làm đẹp",
  ];

  // Fetch blogs
  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const response = await SendRequest(
        "GET",
        "/api/blogs?" +
          new URLSearchParams({
            ownerId: currentUser._id,
            ...(filter !== "all" && { status: filter }),
          })
      );
      console.log("response", response.payload);
      console.log("response success", response);
      if (response.payload) {
        setBlogs(response.payload);
        console.log("blogs", response.payload);
      }
    } catch (error) {
      toast.error("Lỗi khi tải danh sách blog");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?._id) {
      fetchBlogs();
    }
  }, [currentUser, filter]);

  // Handle form submit
  const handleSubmit = async () => {
    if (!formData.title || !formData.content) {
      toast.error("Vui lòng điền đầy đủ tiêu đề và nội dung");
      return;
    }

    try {
      const method = currentBlog ? "PUT" : "POST";
      const data = {
        ...formData,
        tags: formData.tags.split(",").map((tag) => tag.trim()),
        ...(currentBlog && { id: currentBlog._id }),
      };

      const response = await SendRequest(method, "/api/blogs", data);
    //   console.log("response submit", response);
    //   if (response.payload) {
        // console.log("response submit1", response.payload);
        toast.success(
          currentBlog ? "Cập nhật blog thành công" : "Tạo blog thành công"
        );
        handleCloseDialog();
        fetchBlogs();
    //   }
    } catch (error) {
      toast.error("Có lỗi xảy ra. Vui lòng thử lại");
    }
  };

  // Handle dialog close
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentBlog(null);
    setFormData({
      title: "",
      content: "",
      summary: "",
      category: "",
      tags: "",
      coverImage: "",
      status: "draft",
      metaDescription: "",
    });
  };

  // Handle edit blog
  const handleEditBlog = (blog) => {
    setCurrentBlog(blog);
    setFormData({
      title: blog.title,
      content: blog.content,
      summary: blog.summary || "",
      category: blog.category || "",
      tags: blog.tags?.join(", ") || "",
      coverImage: blog.coverImage || "",
      status: blog.status || "draft",
      metaDescription: blog.metaDescription || "",
    });
    setOpenDialog(true);
  };

  // Handle delete blog
  const handleDeleteBlog = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa blog này?")) {
      try {
        const response = await SendRequest("DELETE", "/api/blogs", { id });
        // if (response.payload) {
          toast.success("Xóa blog thành công");
          fetchBlogs();
        // }
      } catch (error) {
        toast.error("Có lỗi xảy ra khi xóa blog");
      }
    }
  };

  // Filter blogs based on search term
  const filteredBlogs = blogs.filter((blog) =>
    blog.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          Quản lý Blog
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          sx={{ bgcolor: "#ff5c95ff", "&:hover": { bgcolor: "#d81b60" } }}
        >
          Tạo Blog Mới
        </Button>
      </Box>

      {/* Search and Filter */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Tìm kiếm blog..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Lọc theo trạng thái</InputLabel>
            <Select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              label="Lọc theo trạng thái"
            >
              <MenuItem value="all">Tất cả</MenuItem>
              <MenuItem value="draft">Bản nháp</MenuItem>
              <MenuItem value="published">Đã xuất bản</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Blog Grid */}
      <Grid container spacing={3}>
        {filteredBlogs.map((blog) => (
          <Grid item xs={12} sm={6} md={3} key={blog._id}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 3,
                },
              }}
            >
              {blog.coverImage ? (
                <CardMedia
                  component="img"
                  height="140"
                  image={blog.coverImage}
                  alt={blog.title}
                />
              ) : (
                <Box
                  sx={{
                    height: 140,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'grey.100'
                  }}
                >
                  <ImageIcon sx={{ fontSize: 40, color: 'grey.400' }} />
                </Box>
              )}
              <CardContent sx={{ flexGrow: 1 }}>
                <Box
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    display: "flex",
                    gap: 1,
                  }}
                >
                  <Chip
                    size="small"
                    icon={blog.status === "published" ? <PublishedIcon /> : <DraftIcon />}
                    label={blog.status === "published" ? "Đã xuất bản" : "Bản nháp"}
                    color={blog.status === "published" ? "success" : "default"}
                  />
                </Box>
                <Typography variant="h6" gutterBottom noWrap>
                  {blog.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    mb: 2,
                    minHeight: "42px"
                  }}
                >
                  {blog.summary || "Không có tóm tắt"}
                </Typography>
                <Box sx={{ mt: 'auto', display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {blog.category && (
                    <Chip
                      label={blog.category}
                      size="small"
                      sx={{ bgcolor: "#ffe0e9", color: "#d81b60" }}
                    />
                  )}
                </Box>
              </CardContent>
              <Box 
                sx={{ 
                  p: 2, 
                  pt: 0, 
                  display: "flex", 
                  gap: 1,
                  borderTop: 1,
                  borderColor: 'grey.200',
                  bgcolor: 'grey.50'
                }}
              >
                <IconButton
                  size="small"
                  onClick={() => handleEditBlog(blog)}
                  sx={{ color: "#ff5c95ff" }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleDeleteBlog(blog._id)}
                  sx={{ color: "#ff5c95ff" }}
                >
                  <DeleteIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => router.push(`/blog/${blog._id}`)}
                  sx={{ color: "#ff5c95ff" }}
                >
                  <VisibilityIcon />
                </IconButton>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Blog Form Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {currentBlog ? "Chỉnh sửa Blog" : "Tạo Blog Mới"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tiêu đề"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tóm tắt"
                multiline
                rows={2}
                value={formData.summary}
                onChange={(e) =>
                  setFormData({ ...formData, summary: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Danh mục</InputLabel>
                <Select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  label="Danh mục"
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tags (phân cách bằng dấu phẩy)"
                value={formData.tags}
                onChange={(e) =>
                  setFormData({ ...formData, tags: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Ảnh bìa (URL)"
                value={formData.coverImage}
                onChange={(e) =>
                  setFormData({ ...formData, coverImage: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  label="Trạng thái"
                >
                  <MenuItem value="draft">Bản nháp</MenuItem>
                  <MenuItem value="published">Xuất bản</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nội dung"
                required
                multiline
                rows={10}
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Meta Description (SEO)"
                multiline
                rows={2}
                value={formData.metaDescription}
                onChange={(e) =>
                  setFormData({ ...formData, metaDescription: e.target.value })
                }
                helperText="Mô tả ngắn gọn về bài viết, hiển thị trong kết quả tìm kiếm Google"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{ bgcolor: "#ff5c95ff", "&:hover": { bgcolor: "#d81b60" } }}
          >
            {currentBlog ? "Cập nhật" : "Tạo mới"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BlogManagementPage;
