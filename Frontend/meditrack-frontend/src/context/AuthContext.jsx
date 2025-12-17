import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { AuthContext } from "./AuthContextValue";
import { userApiInstance } from "../api/axiosConfig";

// Helper to decode JWT token
const decodeToken = (token) => {
  try {
    return jwtDecode(token);
  } catch (e) {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
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

  // On mount, fetch user if token exists but user is missing
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && !user) {
      const decoded = decodeToken(token);
      if (decoded?.hospitalId && decoded?.receptionistId) {
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            setUser(userData);
          } catch (e) {
            console.error("Failed to parse stored user data", e);
            localStorage.removeItem("user");
            localStorage.removeItem("token");
          }
        } else {
          // No stored user data - can't fetch from userservice with hospital token
          console.warn("Receptionist token found but no user data in storage");
        }
      } else {
        // Regular user token - fetch from userservice
        userApiInstance
          .get(`${USER_SERVICE}/api/users/me`)
          .then((res) => {
            setUser(res.data);
            localStorage.setItem("user", JSON.stringify(res.data));
          })
          .catch(() => {
            // Invalid token, remove
            localStorage.removeItem("token");
            setUser(null);
          });
      }
    }
  }, [user]);

  const login = (token, userData) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
