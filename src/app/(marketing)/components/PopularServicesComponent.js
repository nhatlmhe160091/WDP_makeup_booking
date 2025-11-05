
"use client";
import React, { useEffect, useState } from "react";
import ArtistComponent from "./ArtistComponent";

const ARTISTS_PER_PAGE = 3;
const AUTO_ROTATE_INTERVAL = 10000; // 10 seconds

const PopularServicesComponent = () => {
  const [packages, setPackages] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeaturedPackages = async () => {
      try {
        const response = await fetch('/api/services/featured');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("API response for featured artists:", data);
        if (data?.featuredArtists) {
          setPackages(data.featuredArtists);
        } else {
          setError("No artists data found");
        }
      } catch (error) {
        console.error("Error fetching featured artists:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedPackages();
  }, []);

  // Auto-rotate page
  useEffect(() => {
    if (packages.length <= ARTISTS_PER_PAGE) return;
    const maxPages = Math.ceil(packages.length / ARTISTS_PER_PAGE);
    const timer = setInterval(() => {
      setCurrentPage((prevPage) => (prevPage + 1) % maxPages);
    }, AUTO_ROTATE_INTERVAL);
    return () => clearInterval(timer);
  }, [packages.length]);

  const totalPages = Math.ceil(packages.length / ARTISTS_PER_PAGE);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="container-fluid service pb-5">
      <div className="container">
        <div className="text-center mx-auto pb-3 wow fadeInUp" data-wow-delay="0.2s" style={{ maxWidth: "800px" }}>
          <h4 style={{ color: "#ff5c95ff", fontWeight: 600 }}>Make up Artist nổi bật</h4>
          <h1 className="display-5">Các make up artist được ưa chuộng</h1>
        </div>

        {/* Navigation buttons */}
        {!loading && totalPages > 1 && (
          <div className="text-center mb-4">
            <div className="btn-group">
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index}
                  className={`btn btn-sm rounded-circle mx-1 ${currentPage === index ? 'btn-primary' : 'btn-outline-primary'}`}
                  style={{ width: '10px', height: '10px', padding: '0' }}
                  onClick={() => handlePageChange(index)}
                >
                  <span className="visually-hidden">Trang {index + 1}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Artists List */}
        <div className="row g-3">
          {loading ? (
            // Loading skeleton
            Array.from({ length: ARTISTS_PER_PAGE }).map((_, index) => (
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
          ) : error ? (
            <div className="col-12 text-center text-danger">
              {error}
            </div>
          ) : packages && packages.length > 0 ? (
            packages.slice(currentPage * ARTISTS_PER_PAGE, (currentPage + 1) * ARTISTS_PER_PAGE).map((artist) => (
              <ArtistComponent key={artist._id} artist={artist} />
            ))
          ) : (
            <div className="col-12 text-center">
              <p>Không có nghệ sĩ nổi bật</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PopularServicesComponent;
