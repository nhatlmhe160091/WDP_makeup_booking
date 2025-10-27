"use client";

import { useEffect, useState } from "react";
import BoxFieldComponent from "../components/BoxFieldComponent";
import SendRequest from "@muahub/utils/SendRequest";

const ITEMS_PER_PAGE = 6;
const AUTO_ROTATE_INTERVAL = 5000; // 5 giây

const MakeupServiceNoiBatComponent = () => {
  const [packages, setPackages] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch featured packages data from API
  useEffect(() => {
    const fetchFeaturedPackages = async () => {
      try {
        const response = await fetch('/api/services/featured');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log("Featured services data:", data);
        if (data.data) {
          setPackages(data.data);
        }
      } catch (error) {
        console.error("Error fetching featured services:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFeaturedPackages();
  }, []);

  // Tự động chuyển trang
  useEffect(() => {
    if (packages.length <= ITEMS_PER_PAGE) return;

    const maxPages = Math.ceil(packages.length / ITEMS_PER_PAGE);
    const timer = setInterval(() => {
      setCurrentPage((prevPage) => (prevPage + 1) % maxPages);
    }, AUTO_ROTATE_INTERVAL);

    return () => clearInterval(timer);
  }, [packages.length]);

  // Tính toán số trang
  const totalPages = Math.ceil(packages.length / ITEMS_PER_PAGE);

  // Xử lý chuyển trang
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="container-fluid contact">
      <div className="container pt-5 pb-2">
        <div className="text-center mx-auto pb-5 wow fadeInUp" data-wow-delay="0.2s" style={{ maxWidth: "800px" }}>
          <h1 className="display-5 mb-4">Gói dịch vụ nổi bật</h1>
          <p className="mb-0">Tổng hợp các dịch vụ được nhiều khách đặt nhất, chất lượng cao và uy tín.</p>
        </div>
        {/* Hiển thị nút điều hướng nếu có nhiều hơn 6 gói và không trong trạng thái loading */}
        {!isLoading && totalPages > 1 && (
          <div className="text-center mb-4">
            <div className="btn-group">
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index}
                  className={`btn ${currentPage === index ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => handlePageChange(index)}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        )}
        {/* Packages List */}
        <div className="row g-3">
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="col-lg-4 col-md-6 wow fadeInUp" data-wow-delay={`0.${index + 1}s`}>
                <div className="bg-light rounded p-4" style={{ minHeight: "300px" }}>
                  <div className="placeholder-glow">
                    <div className="placeholder col-12 mb-3" style={{ height: "200px" }}></div>
                    <div className="placeholder col-8 mb-2"></div>
                    <div className="placeholder col-4"></div>
                  </div>
                </div>
              </div>
            ))
          ) : packages && packages.length > 0 ? (
            packages.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE).map((field) => (
              <BoxFieldComponent 
                key={field._id} 
                field={field}
                showDistance={false}
                showBookingCount={true}
              />
            ))
          ) : (
            <div className="col-12 text-center">
              <p>Không có dịch vụ nổi bật nào.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MakeupServiceNoiBatComponent;
