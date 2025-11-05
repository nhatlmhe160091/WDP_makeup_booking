  "use client";

  import { WEB_NAME } from "@muahub/constants/MainContent";
  import CarouselComponent from "./CarouselComponent";
  import Link from "next/link";
  import { usePathname, useRouter } from "next/navigation";
  import { useEffect, useState, useRef } from "react";
  import { useApp } from "@muahub/app/contexts/AppContext";
  import { ROLE_MANAGER } from "@muahub/constants/System";
  import { useSession, signOut } from "next-auth/react";
  import {Menu, MenuItem, CircularProgress, Typography, Box } from "@mui/material";
  
  const HeaderComponent = () => {
  // Favorite count from localStorage
  const [favoriteCount, setFavoriteCount] = useState(0);

  // Update favorite count from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const favs = JSON.parse(localStorage.getItem("favoriteServices") || "[]");
      setFavoriteCount(favs.length);
    }
    // Listen to storage event for cross-tab sync
    const handleStorage = (e) => {
      if (e.key === "favoriteServices") {
        const favs = JSON.parse(e.newValue || "[]");
        setFavoriteCount(favs.length);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);
    const pathUrl = usePathname();
    const { currentUser, refreshUserData } = useApp();
    const { data: session } = useSession();
    // Consider user logged in only if session.user exists OR currentUser has a valid id or email
    const isLocalUserValid = currentUser && (currentUser.id || currentUser._id || currentUser.email);
    const isLoggedIn = !!(session?.user || isLocalUserValid);
    // Debug log
    console.log("HeaderComponent - isLoggedIn:", isLoggedIn, "session:", session, "currentUser:", currentUser);
    // Log user session info when logged in (Google hoặc thường)
    useEffect(() => {
      if (isLoggedIn) {
        if (session?.user) {
          console.log('[Header] User session (Google/next-auth):', session.user);
        } else if (currentUser && Object.keys(currentUser).length > 0) {
          console.log('[Header] User session (local):', currentUser);
        }
      }
    }, [isLoggedIn, session, currentUser]);
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
    // Hàm fetch thông báo
    const fetchNotifications = async () => {
      if (!isLoggedIn) return;
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

    // Polling: tự động cập nhật thông báo mỗi 30 giây, dừng khi menu đang mở
    useEffect(() => {
      fetchNotifications();
      const interval = setInterval(() => {
        if (!anchorEl) fetchNotifications();
      }, 30000); // 30 giây
      return () => clearInterval(interval);
    }, [isLoggedIn, currentUser, anchorEl]);

    // Refetch notifications when user just logged in (isLoggedIn chuyển từ false sang true)
    const prevIsLoggedIn = useRef(isLoggedIn);
    useEffect(() => {
      if (!prevIsLoggedIn.current && isLoggedIn) {
        // User vừa đăng nhập, fetch lại notifications
        const fetchNotifications = async () => {
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
      }
      prevIsLoggedIn.current = isLoggedIn;
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
        router.push(`/trang-ca-nhan?orderId=${item.orderId}`);
      } else {
        router.push('/');
      }
      setAnchorEl(null);
    };

    useEffect(() => {
      let timeoutId;
      let scrollHandler;
      let backToTopClickHandler;

      timeoutId = setTimeout(() => {
        try {
          const backToTopButton = document.querySelector(".back-to-top");
          const navbar = document.querySelector(".navbar");

          if (backToTopButton) {
            backToTopButton.style.display = "none";

            // Xử lý scroll cho navbar và back-to-top button
            scrollHandler = function() {
              if (navbar) {
                if (window.scrollY > 45) {
                  navbar.classList.add("sticky-top", "shadow-sm");
                } else {
                  navbar.classList.remove("sticky-top", "shadow-sm");
                }
              }

              if (backToTopButton) {
                backToTopButton.style.display = window.scrollY > 300 ? "flex" : "none";
              }
            };

            // Xử lý click cho back-to-top button
            backToTopClickHandler = function(event) {
              event.preventDefault();
              window.scrollTo({
                top: 0,
                behavior: "smooth"
              });
            };

            window.addEventListener("scroll", scrollHandler);
            backToTopButton.addEventListener("click", backToTopClickHandler);
          }
        } catch (e) {
          console.log(e);
        }
      }, 10);

      // Cleanup function
      return () => {
        clearTimeout(timeoutId);
        if (scrollHandler) {
          window.removeEventListener("scroll", scrollHandler);
        }
        const backToTopButton = document.querySelector(".back-to-top");
        if (backToTopButton && backToTopClickHandler) {
          backToTopButton.removeEventListener("click", backToTopClickHandler);
        }
      };
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

    const logout = async () => {
      try {
        // Xóa token trước
       localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("redirectUrl");
      localStorage.removeItem("nextauth.message");
        
        // Đăng xuất Google nếu đang dùng session
        if (session) {
          await signOut({ redirect: false });
        }

        // Đợi refresh user data hoàn tất
        await refreshUserData();

        // Sau khi mọi thứ hoàn tất mới chuyển trang
        router.push("/");
      } catch (error) {
        console.error("Logout error:", error);
        // Vẫn refresh user data và chuyển trang ngay cả khi có lỗi
        await refreshUserData();
        router.push("/");
      }
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
                      {favoriteCount}
                      <span className="visually-hidden">favorite items</span>
                    </span>
                  </span>
                </Link>
              )}
              {/* Blog bài viết */}
              <Link href="/blog" className={`nav-item nav-link ${pathUrl === "/blog" ? "active" : ""}`}>
                Bài viết
              </Link>
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
                  PaperProps={{
                    sx: { width: 350, maxHeight: 400, p: 0, mt: 1.5, overflowY: "auto" },
                  }}
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
            {isLoggedIn ? (
              <div className="dropdown">
                <div
                  className="dropdown-toggle"
                  type="button"
                  id="dropdownMenuButton"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  {session?.user?.name || currentUser.name}
                  {/* avatar */}
                  {session?.user?.image || currentUser.avatar ? (
                    <img
                      src={session?.user?.image || currentUser.avatar}
                      alt="avatar"
                      className="rounded-circle ms-2"
                      style={{ width: "30px", height: "30px" }}
                      referrerPolicy="no-referrer"
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
                  {(session?.user?.role === ROLE_MANAGER.ADMIN || currentUser.role === ROLE_MANAGER.ADMIN) && (
                    <li>
                      <a href="/admin" className="dropdown-item">
                        Trang quản trị
                      </a>
                    </li>
                  )}
                  {(session?.user?.role === ROLE_MANAGER.MUA || currentUser.role === ROLE_MANAGER.MUA) && (
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
