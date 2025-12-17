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
};