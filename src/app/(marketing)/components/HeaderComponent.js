  "use client";

  import { WEB_NAME } from "@muahub/constants/MainContent";
  import CarouselComponent from "./CarouselComponent";
  import Link from "next/link";
  import { usePathname, useRouter } from "next/navigation";
  import { useEffect, useState, useRef } from "react";
  import { useApp } from "@muahub/app/contexts/AppContext";
  import { ROLE_MANAGER } from "@muahub/constants/System";
  import { Badge, IconButton, Menu, MenuItem, CircularProgress, Typography, Box } from "@mui/material";
  
  const HeaderComponent = () => {
    const pathUrl = usePathname();
    const { currentUser } = useApp();
    const isLoggedIn = currentUser && Object.keys(currentUser).length > 0;
    const [allMakeups, setAllMakeups] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    const [showResults, setShowResults] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(-1);
    
    // Load all makeups once when component mounts
    useEffect(() => {
      const fetchAllMakeups = async () => {
        try {
          const res = await fetch('/api/services');
          const json = await res.json();
          if (json && json.success) {
            setAllMakeups(json.data || []);
          }
        } catch (e) {
          console.error('Failed to load makeups:', e);
        }
      };
      fetchAllMakeups();
    }, []);

    // Notifications state
    const [notifications, setNotifications] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const [loadingNoti, setLoadingNoti] = useState(false);
    const router = useRouter();

    // Fetch notifications from API when user is logged in
    useEffect(() => {
      const fetchNotifications = async () => {
        if (!isLoggedIn) return; // don't fetch for anonymous users
        setLoadingNoti(true);
        try {
          const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
          const userIdParam = currentUser?._id || currentUser?.id || currentUser?.userId;
          let url = '/api/notifications/user';
          if (userIdParam) url += `?userId=${encodeURIComponent(userIdParam)}`;

          const res = await fetch(url, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          });
          const data = await res.json();
          if (data.success) setNotifications(data.data);
        } catch (err) {
          setNotifications([]);
        } finally {
          setLoadingNoti(false);
        }
      };
      fetchNotifications();
    }, [isLoggedIn, currentUser]);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleOpenMenu = (event) => {
      // toggle: if already open, close it; otherwise open with the clicked element
      setAnchorEl((prev) => (prev ? null : event.currentTarget));
    };
    const handleCloseMenu = () => {
      setAnchorEl(null);
    };

    // Mark as read and go to detail
    const handleReadAndGo = async (item) => {
      try {
        await fetch('/api/notifications', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: item._id })
        });
        setNotifications((prev) => prev.map((n) => n._id === item._id ? { ...n, isRead: true } : n));
      } catch (e) {}
      if (item.orderId) {
        router.push(`/danh-sach-dat-lich?orderId=${item.orderId}`);
      } else {
        router.push('/danh-sach-dat-lich');
      }
      setAnchorEl(null);
    };

    useEffect(() => {
      setTimeout(() => {
        try {
          const backToTopButton = document.querySelector(".back-to-top");
          if (backToTopButton) {
            backToTopButton.style.display = "none"; // Ẩn button "back to top"
            window.addEventListener("scroll", function () {
              var navbar = document.querySelector(".navbar");
              if (window.scrollY > 45) {
                navbar.classList.add("sticky-top", "shadow-sm");
              } else {
                navbar.classList.remove("sticky-top", "shadow-sm");
              }
            });

            // Kiểm tra khi người dùng cuộn trang
            window.addEventListener("scroll", function () {
              if (window.scrollY > 300) {
                backToTopButton.style.display = "flex"; // Hiện button "back to top"
              } else {
                backToTopButton.style.display = "none"; // Ẩn button "back to top"
              }
            });
            backToTopButton.addEventListener("click", function (event) {
              event.preventDefault(); // Ngừng hành động mặc định của nút
              window.scrollTo({
                top: 0,
                behavior: "smooth" // Cuộn lên đầu trang với hiệu ứng mượt mà
              });
            });
          }
        } catch (e) {
          console.log(e);
        }
      }, 10);
    }, []);

    useEffect(() => {
      // scroll to top
      window.scrollTo(0, 0);
      // close #navbarCollapse
      const navbarCollapse = document.getElementById("navbarCollapse");
      navbarCollapse.classList.remove("show");
    }, [pathUrl]);

    // Handle clicks outside search results
    useEffect(() => {
      const handleClickOutside = (e) => {
        const resultsBox = document.getElementById("service-search-results");
        const searchInput = document.getElementById("service-search-input");
        if (!resultsBox?.contains(e.target) && e.target !== searchInput) {
          setShowResults(false);
        }
      };
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    // Handle search input changes with local filtering
    const handleSearchChange = (e) => {
      const value = e.target.value;
      setSearchValue(value);
      setShowResults(true);
      setFocusedIndex(-1);
    };

    // Get filtered results
    const getFilteredMakeups = () => {
      if (!searchValue.trim()) return [];
      const searchLower = searchValue.toLowerCase().trim();
      return allMakeups
        .filter(makeup => 
          makeup.serviceName?.toLowerCase().includes(searchLower) ||
          makeup.location?.toLowerCase().includes(searchLower) ||
          makeup.description?.toLowerCase().includes(searchLower)
        )
        .slice(0, 5);
    };

    // Handle keyboard navigation
    const handleSearchKeyDown = (e) => {
      const filtered = getFilteredMakeups();
      
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedIndex(prev => Math.min(prev + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === "Enter" && focusedIndex >= 0) {
        e.preventDefault();
        const selected = filtered[focusedIndex];
        if (selected) {
          router.push(`/dich-vu/${selected._id}`);
        }
      } else if (e.key === "Escape") {
        setShowResults(false);
        setFocusedIndex(-1);
      }
    };

    const logout = () => {
      // Logout
      localStorage.removeItem("token");
      router.push("/");
    };
    // console.log(11111, currentUser);
  // console.log("showResults", showResults);
    return (
      <div className="container-fluid position-relative p-0 header-container">
        <nav className="navbar navbar-expand-lg navbar-light px-4 px-lg-5 py-3 py-lg-0">
          <Link href="/" className="navbar-brand p-0">
            <h1 className="text-primary" style={{ display: "flex", alignItems: "center", gap: 0, margin: 0 }}>
              <img
                src="/img/MuaHubLogoWhite.png"
                alt="MuaHub"
                style={{ height: "50px", objectFit: "contain", mixBlendMode: "darken", backgroundColor: "transparent", marginRight: 0 }}
              />
              <span style={{ color: "#ff5c95ff", marginLeft: "-1px", fontWeight: 700 }}>{WEB_NAME}</span>
            </h1>
          </Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarCollapse">
            <span className="fa fa-bars"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarCollapse">
            {/* Search box for makeup/services */}
            <div className="me-3 position-relative" style={{ minWidth: 260 }}>
              <input
                className="form-control"
                placeholder="Tìm kiếm dịch vụ..."
                value={searchValue}
                onChange={handleSearchChange}
                onKeyDown={handleSearchKeyDown}
                id="service-search-input"
              />
              {showResults && (
                <div 
                  id="service-search-results" 
                  className="list-group position-absolute w-100 shadow-sm" 
                  style={{ zIndex: 1050 }}
                >
                  {getFilteredMakeups().map((makeup, index) => (
                    <Link
                      key={makeup._id}
                      href={`/dich-vu/${makeup._id}`}
                      className={`list-group-item list-group-item-action ${index === focusedIndex ? 'active' : ''}`}
                      onClick={() => setShowResults(false)}
                    >
                      {makeup.serviceName} {makeup.location ? `- ${makeup.location}` : ''}
                    </Link>
                  ))}
                  {getFilteredMakeups().length === 0 && searchValue.trim() && (
                    <div className="list-group-item text-muted">
                      Không tìm thấy kết quả
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="navbar-nav ms-auto py-0">
              <Link href="/" className={`nav-item nav-link ${pathUrl === "/" ? "active" : ""}`}>
                Trang chủ
              </Link>
              <Link href="/gioi-thieu" className={`nav-item nav-link ${pathUrl === "/gioi-thieu" ? "active" : ""}`}>
                Giới thiệu
              </Link>
              <Link href="/dich-vu" className={`nav-item nav-link ${pathUrl === "/dich-vu" ? "active" : ""}`}>
                Danh sách dịch vụ
              </Link>
              {isLoggedIn && (
                <Link href="/yeu-thich" className={`nav-item nav-link ${pathUrl === "/yeu-thich" ? "active" : ""}`}>
                  <span style={{ position: 'relative', display: 'inline-block' }}>
                    Yêu thích
                    <span 
                      className="badge rounded-pill bg-danger"
                      style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        transform: 'translate(50%,-50%)',
                        fontSize: 10,
                        padding: '2px 6px',
                        minWidth: 16,
                        height: 16,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2
                      }}
                    >
                      2
                      <span className="visually-hidden">favorite items</span>
                    </span>
                  </span>
                </Link>
              )}
              <Link href="/lien-he" className={`nav-item nav-link ${pathUrl === "/lien-he" ? "active" : ""}`}>
                Liên hệ
              </Link>
              {/* Thêm icon chuông thông báo cho user với dropdown */}
              {isLoggedIn && (
                <div className="nav-item nav-link position-relative" style={{ cursor: 'pointer' }} onClick={handleOpenMenu}>
                <span style={{ position: 'relative', display: 'inline-block' }}>
                  <i className="fas fa-bell" style={{ fontSize: 18, color: '#fff' }}></i>
                  <span 
                    className="badge rounded-pill bg-danger"
                    style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      transform: 'translate(50%,-50%)',
                      fontSize: 10,
                      padding: '2px 6px',
                      minWidth: 16,
                      height: 16,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 2
                    }}
                  >
                    {unreadCount}
                    <span className="visually-hidden">unread messages</span>
                  </span>
                </span>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleCloseMenu}
                  PaperProps={{ style: { minWidth: 320, maxHeight: 400 } }}
                >
                  <Box px={2} py={1} display="flex" alignItems="center" justifyContent="space-between">
                    <Typography variant="subtitle1">Thông báo</Typography>
                    {loadingNoti && <CircularProgress size={18} />}
                  </Box>
                  {notifications.length === 0 && !loadingNoti && (
                    <MenuItem disabled>Không có thông báo nào</MenuItem>
                  )}
                  {notifications.map((item) => (
                    <MenuItem
                      key={item._id}
                      onClick={() => handleReadAndGo(item)}
                      selected={!item.isRead}
                      sx={{ whiteSpace: 'normal', alignItems: 'flex-start', gap: 1 }}
                    >
                      <Box>
                        <Typography variant="body2" color={item.isRead ? 'text.secondary' : 'text.primary'}>
                          {item.message || 'Thông báo mới'}
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                          {item.created_at ? new Date(item.created_at).toLocaleString() : ''}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Menu>
                </div>
              )}
              {/* <div className="nav-item nav-link position-relative">
                <Link href="/tin-nhan" className="text-decoration-none text-dark">
                  <i className="fas fa-comment" style={{ fontSize: 18 }}></i>
                  <span 
                    className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                    style={{ fontSize: 10 }}
                  >
                    5
                    <span className="visually-hidden">unread messages</span>
                  </span>
                </Link>
              </div> */}
            </div>
            {Object.keys(currentUser).length > 0 ? (
              <div className="dropdown">
                <div
                  className="dropdown-toggle"
                  type="button"
                  id="dropdownMenuButton"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  {currentUser.name}
                  {/* avatar */}
                  {currentUser.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt="avatar"
                      className="rounded-circle ms-2"
                      style={{ width: "30px", height: "30px" }}
                    />
                  ) : (
                    <img
                      src="/img/carousel.jpg"
                      alt="avatar"
                      className="rounded-circle ms-2"
                      style={{ width: "30px", height: "30px" }}
                    />
                  )}
                </div>
                <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                  {currentUser.role === ROLE_MANAGER.ADMIN && (
                    <li>
                      <a href="/admin" className="dropdown-item">
                        Trang quản trị
                      </a>
                    </li>
                  )}
                  {currentUser.role === ROLE_MANAGER.MUA && (
                    <li>
                      <a href="/makeup-artists" className="dropdown-item">
                        Trang quản lý dịch vụ
                      </a>
                    </li>
                  )}
                  <li>
                    <Link href="/trang-ca-nhan" className="dropdown-item">
                      Thông tin cá nhân
                    </Link>
                  </li>
                  <li>
                    <Link href="#" onClick={logout} className="dropdown-item">
                      Đăng xuất
                    </Link>
                  </li>
                </ul>
              </div>
            ) : (
              <Link href="/dang-nhap" className="btn btn-primary rounded-pill py-2 px-4 my-3 my-lg-0 flex-shrink-0">
                Đăng nhập
              </Link>
            )}
          </div>
        </nav>
        <CarouselComponent pathUrl={pathUrl} />
      </div>
    );
  };

  export default HeaderComponent;
