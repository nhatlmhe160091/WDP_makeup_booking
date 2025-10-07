"use client";

import { useEffect, useState } from "react";
import BoxFieldComponent from "../components/BoxFieldComponent";
import SendRequest from "@muahub/utils/SendRequest";

const itemsPerPage = 12;

const MakeupServiceNoiBatComponent = () => {
  const [packages, setPackages] = useState([]);

  // Fetch packages data from API
  useEffect(() => {
    const fetchPackages = async () => {
      const response = await SendRequest("GET", "/api/services");
      if (response.payload) {
        setPackages(response.payload);
      }
    };
    fetchPackages();
  }, []);

  return (
    <div className="container-fluid contact">
      <div className="container pt-5 pb-2">
        <div className="text-center mx-auto pb-5 wow fadeInUp" data-wow-delay="0.2s" style={{ maxWidth: "800px" }}>
          <h1 className="display-5 mb-4">Dịch vụ makeup nổi bật</h1>
          <p className="mb-0">Tổng hợp các dịch vụ được nhiều khách đặt nhất, chất lượng cao và uy tín.</p>
        </div>
        {/* Packages List */}
        <div className="row g-3">
          {packages.slice(0, 6).map((field) => (
            <BoxFieldComponent key={field._id} field={field} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MakeupServiceNoiBatComponent;
