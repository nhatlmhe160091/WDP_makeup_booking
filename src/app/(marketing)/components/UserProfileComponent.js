"use client";

import { useState } from "react";
import { Tab, Tabs, Form, Button } from "react-bootstrap";
import { useApp } from "@muahub/app/contexts/AppContext";
import UpdateProfileComponent from "./UpdateProfileComponent";
import UpdateMakeupArtistProfileComponent from "./UpdateMakeupArtistProfileComponent";
import toast from "react-hot-toast";
import SendRequest from "@muahub/utils/SendRequest";
import { ROLE_MANAGER } from "@muahub/constants/System";
import HistoryBookingComponent from "./HistoryBookingComponent";
import { Alert, AlertTitle, Stack } from "@mui/material";
import UpgradeIcon from "@mui/icons-material/Upgrade";
import EmailIcon from "@mui/icons-material/Email";
import { ArrowCircleDownOutlined, ExpandCircleDownOutlined, MailOutlined } from "@mui/icons-material";
import HistoryBankComponent from "./HistoryBankComponent";

const UserProfileComponent = () => {
  const { currentUser, updateUser } = useApp();
  const [key, setKey] = useState("account");

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Mật khẩu mới không khớp.");
      return;
    }
    const res = await SendRequest("PUT", "/api/users", {
      id: currentUser._id,
      password: passwordData.newPassword,
      currentPassword: passwordData.currentPassword
    });
    if (res.payload) {
      toast.success("Cập nhật mật khẩu thành công.");
    } else {
      toast.error("Cập nhật mật khẩu thất bại.");
    }
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
  };

  const handleUpgradeRequest = async () => {
    try {
      // Kiểm tra xem đã có yêu cầu pending chưa
      const checkRes = await fetch(`/api/request-add-sale?email=${currentUser.email}`);
      const checkData = await checkRes.json();
      const isPending = checkData.data?.some((item) => item.email === currentUser.email && item.status === "pending");
      if (isPending) {
        toast("Bạn đã gửi yêu cầu nâng cấp trước đó. Vui lòng chờ xác nhận từ quản trị viên.");
        return;
      }

      // Nếu chưa có thì gửi yêu cầu mới
      const res = await fetch("/api/request-add-sale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser._id,
          email: currentUser.email
        })
      });
      const data = await res.json();
      if (data.success) toast.success(data.message);
      else toast.error(data.message || "Gửi yêu cầu thất bại!");
    } catch {
      toast.error("Gửi yêu cầu thất bại!");
    }
  };

  return (
    <div className="container my-4">
      <Tabs id="profile-tabs" activeKey={key} onSelect={(k) => setKey(k)} className="mb-3">
        <Tab eventKey="account" title="Cập nhật tài khoản">
          <UpdateProfileComponent currentUser={currentUser} updateUser={updateUser} />
        </Tab>
              
        {/* Tab cập nhật hồ sơ chuyên gia cho MUA */}
        {currentUser.role === "makeup_artist" && (
          <Tab eventKey="mua-profile" title="Cập nhật hồ sơ chuyên gia">
            <UpdateMakeupArtistProfileComponent currentUser={currentUser} />
          </Tab>
        )}

        <Tab eventKey="password" title="Cập nhật mật khẩu">
          <Form onSubmit={handlePasswordUpdate}>
            <Form.Group className="mb-3">
              <Form.Label>Mật khẩu mới</Form.Label>
              <Form.Control
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Xác nhận mật khẩu mới</Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              Cập nhật mật khẩu
            </Button>
          </Form>
        </Tab>

        {currentUser.role === ROLE_MANAGER.USER && (
          <Tab eventKey="empty" title="Lịch sử đặt dịch vụ">
            <HistoryBookingComponent currentUser={currentUser} />
          </Tab>
        )}

        <Tab eventKey="backs" title="Lịch sử trả tiền">
          <HistoryBankComponent currentUser={currentUser} />
        </Tab>

        {currentUser.role === ROLE_MANAGER.USER && (
          <Tab eventKey="upgrade" title="Yêu cầu nâng cấp">
            <div className="mt-3">
              {currentUser.active ? (
                <Alert severity="info" className="mb-3">
                  <AlertTitle>
                    <UpgradeIcon fontSize="small" /> Yêu cầu nâng cấp thành Chủ dịch vụ
                  </AlertTitle>
                  <p>Nếu bạn muốn trở thành quản lý/chủ dịch vụ trên hệ thống, vui lòng gửi yêu cầu xác nhận.</p>
                  <div className="d-flex justify-content-end">
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<UpgradeIcon />}
                      onClick={handleUpgradeRequest}
                    >
                      Gửi yêu cầu nâng cấp
                    </Button>
                  </div>
                </Alert>
              ) : (
                <Alert severity="warning">
                  <AlertTitle>
                    <EmailIcon fontSize="small" /> Tài khoản chưa xác thực
                  </AlertTitle>
                  <p>
                    Bạn cần xác minh tài khoản để gửi yêu cầu nâng cấp. Vui lòng kiểm tra email xác nhận và làm theo
                    hướng dẫn.
                  </p>
                </Alert>
              )}
            </div>
          </Tab>
        )}
      </Tabs>
    </div>
  );
};

export default UserProfileComponent;
