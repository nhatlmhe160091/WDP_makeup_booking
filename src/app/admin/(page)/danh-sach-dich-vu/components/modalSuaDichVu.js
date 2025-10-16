"use client";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Button,
  Typography,
  Chip,
  Autocomplete,
  Box
} from "@mui/material";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import SearchAddressComponent from "../../../components/SearchAddressComponent";
import SelectServiceComponent from "../../../components/SelectServiceComponent";
import ImagePreview from "@muahub/app/admin/components/ImagePreview";
import toast from "react-hot-toast";
import SendRequest, { loadingUi } from "@muahub/utils/SendRequest";
import { useApp } from "@muahub/app/contexts/AppContext";

const fieldSizes = {
  5: {
    isAvailable: false,
    name: "Makeup cô dâu",
    price: 0,
    count: 0,
    timeMatch: 0,
    timeDetail: []
  },
  7: {
    isAvailable: false,
    name: "Makeup dự tiệc / Sự kiện / Đi chơi",
    price: 0,
    count: 0,
    timeMatch: 0,
    timeDetail: []
  },
  11: {
    isAvailable: false,
    name: "Makeup cá nhân (Kỷ yếu / Tốt nghiệp / Lookbook)",
    price: 0,
    count: 0,
    timeMatch: 0,
    timeDetail: []
  }
};

const availableAmenities = [
  "Trang điểm cô dâu tại nhà",
  "Trang điểm cô dâu tại studio",
  "Trang điểm cô dâu buổi sáng",
  "Trang điểm cô dâu buổi tối",
  "Trang điểm ăn hỏi",
  "Trang điểm ngày cưới",
  "Trang điểm dạ tiệc",
  "Trang điểm gala",
  "Trang điểm sinh nhật",
  "Trang điểm kỷ yếu",
  "Trang điểm chụp ảnh nghệ thuật",
  "Trang điểm concept thời trang",
  "Trang điểm quay TVC",
  "Trang điểm quảng cáo",
  "Trang điểm sân khấu",
  "Trang điểm hóa trang nhân vật",
  "Làm tóc nhẹ",
  "Làm tóc cầu kỳ",
  "Dặm lại trong tiệc",
  "Thay đổi phong cách giữa buổi",
  "Thử makeup trước ngày chính",
  "Makeup + chụp ảnh mini",
  "Trang điểm + stylist trang phục",
  "Trang điểm + thuê phụ kiện",
  "Makeup tự nhiên",
  "Makeup Hàn Quốc",
  "Makeup Trung Quốc",
  "Makeup Âu Mỹ",
  "Makeup tone tây",
  "Makeup nhẹ nhàng",
  "Makeup cá tính",
  "Makeup sexy",
  "Makeup ngọt ngào",
  "Makeup cổ trang",
  "Makeup vintage",
  "Makeup high-fashion",
  "Dịch vụ tận nơi",
  "Có mặt 24/7",
  "Nhận gấp trong ngày",
  "Hỗ trợ đi tỉnh",
  "Giữ lớp lâu trôi",
  "Makeup chống nước",
  "Chống mồ hôi",
  "Dụng cụ makeup vệ sinh sạch",
  "Mỹ phẩm cao cấp chính hãng",
  "Cá nhân hóa theo khuôn mặt",
  "Tư vấn trước khi makeup",
  "Hỗ trợ online trước sự kiện",
  "Có hợp đồng cam kết"
];

