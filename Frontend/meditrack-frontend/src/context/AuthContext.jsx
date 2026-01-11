import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { AuthContext } from "./AuthContextValue";
import { userApiInstance } from "../api/axiosConfig";

// Ensure this matches your backend URL constant
const USER_SERVICE = "http://localhost:8081";

// Helper to decode JWT token
const decodeToken = (token) => {
  try {
    return jwtDecode(token);
  } catch (e) {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(true); // Prevents UI flash
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch {
        localStorage.removeItem("user");
      }
    }
    return null;
  });

  const login = (token, userData) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    console.warn("Session invalid or expired. Logging out.");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/"; // Force return to home/login
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        // No token, definitely not logged in
        setLoading(false);
        return;
      }

      // 1. Check if Token is Expired (Client-side)
      const decoded = decodeToken(token);
      const currentTime = Date.now() / 1000;

      if (!decoded || decoded.exp < currentTime) {
        logout();
        setLoading(false);
        return;
      }

      // 2. Token is valid time-wise. Now ensure User State exists.
      // If we already have 'user' state from the lazy initialization above, we might skip this.
      // However, it is safer to ensure consistency if 'user' is null but 'token' exists.
      if (!user) {
        if (decoded?.hospitalId && decoded?.receptionistId) {
          // RECEPTIONIST LOGIC
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            try {
              setUser(JSON.parse(storedUser));
            } catch (e) {
              logout();
            }
          } else {
            // Valid token but missing user data -> Invalid state
            logout();
          }
        } else {
          // REGULAR USER LOGIC -> Verify with Backend
          try {
            const res = await userApiInstance.get(
              `${USER_SERVICE}/api/users/me`
            );
            setUser(res.data);
            localStorage.setItem("user", JSON.stringify(res.data));
          } catch (error) {
            console.error("Token verification failed with backend:", error);
            logout();
          }
        }
      }

      setLoading(false);
    };

    initializeAuth();
  }, []); // Run only once on mount

  if (loading) {
    // Optional: Render a spinner while checking auth
    return null;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
