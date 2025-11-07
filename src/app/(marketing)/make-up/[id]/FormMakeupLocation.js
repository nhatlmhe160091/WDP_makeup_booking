"use client";
import React, { useState } from 'react';
import { Form, Button, Modal } from 'react-bootstrap';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Icon cho studio
const studioIcon = new L.Icon({
  iconUrl: '/avatar.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

// Icon cho vị trí của bạn
const userIcon = new L.Icon({
  iconUrl: '/logo.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});
function getDistanceKm(lat1, lng1, lat2, lng2) {
  function toRad(x) { return x * Math.PI / 180; }
  const R = 6371; // bán kính Trái Đất (km)
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(2);
}

const FormMakeupLocation = ({ makeupLocation, setMakeupLocation, latitude, longitude, serviceLocation, setServiceLocation }) => {
  const [showMapModal, setShowMapModal] = useState(false);
  const [userLat, setUserLat] = useState(null);
  const [userLng, setUserLng] = useState(null);
  const [locationSaved, setLocationSaved] = useState(false);

  // Update serviceLocation when userLat/userLng changes
  React.useEffect(() => {
    if (makeupLocation === "at-studio") {
      setServiceLocation({
        extraFee: 0,
        distanceKm: 0,
        customerLat: null,
        customerLng: null,
        studioLat: latitude,
        studioLng: longitude
      });
      setLocationSaved(false);
    }
  }, [makeupLocation, latitude, longitude, setServiceLocation]);
  const handleHomeClick = () => {
    setMakeupLocation("at-home");
    setShowMapModal(true);
  };

  // Center map: nếu có vị trí user thì lấy user, không thì lấy studio
  const mapCenter = userLat && userLng ? [userLat, userLng] : [latitude, longitude];

  return (
    <>
      <Form.Group className="mb-3">
        <Form.Label>Chọn địa điểm make up</Form.Label>
        <div className="d-flex gap-2">
          <Button
            variant={makeupLocation === "at-studio" ? "primary" : "outline-primary"}
            onClick={() => setMakeupLocation("at-studio")}
            size="sm"
            className="w-50"
          >
            <i className="fas fa-store me-2"></i>
            Đến studio
          </Button>
          <Button
            variant={makeupLocation === "at-home" ? "primary" : "outline-primary"}
            onClick={handleHomeClick}
            size="sm"
            className="w-50"
          >
            <i className="fas fa-home me-2"></i>
            Đến tận nơi
          </Button>
        </div>
      </Form.Group>

      {makeupLocation && (
        <div className="mb-3">
          <strong>Địa điểm đã chọn:</strong>{' '}
          {makeupLocation === 'at-studio' ? 'Đến studio' : makeupLocation === 'at-home' ? 'Đến tận nơi' : 'Chưa chọn'}
        </div>
      )}

      {/* Hiển thị khoảng cách và phụ phí nếu đã lưu vị trí */}
      {makeupLocation === "at-home" && locationSaved && serviceLocation && (
        <div className="mb-2">
          <strong>Khoảng cách:</strong> {serviceLocation.distanceKm} km<br />
          <strong>Phụ phí vận chuyển:</strong> {serviceLocation.extraFee.toLocaleString()} VND
        </div>
      )}

      <Modal show={showMapModal} onHide={() => setShowMapModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Chọn vị trí trên bản đồ</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <Button variant="info" onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((pos) => {
                  setUserLat(pos.coords.latitude);
                  setUserLng(pos.coords.longitude);
                  // setServiceLocation sẽ được gọi qua useEffect
                });
              } else {
                alert("Trình duyệt không hỗ trợ lấy vị trí!");
              }
            }}>
              Lấy vị trí của tôi
            </Button>
          </div>
          <div style={{ width: "100%", height: 300 }}>
            <MapContainer center={mapCenter} zoom={13} style={{ width: "100%", height: 300 }} scrollWheelZoom={true}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[latitude, longitude]} icon={studioIcon}>
                <Popup>Studio</Popup>
              </Marker>
              {userLat && userLng && (
                <Marker position={[userLat, userLng]} icon={userIcon}>
                  <Popup>Vị trí của bạn</Popup>
                </Marker>
              )}
            </MapContainer>
          </div>
          <div className="mt-3">
            <strong>Vị trí studio:</strong> {latitude}, {longitude}<br />
            <strong>Vị trí của bạn:</strong> {userLat ? userLat.toFixed(5) : "?"}, {userLng ? userLng.toFixed(5) : "?"}
          </div>
          <div className="mt-2">
            <strong>Khoảng cách:</strong> {userLat && userLng ? `${getDistanceKm(userLat, userLng, latitude, longitude)} km` : "?"}
          </div>
          {userLat && userLng && (
            <div className="mt-2">
              <strong>Phụ phí vận chuyển:</strong> {(() => {
                const km = parseFloat(getDistanceKm(userLat, userLng, latitude, longitude));
                return `${(km * 1000).toLocaleString()} VND`;
              })()}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" disabled={!(userLat && userLng)} onClick={() => {
            if (userLat && userLng) {
              const distanceKm = parseFloat(getDistanceKm(userLat, userLng, latitude, longitude));
              const extraFee = Math.round(distanceKm * 1000);
              setServiceLocation({
                extraFee,
                distanceKm,
                customerLat: userLat,
                customerLng: userLng,
                studioLat: latitude,
                studioLng: longitude
              });
              setLocationSaved(true);
              setShowMapModal(false);
            }
          }}>Lưu vị trí</Button>
          <Button variant="secondary" onClick={() => setShowMapModal(false)}>Đóng</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default FormMakeupLocation;
