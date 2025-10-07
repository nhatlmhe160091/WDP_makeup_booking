import { useState } from "react";
import { Box, IconButton } from "@mui/material";
import { Delete } from "@mui/icons-material";

const ImagePreview = ({ images, setImages }) => {
  const handleRemoveImage = (index) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
  };

  return (
    <Box display="flex" flexWrap="wrap" gap={2} mt={2}>
      {images.map((image, index) => {
        // Kiểm tra xem image là File object hay string URL
        let imageUrl;
        if (typeof image === "string") {
          // Nếu là string thì đây là URL đã có sẵn
          imageUrl = image;
        } else if (image instanceof File) {
          // Nếu là File object thì tạo URL từ file
          imageUrl = URL.createObjectURL(image);
        } else {
          // Trường hợp khác thì bỏ qua
          return null;
        }

        return (
          <Box
            key={index}
            position="relative"
            width={100}
            height={100}
            border="1px solid #ccc"
            borderRadius={2}
            overflow="hidden"
          >
            <img
              src={imageUrl}
              alt={`preview-${index}`}
              width="100%"
              height="100%"
              style={{ objectFit: "cover" }}
              onError={(e) => {
                // Xử lý trường hợp ảnh bị lỗi
                e.target.src = "/default-image-placeholder.png";
              }}
            />
            <IconButton
              size="small"
              color="error"
              onClick={() => handleRemoveImage(index)}
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                background: "rgba(255, 255, 255, 0.8)"
              }}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Box>
        );
      })}
    </Box>
  );
};

export default ImagePreview;
