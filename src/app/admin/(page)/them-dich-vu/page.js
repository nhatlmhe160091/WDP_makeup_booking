"use client";
import { useState } from "react";
import {
  TextField,
  Grid,
  Box,
  Button,
  MenuItem,
  Typography,
  Select,
  InputLabel,
  FormControl,
  Paper,
  IconButton,
  Chip,
  Autocomplete
} from "@mui/material";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AddCircleOutline, Delete } from "@mui/icons-material";
import PageContainer from "@muahub/app/admin/components/container/PageContainer";
import DashboardCard from "../../components/shared/DashboardCard";
import dayjs from "dayjs";
import ImagePreview from "@muahub/app/admin/components/ImagePreview";
import SearchAddressComponent from "../../components/SearchAddressComponent";
import SelectServiceComponent from "../../components/SelectServiceComponent";
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

// Danh sách tiện ích dịch vụ makeup
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

const CreateServicePage = () => {
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
  const [experienceYears, setExperienceYears] = useState(0);
  const [experienceMonths, setExperienceMonths] = useState(0);
  const [packages, setPackages] = useState(fieldSizes);

  // Lấy vị trí hiện tại
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

  const handleSubmit = async () => {
    try {
      // Validate bắt buộc
      if (!serviceName.trim()) {
        toast.error("Vui lòng nhập tên dịch vụ");
        return;
      }
      if (!location.trim() || !locationDetail.trim()) {
        toast.error("Vui lòng nhập đầy đủ địa chỉ (tỉnh/thành và địa chỉ làm đẹp)");
        return;
      }
      if (images.length === 0) {
        toast.error("Vui lòng tải lên ít nhất 1 ảnh dịch vụ");
        return;
      }
      // Kinh nghiệm: năm >=0, tháng 0-11
      const years = Number(experienceYears);
      const months = Number(experienceMonths);
      if (!(Number.isFinite(years) && years >= 0)) {
        toast.error("Kinh nghiệm (năm) phải là số không âm");
        return;
      }
      if (!(Number.isFinite(months) && months >= 0 && months <= 11)) {
        toast.error("Kinh nghiệm (tháng) phải trong khoảng 0 - 11");
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
      // Upload tất cả ảnh song song bằng Promise.all
      const uploadImages = images.map(async (image) => {
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

      // Chờ tất cả ảnh upload xong
      // eslint-disable-next-line no-undef
      const imgs = await Promise.all(uploadImages);

      // Chuẩn bị dữ liệu gửi lên server
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
        images: imgs,
        packages,
        experienceYears: Number.isFinite(Number(experienceYears)) ? Number(experienceYears) : 0,
        experienceMonths: Number.isFinite(Number(experienceMonths)) ? Number(experienceMonths) : 0
      };

      // Gửi request thêm dịch vụ
      const res = await SendRequest("POST", "/api/services", data);

      toast.success("Thêm dịch vụ thành công");
      // reset form
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
    } catch (error) {
      console.error("Lỗi trong quá trình xử lý:", error);
      toast.error("Đã xảy ra lỗi, vui lòng thử lại!");
      loadingUi(false);
    }
  };

  return (
    <PageContainer title="Thêm dịch vụ makeup" description="Tạo dịch vụ makeup mới vào hệ thống">
      <DashboardCard
        title="Thêm dịch vụ mới"
        subtitle="Vui lòng điền thông tin dịch vụ vào form dưới đây"
      >
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
            <SearchAddressComponent className={""} onSearch={setLocation} oldSearch={currentUser?.address || ""} />

            <TextField
              label="Địa chỉ làm đẹp"
              fullWidth
              sx={{ marginTop: 3 }}
              variant="outlined"
              value={locationDetail}
              onChange={(e) => setLocationDetail(e.target.value)}
            />
          </Grid>

          {/* Kinh nghiệm chuyên viên */}
          <Grid item xs={12} md={6}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
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
              <Grid item xs={6}>
                <TextField
                  label="Kinh nghiệm (tháng)"
                  fullWidth
                  variant="outlined"
                  type="number"
                  inputProps={{ min: 0, max: 11 }}
                  value={experienceMonths}
                  onChange={(e) => setExperienceMonths(e.target.value)}
                  helperText="0 - 11 tháng"
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Thêm phần tọa độ */}
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
                  Lấy vị trí hiện tại
                </Button>
              </Grid>
            </Grid>
          </Grid>

          {/* Thêm phần tiện ích */}
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Tiện ích dịch vụ
            </Typography>
            <Autocomplete
              multiple
              options={availableAmenities}
              value={amenities}
              onChange={(event, newValue) => {
                setAmenities(newValue);
              }}
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
              <TimePicker label="Giờ mở cửa" value={openingTime} onChange={setOpeningTime} />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={6}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <TimePicker label="Giờ đóng cửa" value={closingTime} onChange={setClosingTime} />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6">Gói dịch vụ và giá</Typography>
          </Grid>

          <SelectServiceComponent
            packages={packages}
            setPackages={setPackages}
            openingTime={openingTime}
            closingTime={closingTime}
          />

          <Button variant="contained" sx={{ marginTop: 2, marginLeft: 3 }} onClick={handleSubmit}>
            Thêm dịch vụ
          </Button>
        </Grid>
      </DashboardCard>
    </PageContainer>
  );
};

export default CreateServicePage;
