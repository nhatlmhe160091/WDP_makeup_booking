import { OUR_TEAM } from "@quanlysanbong/constants/MainContent";

const OurTeamComponent = () => {
  return (
    <div className="container-fluid team pb-5">
      <div className="container pb-5">
        <div className="text-center mx-auto pb-5 wow fadeInUp" data-wow-delay="0.2s" style={{ maxWidth: "800px" }}>
          <h4 className="text-primary">Nhà phát triển</h4>
          <h1 className="display-5 mb-4">Đội ngũ phát triển của chúng tôi</h1>
          <p className="mb-0">
            Với sự trẻ trung, sáng tạo và nhiệt tình, chúng tôi không ngừng đổi mới và phát triển, cam kết mang đến cho
            khách hàng những sản phẩm và dịch vụ vượt trội.
          </p>
        </div>
        <div className="row g-3 justify-content-center" style={{ marginTop: "32px" }}>
          {OUR_TEAM.map((team) => (
            <div className="col-6 col-lg-4 col-xl-2 d-flex justify-content-center wow fadeInUp" data-wow-delay="0.8s" key={team.id}>
              <div className="team-item" style={{ padding: "8px", width: "220px" }}>
                <div className="team-img" style={{ width: "140px", height: "140px", margin: "0 auto" }}>
                  <img src={team.img} className="img-fluid" alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div className="team-title" style={{ marginTop: "2px" }}>
                  <h4 className="mb-1" style={{ fontSize: "18px" }}>{team.name}</h4>
                  <p className="mb-1" style={{ fontSize: "14px" }}>{team.profession}</p>
                </div>
                <div className="team-icon">
                  <a className="btn btn-primary btn-sm-square rounded-circle me-3" href={"#"}>
                    <i className="fab fa-facebook-f"></i>
                  </a>
                  <a className="btn btn-primary btn-sm-square rounded-circle me-3" href={"#"}>
                    <i className="fab fa-tiktok"></i>
                  </a>
                  <a className="btn btn-primary btn-sm-square rounded-circle me-3" href={"#"}>
                    <i className="fab fa-linkedin-in"></i>
                  </a>
                  <a className="btn btn-primary btn-sm-square rounded-circle me-0" href={"#"}>
                    <i className="fab fa-instagram"></i>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OurTeamComponent;
