import { userApiInstance as instance } from "./axiosConfig";

export const userApi = {
  async getUserDetails(userId) {
    const res = await instance.get(`/api/users/${userId}`);
    return res?.data?.data;
  },

  async updateUserDetails(userId, payload) {
    const res = await instance.put(`/api/users/${userId}`, payload);
    return res?.data?.data;
  },

  async login(credentials) {
    // credentials: { username, password }
    const res = await instance.post("/api/auth/login", credentials);
    return res?.data;
  },

  async register(userData) {
    // userData: { username, email, password, firstName, lastName }
    const res = await instance.post("/api/auth/register", userData);
    return res?.data;
  },

  async verify(verificationData) {
    // verificationData: { email, verificationCode }
    const res = await instance.post("/api/auth/verify", verificationData);
    return res?.data;
  },
  
  async getMe() {
    const res = await instance.get("/api/auth/me");
    return res?.data;
  }
};