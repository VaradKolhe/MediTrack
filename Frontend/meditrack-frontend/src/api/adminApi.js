import axios from "axios";
import { ADMIN_SERVICE } from "./axiosConfig";

const adminClient = axios.create({
  baseURL: ADMIN_SERVICE,
});

adminClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const unwrap = (response) => response?.data?.data ?? [];

export const adminApi = {
  async getHospitals() {
    const res = await adminClient.get("/admin/hospitals");
    return unwrap(res);
  },
  async createHospital(payload) {
    const res = await adminClient.post("/admin/hospitals", payload);
    return res?.data?.data;
  },
  async updateHospital(id, payload) {
    const res = await adminClient.put(`/admin/hospitals/${id}`, payload);
    return res?.data?.data;
  },
  async deleteHospital(id) {
    await adminClient.delete(`/admin/hospitals/${id}`);
  },
  async getRooms() {
    const res = await adminClient.get("/admin/rooms");
    return unwrap(res);
  },
  async createRoom(payload) {
    const res = await adminClient.post("/admin/rooms", payload);
    return res?.data?.data;
  },
  async updateRoom(id, payload) {
    const res = await adminClient.put(`/admin/rooms/${id}`, payload);
    return res?.data?.data;
  },
  async deleteRoom(id) {
    await adminClient.delete(`/admin/rooms/${id}`);
  },
  async getReceptionists() {
    const res = await adminClient.get("/admin/receptionists");
    return unwrap(res);
  },
  async createReceptionist(payload) {  
    const res = await adminClient.post("/admin/receptionists", payload);
    return res?.data?.data;
  },
  async updateReceptionist(id, payload) {
    const res = await adminClient.put(`/admin/receptionists/${id}`, payload);
    return res?.data?.data;
  },
  async deleteReceptionist(id) {
    await adminClient.delete(`/admin/receptionists/${id}`);
  },
};
