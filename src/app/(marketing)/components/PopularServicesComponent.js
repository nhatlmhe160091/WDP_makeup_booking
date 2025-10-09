"use client";
import BoxFieldComponent from "./BoxFieldComponent";
import React, { useEffect, useState } from "react";

const PopularServicesComponent = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch("/api/services/highlight");
        const json = await res.json();
        if (json && json.success) {
          setServices(json.data || []);
        }
      } catch (e) {
        setServices([]);
      }
      setLoading(false);
    };
    fetchServices();
  }, []);

  return (
    <div className="container-fluid service pb-5">
      <div className="container">
        <div className="text-center mx-auto pb-3 wow fadeInUp" data-wow-delay="0.2s" style={{ maxWidth: "800px" }}>
          <h4 style={{ color: "#ff5c95ff", fontWeight: 600 }}>Dịch vụ nổi bật</h4>
          <h1 className="display-5">Các dịch vụ nổi bật tại Hà Nội</h1>
        </div>
        <div className="row g-3">
          {loading ? (
            <div className="text-center">Đang tải...</div>
          ) : services.length === 0 ? (
            <div className="text-center">Không có dịch vụ nổi bật</div>
          ) : (
            services.map((field) => (
              <BoxFieldComponent key={field._id || field.id} field={field} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PopularServicesComponent;