const EditServiceModal = ({ open, onClose, onSuccess, serviceData={} }) => {
  const { currentUser } = useApp();

  const [serviceName, setServiceName] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [openingTime, setOpeningTime] = useState(dayjs("2022-04-17T06:00", "HH:mm"));
  const [closingTime, setClosingTime] = useState(dayjs("2022-04-17T22:30", "HH:mm"));
  const [location, setLocation] = useState("");
  const [locationDetail, setLocationDetail] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [amenities, setAmenities] = useState([]);
  const [packages, setPackages] = useState(fieldSizes);
  const [experienceYears, setExperienceYears] = useState(0);
  const [experienceMonths, setExperienceMonths] = useState(0);

  // Load dữ liệu khi mở modal và có serviceData
  useEffect(() => {
    if (open && serviceData) {
      setServiceName(serviceData.serviceName || "");
      setDescription(serviceData.description || "");
      setImages(serviceData.images || []);

      // Sửa lại cách parse thời gian
      if (serviceData.openingTime) {
        const [hour, minute] = serviceData.openingTime.split(":");
        setOpeningTime(dayjs().hour(parseInt(hour)).minute(parseInt(minute)));
      }
      if (serviceData.closingTime) {
        const [hour, minute] = serviceData.closingTime.split(":");
        setClosingTime(dayjs().hour(parseInt(hour)).minute(parseInt(minute)));
      }
      setLocation((prev)=> serviceData.location || prev);
      setLocationDetail(serviceData.locationDetail || "");
      setLatitude(serviceData.latitude ? serviceData.latitude.toString() : "");
      setLongitude(serviceData.longitude ? serviceData.longitude.toString() : "");
      setAmenities(serviceData.amenities || []);
      setExperienceYears(serviceData.experienceYears || 0);
      setExperienceMonths(serviceData.experienceMonths || 0);

      // Merge packages data với default packages
      const mergedPackages = { ...fieldSizes };
      if (serviceData.packages) {
        Object.keys(serviceData.packages).forEach((key) => {
          if (mergedPackages[key]) {
            mergedPackages[key] = { ...mergedPackages[key], ...serviceData.packages[key] };
          }
        });
      }
      setPackages(mergedPackages);
    }
  }, [open, serviceData]);

  // Reset form khi đóng modal
  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toString());
          setLongitude(position.coords.longitude.toString());
          toast.success("Đã lấy vị trí hiện tại");
        },
        (error) => {
          toast.error("Không thể lấy vị trí hiện tại");
        }
      );
    } else {
      toast.error("Trình duyệt không hỗ trợ lấy vị trí");
    }
  };

  const handleImageUpload = (event) => {
    const fileList = Array.from(event.target.files);
    setImages([...images, ...fileList]);
  };

  const resetForm = () => {
    setServiceName("");
    setDescription("");
    setImages([]);
    setLocation("");
    setLocationDetail("");
    setLatitude("");
    setLongitude("");
    setAmenities([]);
    setPackages(fieldSizes);
    setExperienceYears(0);
    setExperienceMonths(0);
  };

  const handleSubmit = async () => {
    try {
      // Validation
      if (!serviceName.trim()) {
        toast.error("Vui lòng nhập tên dịch vụ makeup");
        return;
      }

      if (!location.trim()) {
        toast.error("Vui lòng chọn địa chỉ");
        return;
      }

      // Kiểm tra giá & số lượng hợp lệ
      for (const [key, value] of Object.entries(packages)) {
        if (value.isAvailable && (value.price <= 0 || value.count <= 0)) {
          toast.error("Giá và số lượng dịch vụ makeup phải lớn hơn 0");
          return;
        }
      }

      // Kiểm tra tọa độ
      if (latitude && (isNaN(parseFloat(latitude)) || parseFloat(latitude) < -90 || parseFloat(latitude) > 90)) {
        toast.error("Vĩ độ phải là số từ -90 đến 90");
        return;
      }
      if (longitude && (isNaN(parseFloat(longitude)) || parseFloat(longitude) < -180 || parseFloat(longitude) > 180)) {
        toast.error("Kinh độ phải là số từ -180 đến 180");
        return;
      }

      loadingUi(true);

      // Upload images mới (chỉ upload những file mới)
      const newImages = images.filter((image) => image instanceof File);
      const existingImages = images.filter((image) => typeof image === "string");

      const uploadImages = newImages.map(async (image) => {
        const formData = new FormData();
        formData.append("file", image);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData
        });

        if (!response.ok) throw new Error("Lỗi khi tải ảnh lên");

        const data = await response.json();
        return data.url;
      });

      const newImageUrls = await Promise.all(uploadImages);
      const allImages = [...existingImages, ...newImageUrls];

      // Prepare data
      const data = {
        serviceName,
        description,
        location,
        locationDetail,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        amenities,
        openingTime: openingTime.format("HH:mm"),
        closingTime: closingTime.format("HH:mm"),
        images: allImages,
        packages,
        experienceYears: Number.isFinite(Number(experienceYears)) ? Number(experienceYears) : 0,
        experienceMonths: Number.isFinite(Number(experienceMonths)) ? Number(experienceMonths) : 0
      };

      // Send request - sử dụng PUT để cập nhật
      const res = await SendRequest("PUT", `/api/services/${serviceData._id}`, data);

      toast.success("Cập nhật dịch vụ makeup thành công");
      onSuccess(); // Callback để refresh danh sách
      onClose(); // Đóng modal
      loadingUi(false);
    } catch (error) {
      console.error("Lỗi trong quá trình xử lý:", error);
      toast.error("Đã xảy ra lỗi, vui lòng thử lại!");
      loadingUi(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Sửa thông tin dịch vụ</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="Tên dịch vụ"
                fullWidth
                variant="outlined"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <SearchAddressComponent
                className=""
                onSearch={setLocation}
                oldSearch={serviceData.location || ""}
                value={location} // Thêm prop value để auto-fill
              />
              <TextField
                label="Địa chỉ chi tiết"
                fullWidth
                sx={{ mt: 2 }}
                variant="outlined"
                value={locationDetail}
                onChange={(e) => setLocationDetail(e.target.value)}
              />
            </Grid>

            {/* Kinh nghiệm chuyên viên - đặt ngay sau địa chỉ, giống trang thêm */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Kinh nghiệm (năm)"
                fullWidth
                variant="outlined"
                type="number"
                inputProps={{ min: 0 }}
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Kinh nghiệm (tháng)"
                fullWidth
                variant="outlined"
                type="number"
                inputProps={{ min: 0, max: 11 }}
                helperText="0 - 11 tháng"
                value={experienceMonths}
                onChange={(e) => setExperienceMonths(e.target.value)}
              />
            </Grid>

            {/* Tọa độ */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Tọa độ vị trí
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={5}>
                  <TextField
                    label="Vĩ độ (Latitude)"
                    fullWidth
                    variant="outlined"
                    type="number"
                    inputProps={{ step: "any" }}
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="Ví dụ: 10.8231"
                  />
                </Grid>
                <Grid item xs={5}>
                  <TextField
                    label="Kinh độ (Longitude)"
                    fullWidth
                    variant="outlined"
                    type="number"
                    inputProps={{ step: "any" }}
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="Ví dụ: 106.6297"
                  />
                </Grid>
                <Grid item xs={2}>
                  <Button variant="outlined" fullWidth sx={{ height: "56px" }} onClick={getCurrentLocation}>
                    Lấy vị trí
                  </Button>
                </Grid>
              </Grid>
            </Grid>

            {/* Tiện ích */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Tiện ích dịch vụ
              </Typography>
              <Autocomplete
                multiple
                options={availableAmenities}
                value={amenities}
                onChange={(event, newValue) => setAmenities(newValue)}
                renderTags={(tagValue, getTagProps) =>
                  tagValue.map((option, index) => <Chip label={option} {...getTagProps({ index })} key={option} />)
                }
                renderInput={(params) => (
                  <TextField {...params} variant="outlined" placeholder="Chọn hoặc thêm tiện ích" />
                )}
                freeSolo
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Mô tả dịch vụ"
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1">Ảnh mô tả dịch vụ</Typography>
              <input type="file" multiple accept="image/*" onChange={handleImageUpload} />
              <ImagePreview images={images} setImages={setImages} />
            </Grid>

            <Grid item xs={6}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <TimePicker
                  label="Giờ mở cửa"
                  value={openingTime}
                  onChange={setOpeningTime}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={6}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <TimePicker
                  label="Giờ đóng cửa"
                  value={closingTime}
                  onChange={setClosingTime}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6">Gói dịch vụ và giá</Typography>
              <SelectServiceComponent
                packages={packages}
                setPackages={setPackages}
                openingTime={openingTime}
                closingTime={closingTime}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary">
          Hủy
        </Button>
        <Button onClick={handleSubmit} color="primary" variant="contained">
          Cập nhật dịch vụ
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditServiceModal;
