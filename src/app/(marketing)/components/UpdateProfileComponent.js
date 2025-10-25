"use client";

import { ROLE_MANAGER } from "@muahub/constants/System";
import { useState, useEffect } from "react";
import { Form, Button } from "react-bootstrap";
import SearchAddressComponent from "./SearchAddressComponent";
import SendRequest, { loadingUi } from "@muahub/utils/SendRequest";
import toast from "react-hot-toast";

const UpdateProfileComponent = ({ currentUser, updateUser }) => {
  const [formData, setFormData] = useState({
    name: currentUser.name || "",
    phone: currentUser.phone || "",
    avatar: "",
    bio: currentUser.bio || "",
    bank_info: currentUser.bank_info || "",
    bank_info_number: currentUser.bank_info_number || ""
  });
  const [file, setFile] = useState(null);
  const [banks, setBanks] = useState([]);
  const [errors, setErrors] = useState({});
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (currentUser.address) {
      setAddress(currentUser.address);
    }
    if (currentUser) {
      setFormData({
        name: currentUser.name || "",
        phone: currentUser.phone || "",
        avatar: "",
        bio: currentUser.bio || "",
        bank_info: currentUser.bank_info || "",
        bank_info_number: currentUser.bank_info_number || ""
      });
    }
  }, [currentUser]);

  useEffect(() => {
    fetch("https://api.vietqr.io/v2/banks")
      .then((response) => response.json())
      .then((data) => {
        if (data.code === "00") {
          setBanks(data.data);
        }
      })
      .catch((error) => console.error("Error fetching banks:", error));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Họ và tên không được để trống.";
    if (!formData.phone.trim()) newErrors.phone = "Số điện thoại không được để trống.";
    if (!address.trim()) newErrors.address = "Địa chỉ không được để trống.";
    if (!formData.bank_info.trim()) newErrors.bank_info = "Vui lòng chọn ngân hàng.";
    if (!formData.bank_info_number.trim()) newErrors.bank_info_number = "Số tài khoản ngân hàng không được để trống.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    let fileUrl = currentUser.avatar || "";
    if (file) {
      loadingUi(true);
      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData
        });

        if (!response.ok) throw new Error("Lỗi khi tải ảnh lên");

        const data = await response.json();
        fileUrl = data.url;
      } catch (error) {
        toast.error("Lỗi khi tải ảnh lên");
      }
    }
    const payload = {
      ...formData,
      address,
      avatar: fileUrl,
      id: currentUser._id
    };

    const response = await SendRequest("PUT", "/api/users", payload);
    if (response.payload) {
      toast.success("Cập nhật thông tin thành công");
    } else {
      toast.error("Cập nhật thông tin thất bại");
    }
    updateUser({
      ...currentUser,
      ...payload
    });
    // reset form
    setFormData({
      name: currentUser.name || "",
      phone: currentUser.phone || "",
      avatar: "",
      bio: currentUser.bio || "",
      bank_info: currentUser.bank_info || "",
      bank_info_number: currentUser.bank_info_number || ""
    });
    setFile(null);
  };
if (!currentUser) return <div>Đang tải...</div>;
  return (
    <Form onSubmit={handleUpdate}>
      <Form.Group className="mb-3">
        <Form.Label>Ảnh đại diện</Form.Label>
        <Form.Control type="file" name="avatar" onChange={(e) => setFile(e.target.files[0])} />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Họ và tên</Form.Label>
        <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} />
        {errors.name && <div className="text-danger">{errors.name}</div>}
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Địa chỉ Email</Form.Label>
        <Form.Control type="text" name="email" value={currentUser.email} disabled={true} />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Số điện thoại</Form.Label>
        <Form.Control type="text" name="phone" value={formData.phone} onChange={handleChange} />
        {errors.phone && <div className="text-danger">{errors.phone}</div>}
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Địa chỉ</Form.Label>
        <div className="row mb-2">
          <SearchAddressComponent
            className="col-md-4 mb-2"
            onSearch={setAddress}
            oldSearch={currentUser.address || ""}
          />
        </div>
        {errors.address && <div className="text-danger">{errors.address}</div>}
      </Form.Group>
      {currentUser.role === ROLE_MANAGER.MUA && (
        <Form.Group className="mb-3">
          <Form.Label>Tiểu sử</Form.Label>
          <Form.Control as="textarea" name="bio" value={formData.bio} onChange={handleChange} />
        </Form.Group>
      )}
      <Form.Group className="mb-3">
        <Form.Label>Ngân hàng</Form.Label>
        <Form.Select name="bank_info" value={formData.bank_info} onChange={handleChange}>
          <option value="">Chọn ngân hàng</option>
          {banks.map((bank) => (
            <option key={bank.id} value={bank.bin}>
              {bank.name}
            </option>
          ))}
        </Form.Select>
        {errors.bank_info && <div className="text-danger">{errors.bank_info}</div>}
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Số tài khoản ngân hàng</Form.Label>
        <Form.Control type="text" name="bank_info_number" value={formData.bank_info_number} onChange={handleChange} />
        {errors.bank_info_number && <div className="text-danger">{errors.bank_info_number}</div>}
      </Form.Group>

      <Button variant="primary" type="submit">
        Cập nhật
      </Button>
    </Form>
  );
};

export default UpdateProfileComponent;
