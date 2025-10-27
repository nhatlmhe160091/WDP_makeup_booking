"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Typography,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TextField,
  Alert,
  CircularProgress,
  ImageList,
  ImageListItem,
  ImageListItemBar
} from "@mui/material";
import {
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon
} from "@mui/icons-material";
import { useApp } from "@muahub/app/contexts/AppContext";
import SendRequest, { loadingUi } from "@muahub/utils/SendRequest";
import toast from "react-hot-toast";

const BannerManagementPage = () => {
  const { currentUser } = useApp();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openPreviewDialog, setOpenPreviewDialog] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: null,
    imagePreview: "",
    active: true,
    order: 1
  });

  // Fetch banners from API
  const fetchBanners = useCallback(async () => {
    setLoading(true);
    try {
      const res = await SendRequest("GET", "/api/banners", {
        ownerId: currentUser._id
      });
      if (res) {
        setBanners(res.payload || []);
      }
    } catch (error) {
      console.error("Error fetching banners:", error);
      toast.error("Không thể tải danh sách banner");
    } finally {
      setLoading(false);
    }
  }, [currentUser._id]);

  useEffect(() => {
    if (currentUser._id) {
      fetchBanners();
    }
  }, [currentUser._id, fetchBanners]);

  // Handle file upload
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Vui lòng chọn file ảnh hợp lệ");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 50 * 1024 * 1024) {
        toast.error("Kích thước file không được vượt quá 50MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData((prev) => ({
          ...prev,
          image: file,
          imagePreview: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submit
  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast.error("Vui lòng nhập tiêu đề banner");
      return;
    }

    if (!formData.image && !selectedBanner) {
      toast.error("Vui lòng chọn ảnh banner");
      return;
    }

    setLoading(true);
    try {
      const submitData = new FormData();
      submitData.append("title", formData.title);
      submitData.append("description", formData.description);
      submitData.append("active", formData.active);
      submitData.append("order", formData.order);
      submitData.append("ownerId", currentUser._id);
      let fileUrl = "";

      if (formData.image) {
          loadingUi(true);
          try {
            const _formData = new FormData();
            _formData.append("file", formData.image);
    
            const response = await fetch("/api/upload", {
              method: "POST",
              body: _formData
            });
    
            if (!response.ok) throw new Error("Lỗi khi tải ảnh lên");
    
            const data = await response.json();
            fileUrl = data.url;
          } catch (error) {
            toast.error("Lỗi khi tải ảnh lên");
          }
      }
      submitData.append("imageUrl", fileUrl || (selectedBanner ? selectedBanner.imageUrl : ""));

      const url = selectedBanner ? `/api/banners/${selectedBanner._id}` : "/api/banners";
      const method = selectedBanner ? "PUT" : "POST";

      const res = await SendRequest(method, url, submitData, {
        "Content-Type": "multipart/form-data"
      });

      if (res) {
        toast.success(selectedBanner ? "Cập nhật banner thành công" : "Thêm banner thành công");
        setOpenDialog(false);
        resetForm();
        fetchBanners();
      } else {
        toast.error(res.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Error saving banner:", error);
      toast.error("Không thể lưu banner");
    } finally {
      setLoading(false);
    }
  };

  // Handle delete banner
  const handleDelete = async (bannerId) => {
    if (!confirm("Bạn có chắc chắn muốn xóa banner này?")) {
      return;
    }

    setLoading(true);
    try {
      const res = await SendRequest("DELETE", `/api/banners/${bannerId}`);
      if (res) {
        toast.success("Xóa banner thành công");
        fetchBanners();
      } else {
        toast.error(res.message || "Không thể xóa banner");
      }
    } catch (error) {
      console.error("Error deleting banner:", error);
      toast.error("Không thể xóa banner");
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      image: null,
      imagePreview: "",
      active: true,
      order: 1
    });
    setSelectedBanner(null);
  };

  // Open edit dialog
  const handleEdit = (banner) => {
    setSelectedBanner(banner);
    setFormData({
      title: banner.title,
      description: banner.description,
      image: null,
      imagePreview: banner.imageUrl,
      active: banner.active,
      order: banner.order
    });
    setOpenDialog(true);
  };

  // Open add dialog
  const handleAdd = () => {
    resetForm();
    setOpenDialog(true);
  };

  // Preview image
  const handlePreview = (imageUrl) => {
    setPreviewImage(imageUrl);
    setOpenPreviewDialog(true);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Quản Lý Banner
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd} color="primary">
          Thêm Banner
        </Button>
      </Box>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {banners.length === 0 && !loading ? (
        <Alert severity="info">Chưa có banner nào. Hãy thêm banner đầu tiên!</Alert>
      ) : (
        <ImageList cols={3} gap={8}>
          {banners.map((banner) => (
            <ImageListItem key={banner._id}>
              <img
                src={banner.imageUrl}
                alt={banner.title}
                loading="lazy"
                style={{ height: 200, objectFit: "cover" }}
              />
              <ImageListItemBar
                title={banner.title}
                subtitle={banner.description}
                actionIcon={
                  <Box>
                    <IconButton
                      sx={{ color: "rgba(255, 255, 255, 0.54)" }}
                      onClick={() => handlePreview(banner.imageUrl)}
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton sx={{ color: "rgba(255, 255, 255, 0.54)" }} onClick={() => handleEdit(banner)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton sx={{ color: "rgba(255, 255, 255, 0.54)" }} onClick={() => handleDelete(banner._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                }
              />
            </ImageListItem>
          ))}
        </ImageList>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{selectedBanner ? "Chỉnh Sửa Banner" : "Thêm Banner Mới"}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Tiêu đề"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Mô tả"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              margin="normal"
              multiline
              rows={3}
            />
            <TextField
              fullWidth
              label="Thứ tự hiển thị"
              type="number"
              value={formData.order}
              onChange={(e) => setFormData((prev) => ({ ...prev, order: parseInt(e.target.value) }))}
              margin="normal"
            />

            <Box sx={{ mt: 2, mb: 2 }}>
              <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />} fullWidth>
                Chọn Ảnh Banner
                <input type="file" hidden accept="image/*" onChange={handleFileChange} />
              </Button>
            </Box>

            {formData.imagePreview && (
              <Box sx={{ mt: 2, textAlign: "center" }}>
                <img
                  src={formData.imagePreview}
                  alt="Preview"
                  style={{ maxWidth: "100%", maxHeight: 300, objectFit: "contain" }}
                />
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : selectedBanner ? "Cập Nhật" : "Thêm"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={openPreviewDialog} onClose={() => setOpenPreviewDialog(false)} maxWidth="lg">
        <DialogTitle>Xem Trước Banner</DialogTitle>
        <DialogContent>
          <img src={previewImage} alt="Preview" style={{ width: "100%", height: "auto" }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPreviewDialog(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BannerManagementPage;
