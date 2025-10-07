"use client";

import { useEffect, useState } from "react";
import SearchAddressComponent from "../components/SearchAddressComponent";
import BoxFieldComponent from "../components/BoxFieldComponent";
import SendRequest from "@muahub/utils/SendRequest";

const itemsPerPage = 12;

const SanBongModal = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [areaFilter, setAreaFilter] = useState("");
  const [sizeFilter, setSizeFilter] = useState("");
  const [fields, setFields] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [sortByDistance, setSortByDistance] = useState(false);
  const [sortByBookings, setSortByBookings] = useState(false); 
  const [bookingCounts, setBookingCounts] = useState({}); 


  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; 
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  };


  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.log("Error getting location:", error);
         
          setUserLocation({
            latitude: 10.8231,
            longitude: 106.6297
          });
        }
      );
    } else {
    
      setUserLocation({
        latitude: 10.8231,
        longitude: 106.6297
      });
    }
  }, []);

 
  const fetchBookingCounts = async () => {
    try {
      const response = await SendRequest("GET", "/api/orders");
      if (response.payload) {
  
        const counts = {};
        response.payload.forEach((order) => {
          const serviceId = order.serviceId;
          counts[serviceId] = (counts[serviceId] || 0) + 1;
        });
        setBookingCounts(counts);
      }
    } catch (error) {
      console.error("Error fetching booking counts:", error);
    }
  };


  useEffect(() => {
    const fetchFields = async () => {
      const response = await SendRequest("GET", "/api/services");
      if (response.payload) {
        setFields(response.payload);
      }
    };

    fetchFields();
    fetchBookingCounts();
  }, []);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSizeFilterChange = (e) => {
    setSizeFilter(e.target.value);
    setCurrentPage(1); 
  };

  const handleSortByDistance = () => {
    setSortByDistance(!sortByDistance);
    setSortByBookings(false); 
    setCurrentPage(1);
  };

  const handleSortByBookings = () => {
    setSortByBookings(!sortByBookings);
    setSortByDistance(false); 
    setCurrentPage(1);
  };

  // Filter fields
  const filteredFields = fields.filter((field) => {
    const matchesArea = areaFilter ? field.location.includes(areaFilter) : true;
    if (sizeFilter === "") return matchesArea;
    const matchesType = field.fields[sizeFilter].isAvailable;
    return matchesArea && matchesType;
  });

  // Sort fields based on selected criteria
  let sortedFields = [...filteredFields];

  if (sortByDistance && userLocation) {
    // Sort by distance
    sortedFields = sortedFields
      .map((field) => ({
        ...field,
        distance:
          field.latitude && field.longitude
            ? calculateDistance(userLocation.latitude, userLocation.longitude, field.latitude, field.longitude)
            : Infinity
      }))
      .sort((a, b) => a.distance - b.distance);
  } else if (sortByBookings) {
    // Sort by booking count (từ nhiều đến ít)
    sortedFields = sortedFields
      .map((field) => ({
        ...field,
        bookingCount: bookingCounts[field._id] || 0
      }))
      .sort((a, b) => b.bookingCount - a.bookingCount);
  } else {
    // Add booking count to fields for display
    sortedFields = sortedFields.map((field) => ({
      ...field,
      bookingCount: bookingCounts[field._id] || 0
    }));
  }

  // Paginate fields
  const paginatedFields = sortedFields.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const totalPages = Math.ceil(sortedFields.length / itemsPerPage);

  return (
    <div className="container-fluid makeup-list-bg py-5">
      <div className="container py-5">
        {/* Filters Section */}
        <div className="row mb-2 align-items-center">
          <SearchAddressComponent onSearch={setAreaFilter} className="col-md-3 mb-2" placeholder="Tìm theo khu vực..." />
          <div className="col-md-3 mb-2">
            <select className="form-select border-pink" value={sizeFilter} onChange={handleSizeFilterChange}>
              <option value="">Chọn loại dịch vụ makeup</option>
              <option value="5">Makeup cô dâu cao cấp</option>
              <option value="7">Makeup dự tiệc / Sự kiện</option>
              <option value="11">Makeup cá nhân / Lookbook</option>
            </select>
          </div>
          <div className="col-md-2 mb-2">
            <button
              className={`btn btn-gradient-pink w-100 ${sortByDistance ? "active" : ""}`}
              onClick={handleSortByDistance}
              disabled={!userLocation}
              style={{ minWidth: 120 }}
            >
              <i className="fas fa-location-arrow me-2"></i>
              {sortByDistance ? "Gần bạn nhất" : "Ưu tiên gần bạn"}
            </button>
          </div>
          <div className="col-md-2 mb-2">
            <button
              className={`btn btn-gradient-pink w-100 ${sortByBookings ? "active" : ""}`}
              onClick={handleSortByBookings}
              style={{ minWidth: 120 }}
            >
              <i className="fas fa-fire me-2"></i>
              Phổ biến nhất
            </button>
          </div>
        </div>

        <div className="row mb-2">
          {/* Fields List */}
          <div className="row g-4">
            {paginatedFields.length === 0 ? (
              <div className="col-12 text-center py-5">
                <i className="fas fa-search fa-3x text-muted mb-3"></i>
                <h5 className="text-muted">Không tìm thấy dịch vụ phù hợp</h5>
                <p>Vui lòng thử lại với bộ lọc khác hoặc khu vực khác.</p>
              </div>
            ) : (
              paginatedFields.map((field) => (
                <BoxFieldComponent
                  key={field._id}
                  field={field}
                  showDistance={sortByDistance && field.distance !== undefined}
                  distance={field.distance}
                  showBookingCount={true}
                  bookingCount={field.bookingCount}
                />
              ))
            )}
          </div>

          {/* Pagination */}
          <div className="d-flex justify-content-center mt-4">
            <button
              className="btn btn-gradient-pink"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              style={{ minWidth: 100 }}
            >
              <i className="fas fa-chevron-left me-2"></i> Trang trước
            </button>
            <span className="mx-3 mt-2 fw-bold text-pink">{`${currentPage} / ${totalPages}`}</span>
            <button
              className="btn btn-gradient-pink"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{ minWidth: 100 }}
            >
              Trang sau <i className="fas fa-chevron-right ms-2"></i>
            </button>
          </div>

          {/* Back to Top Button */}
          <a href="#" className="btn btn-gradient-pink btn-lg-square rounded-circle back-to-top shadow">
            <i className="fas fa-arrow-up"></i>
          </a>
        </div>
      </div>
    </div>
  );
};

export default SanBongModal;
