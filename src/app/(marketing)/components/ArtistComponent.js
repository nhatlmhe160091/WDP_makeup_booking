"use client";
import Link from "next/link";
import "@muahub/styles/makeup-artist-enhancements.css";

const ArtistComponent = ({ artist }) => {
    //console.log("Rendering ArtistComponent for artist:", artist);
    // Component hình ảnh hoặc placeholder
    const ImageOrPlaceholder = () => {
        const imageUrl = artist.avatar || artist.portfolio?.[0]?.image;

        if (imageUrl && imageUrl !== "/imges") {
            return (
                <img
                    src={imageUrl}
                    alt={artist.name}
                    className="card-img-top img-fluid"
                    style={{ height: "250px", objectFit: "cover" }}
                    onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                    }}
                />
            );
        }

        return (
            <div
                className="default-makeup-image card-img-top d-flex align-items-center justify-content-center"
                style={{ height: "250px", backgroundColor: "#f8f9fa" }}
            >
                <i className="fas fa-user-circle fa-4x text-muted"></i>
            </div>
        );
    };

    // Format kinh nghiệm làm việc thành text thân thiện
    const formatExperience = () => {
        const years = artist.experienceYears || 0;
        const months = artist.experienceMonths || 0;
        
        if (years === 0 && months === 0) return "Mới bắt đầu";
        
        let experience = [];
        if (years > 0) {
            experience.push(`${years} năm`);
        }
        if (months > 0) {
            experience.push(`${months} tháng`);
        }
        
        return `${experience.join(" ")} kinh nghiệm`;
    };

    // Tính rating dựa trên kinh nghiệm nếu không có rating
    const getDisplayRating = () => {
        if (artist.rating) return artist.rating;
        const years = artist.experienceYears || 0;
        if (years >= 10) return "5.0";
        if (years >= 5) return "4.8";
        if (years >= 2) return "4.5";
        return "4.2";
    };

    return (
        <div className="col-lg-4 col-md-6">
            <div className="card h-100 makeup-artist-card shadow-sm">
                <div className="position-relative">
                    <ImageOrPlaceholder />
                    <div className="position-absolute top-0 end-0 p-2">
                        <span className="badge bg-primary">
                            <i className="fas fa-star me-1"></i>
                            {getDisplayRating()}
                        </span>
                    </div>
                </div>

                <div className="card-body d-flex flex-column">
                    <Link href={`/makeup-artists/${artist._id}`} className="text-decoration-none">
                        <h5 className="card-title mb-3" style={{ color: "#ff5c95ff", fontWeight: "600" }}>
                            {artist.name}
                        </h5>
                    </Link>

                    {/* Thông tin liên hệ */}
                    <div className="contact-info mb-3">
                        <p className="card-text text-muted mb-1 small">
                            <i className="fas fa-briefcase me-1"></i>
                            {formatExperience()}
                        </p>
                        <p className="card-text text-muted mb-1 small">
                            <i className="fas fa-map-marker-alt me-1"></i>
                            {artist.address}
                        </p>
                        <p className="card-text text-muted mb-1 small">
                            <i className="fas fa-phone me-1"></i>
                            {artist.phone}
                        </p>
                        <p className="card-text text-muted mb-1 small">
                            <i className="fas fa-envelope me-1"></i>
                            {artist.email}
                        </p>
                    </div>

                    {/* Bio */}
                    {artist.bio && (
                        <p className="card-text text-muted small mb-3">
                            <i className="fas fa-quote-left me-1"></i>
                            {artist.bio}
                        </p>
                    )}

                    {/* Thời gian làm việc */}
                    {artist.workingHours && (
                        <p className="card-text small mb-3">
                            <i className="fas fa-clock me-1"></i>
                            <strong>Thời gian làm việc:</strong> {artist.workingHours}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ArtistComponent;