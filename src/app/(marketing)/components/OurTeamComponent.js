import { OUR_TEAM } from "@muahub/constants/MainContent";

const OurTeamComponent = () => {
  return (
    <div className="container-fluid team pb-5" style={{ background: "linear-gradient(180deg, #fff 0%, #fffafc 100%)" }}>
      <div className="container pb-5">
        <div className="text-center mx-auto pb-5 wow fadeInUp" data-wow-delay="0.2s" style={{ maxWidth: "800px" }}>
          <h4 style={{ color: "#ff5c95ff", fontWeight: 600 }}>Nhà phát triển</h4>
          <h1 className="display-5 mb-4">Đội ngũ phát triển của chúng tôi</h1>
          <p className="mb-0">
            Với sự trẻ trung, sáng tạo và nhiệt tình, chúng tôi không ngừng đổi mới và phát triển, cam kết mang đến cho
            khách hàng những sản phẩm và dịch vụ vượt trội.
          </p>
        </div>
        <div className="row g-3 justify-content-center" style={{ marginTop: "32px" }}>
          {OUR_TEAM.map((team) => (
            <div className="col-6 col-lg-4 col-xl-2 d-flex justify-content-center wow fadeInUp" data-wow-delay="0.8s" key={team.id}>
              <div className="team-item card shadow-sm rounded-4 p-3 text-center" style={{ width: "220px", border: 'none' }}>
                <div className="team-img rounded-circle overflow-hidden mx-auto" style={{ width: "140px", height: "140px" }}>
                  <img src={team.img} className="img-fluid" alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div className="team-title" style={{ marginTop: "10px" }}>
                  <h4 className="mb-1" style={{ fontSize: "18px" }}>{team.name}</h4>
                  <p className="mb-1 text-secondary" style={{ fontSize: "14px" }}>{team.profession}</p>
                </div>
                <div className="team-icon mt-2">
                  <a className="btn btn-light btn-sm-square rounded-circle me-2" href={"#"} style={{ background: '#fff' }}>
                    <i className="fab fa-facebook-f" style={{ color: '#ff5c95ff' }}></i>
                  </a>
                  <a className="btn btn-light btn-sm-square rounded-circle me-2" href={"#"} style={{ background: '#fff' }}>
                    <i className="fab fa-tiktok" style={{ color: '#ff5c95ff' }}></i>
                  </a>
                  <a className="btn btn-light btn-sm-square rounded-circle me-2" href={"#"} style={{ background: '#fff' }}>
                    <i className="fab fa-linkedin-in" style={{ color: '#ff5c95ff' }}></i>
                  </a>
                  <a className="btn btn-light btn-sm-square rounded-circle me-0" href={"#"} style={{ background: '#fff' }}>
                    <i className="fab fa-instagram" style={{ color: '#ff5c95ff' }}></i>
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
