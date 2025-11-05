"use client";
import SendRequest from "@muahub/utils/SendRequest";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
const AppContext = createContext();

export function AppProvider({ children }) {
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);
  const loadingState = useRef(false);
  const router = useRouter();
  const [authTrigger, setAuthTrigger] = useState(0);
  const { data: session, status } = useSession();

  // Function to force refresh user data
  const refreshUserData = () => {
    setAuthTrigger(prev => prev + 1);
  };


  useEffect(() => {
    // Hàm chuẩn hóa user cho mọi trường hợp
    const normalizeUser = (user1, user2) => {
      // user1: từ backend (local), user2: từ session Google
       console.log("[AppContext] user1.role:", user1?.role, "user2.role:", user2?.role);
      return {
        _id: user1?._id || user2?.id || user2?._id || "",
        id: user1?._id || user2?.id || user2?._id || "",
        email: user1?.email || user2?.email || "",
        name: user1?.name || user2?.name || "",
        avatar: user1?.avatar || user2?.image || "",
        role: user1?.role || user2?.role || "user",
        active: user1?.active ?? user2?.active ?? true,
        phone: user1?.phone || "",
        address: user1?.address || "",
        bank_info: user1?.bank_info || "",
        bank_info_number: user1?.bank_info_number || "",
        bio: user1?.bio || "",
        payment_package: user1?.payment_package || null,
        payment_type: user1?.payment_type || null,
        withdrawn: user1?.withdrawn || 0,
        created_at: user1?.created_at || user2?.created_at || "",
        updated_at: user1?.updated_at || user2?.updated_at || "",
        // Bổ sung các trường cần thiết
        cccd: user1?.cccd || "",
        totalPrice: user1?.totalPrice || 0,
        payment_amount: user1?.payment_amount || 0,
        payment_expiry: user1?.payment_expiry || "",
        payment_history: user1?.payment_history || [],
      };
    };

    if (status === "authenticated" && session?.user) {
      // Nếu đã đăng nhập Google, luôn gọi backend để lấy user chuẩn nếu có token
      const token = localStorage.getItem("token") || "";
      if (!token) {
        // Nếu chưa có token backend, chỉ lấy từ session Google
        setUser(normalizeUser({}, session.user));
        setTimeout(() => setLoading(false), 0); // Đảm bảo setUser xong mới tắt loading
      } else {
        // Nếu có token backend, gọi fetchData để lấy user từ backend
        fetchData();
      }
      return;
    }

    const fetchData = async () => {
      loadingState.current = true;
      setLoading(true);
      const token = localStorage.getItem("token") || "";
      let userPayload = {};

      if (!token) {
        setUser({});
        // save current url
        localStorage.setItem("redirectUrl", window.location.pathname);
        setTimeout(() => setLoading(false), 0);
      } else {
        try {
          console.log("Fetching user data with token:", token);
          const res = await SendRequest("GET", "/api/users/me");
          if (res.payload) {
            userPayload = res.payload;
          } else {
            // save current url
            localStorage.setItem("redirectUrl", window.location.pathname);
            // remove token
            localStorage.removeItem("token");
            router.push("/dang-nhap");
          }
        } catch (error) {
          console.error("Error during fetching user data:", error);
        }
        // Luôn merge xong mới tắt loading
        setUser(normalizeUser(userPayload, session?.user));
        setTimeout(() => setLoading(false), 0);
      }
      loadingState.current = false;
    };
    if (!loadingState.current) {
      fetchData();
    }
  }, [authTrigger, session, status]);

  return (
    <AppContext.Provider value={{ currentUser: user, updateUser: setUser, loading, refreshUserData }}>{children}</AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
