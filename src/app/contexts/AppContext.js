"use client";
import SendRequest from "@muahub/utils/SendRequest";
import { createContext, useContext, useEffect, useRef, useState } from "react";

const AppContext = createContext();

export function AppProvider({ children }) {
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);
  const loadingState = useRef(false);

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

        // redirect to login page
        setLoading(false);
        // window.location.href = "/login";
      } else {
        try {
          const res = await SendRequest("GET", "/api/users/me");
          if (res.payload) {
            userPayload = res.payload;
            setLoading(false);
          } else {
            // save current url
            localStorage.setItem("redirectUrl", window.location.pathname);

            // redirect to/login page
            setLoading(false);
            // remove token
            localStorage.removeItem("token");
            window.location.href = "/dang-nhap";
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
  }, []);

  return (
    <AppContext.Provider value={{ currentUser: user, updateUser: setUser, loading }}>{children}</AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
