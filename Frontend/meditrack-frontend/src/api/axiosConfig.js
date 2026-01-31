import axios from "axios";

const backendDNS = import.meta.env.VITE_BACKEND_DNS || "localhost";
export const HOSPITAL_SERVICE = `http://${backendDNS}/svc/hospital`;
export const USER_SERVICE = `http://${backendDNS}/svc/user`;
export const ADMIN_SERVICE = `http://${backendDNS}/svc/admin`;
console.log(backendDNS);

// Helper to create instances with the same interceptor logic
const createInstance = (url) => {
  const instance = axios.create({ baseURL: url });
  
  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
  
  return instance;
};

// Export specific instances for each service
export const userApiInstance = createInstance(USER_SERVICE);
export const hospitalApiInstance = createInstance(HOSPITAL_SERVICE);
export const adminApiInstance = createInstance(ADMIN_SERVICE);