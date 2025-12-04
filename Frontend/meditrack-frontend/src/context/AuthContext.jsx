import { useState, useEffect } from "react";
import { AuthContext } from "./AuthContextValue";
import instance, { USER_SERVICE } from "../api/axiosConfig";

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
    if (token && !user) {
      instance
        .get(`${USER_SERVICE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
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
