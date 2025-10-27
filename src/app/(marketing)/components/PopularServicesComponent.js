"use client";
import React, { useEffect, useState, useRef } from "react";
import ArtistComponent from "./ArtistComponent";

const PopularServicesComponent = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const carouselRef = useRef(null);
  const ARTISTS_PER_SLIDE = 3;
  const AUTO_SCROLL_INTERVAL = 5000; // 5 seconds

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

  // Set up auto-scrolling
  useEffect(() => {
    if (packages.length > ARTISTS_PER_SLIDE) {
      const interval = setInterval(() => {
        setActiveSlide((prev) => {
          const nextSlide = prev + 1;
          const maxSlides = Math.ceil(packages.length / ARTISTS_PER_SLIDE);
          return nextSlide >= maxSlides ? 0 : nextSlide;
        });
      }, AUTO_SCROLL_INTERVAL);

      return () => clearInterval(interval);
    }
  }, [packages.length]);
  const renderArtistSlides = () => {
    const slides = [];
    for (let i = 0; i < packages.length; i += ARTISTS_PER_SLIDE) {
      slides.push(packages.slice(i, i + ARTISTS_PER_SLIDE));
    }
    return slides;
  };

  return (
    <div className="container-fluid service pb-5">
      <div className="container">
        <div className="text-center mx-auto pb-3 wow fadeInUp" data-wow-delay="0.2s" style={{ maxWidth: "800px" }}>
          <h4 style={{ color: "#ff5c95ff", fontWeight: 600 }}>Make up Artist nổi bật</h4>
          <h1 className="display-5">Các make up artist được ưa chuộng</h1>
        </div>

        {loading ? (
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
          </div>
        ) : error ? (
          <div className="text-center text-danger">
            {error}
          </div>
        ) : packages.length === 0 ? (
          <div className="text-center">Không có nghệ sĩ nổi bật</div>
        ) : (
          <div className="position-relative">
            {/* Main Carousel */}
            <div className="carousel-container overflow-hidden" ref={carouselRef}>
              <div 
                className="carousel-inner d-flex transition-transform"
                style={{
                  transform: `translateX(-${activeSlide * 100}%)`,
                  transition: 'transform 0.5s ease-in-out'
                }}
              >
                {renderArtistSlides().map((slideArtists, index) => (
                  <div 
                    key={index} 
                    className="carousel-slide w-100 flex-shrink-0"
                  >
                    <div className="row g-3">
                      {slideArtists.map((artist) => (
                        <ArtistComponent key={artist._id} artist={artist} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Dots */}
            {packages.length > ARTISTS_PER_SLIDE && (
              <div className="carousel-indicators position-relative mt-4">
                {renderArtistSlides().map((_, index) => (
                  <button
                    key={index}
                    className={`btn btn-sm rounded-circle mx-1 ${
                      activeSlide === index ? 'btn-primary' : 'btn-outline-primary'
                    }`}
                    style={{ width: '10px', height: '10px', padding: '0' }}
                    onClick={() => setActiveSlide(index)}
                  >
                    <span className="visually-hidden">Slide {index + 1}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .carousel-container {
          position: relative;
          width: 100%;
        }
        .carousel-inner {
          display: flex;
          transition: transform 0.5s ease-in-out;
        }
        .carousel-slide {
          flex: 0 0 100%;
        }
        .carousel-indicators {
          display: flex;
          justify-content: center;
          padding: 1rem 0;
        }
        .transition-transform {
          transition: transform 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default PopularServicesComponent;
