import axios from "axios";

export const USER_SERVICE = "http://localhost:8082";
export const HOSPITAL_SERVICE = "http://localhost:8081";
export const ADMIN_SERVICE = "http://localhost:8083";

const instance = axios.create({
  baseURL: HOSPITAL_SERVICE,
});

// Add token from AuthContext
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;