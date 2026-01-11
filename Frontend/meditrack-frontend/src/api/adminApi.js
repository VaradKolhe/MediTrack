import axios from "axios";
import { adminApiInstance as instance } from "./axiosConfig";

const unwrap = (response) => response?.data?.data ?? [];

export const adminApi = {
  async getHospitals() {
    const res = await instance.get("/admin/hospitals");
    return unwrap(res);
  },
  async createHospital(payload) {
    const res = await instance.post("/admin/hospitals", payload);
    return res?.data?.data;
  },
  async updateHospital(id, payload) {
    const res = await instance.put(`/admin/hospitals/${id}`, payload);
    return res?.data?.data;
  },
  async deleteHospital(id) {
    await instance.delete(`/admin/hospitals/${id}`);
  },
  async getRooms() {
    const res = await instance.get("/admin/rooms");
    return unwrap(res);
  },
  async createRoom(payload) {
    const res = await instance.post("/admin/rooms", payload);
    return res?.data?.data;
  },
  async updateRoom(id, payload) {
    const res = await instance.put(`/admin/rooms/${id}`, payload);
    return res?.data?.data;
  },
  async deleteRoom(id) {
    await instance.delete(`/admin/rooms/${id}`);
  },
  async getReceptionists() {
    const res = await instance.get("/admin/receptionists");
    return unwrap(res);
  },
  async createReceptionist(payload) {
    const res = await instance.post("/admin/receptionists", payload);
    return res?.data?.data;
  },
  async updateReceptionist(id, payload) {
    const res = await instance.put(`/admin/receptionists/${id}`, payload);
    return res?.data?.data;
  },
  async deleteReceptionist(id) {
    await instance.delete(`/admin/receptionists/${id}`);
  },
  async getHospitalReviews(id) {
    const res = await instance.get(`/admin/hospitals/${id}/reviews`);
    return unwrap(res);
  },
  async deleteReview(hospitalId, reviewId) {
    await instance.delete(`/admin/hospitals/${hospitalId}/reviews/${reviewId}`);
  }
};
