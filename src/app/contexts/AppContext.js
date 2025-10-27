"use client";
import SendRequest from "@muahub/utils/SendRequest";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
const AppContext = createContext();

export function AppProvider({ children }) {
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);
  const loadingState = useRef(false);
  const router = useRouter();
  // Add authTrigger state to force re-fetch
  const [authTrigger, setAuthTrigger] = useState(0);

  // Function to force refresh user data
  const refreshUserData = () => {
    setAuthTrigger(prev => prev + 1);
  };

  useEffect(() => {
    const fetchData = async () => {
      loadingState.current = true;
      setLoading(true);
      const token = localStorage.getItem("token") || "";
      let userPayload = {};

      if (!token) {
        setUser({});
        // save current url
        localStorage.setItem("redirectUrl", window.location.pathname);
        setLoading(false);
      } else {
        try {
          const res = await SendRequest("GET", "/api/users/me");
          if (res.payload) {
            userPayload = res.payload;
            setLoading(false);
          } else {
            // save current url
            localStorage.setItem("redirectUrl", window.location.pathname);
            setLoading(false);
            // remove token
            localStorage.removeItem("token");
            router.push("/dang-nhap");
          }
        } catch (error) {
          console.error("Error during fetching user data:", error);
          setLoading(false);
        }
      }
      setUser(userPayload);
      loadingState.current = false;
    };
    if (!loadingState.current) {
      fetchData();
    }
  }, [authTrigger]); // Add authTrigger to dependencies

  return (
    <AppContext.Provider value={{ currentUser: user, updateUser: setUser, loading, refreshUserData }}>{children}</AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
