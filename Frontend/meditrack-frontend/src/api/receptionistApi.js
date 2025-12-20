import { hospitalApiInstance as instance } from "./axiosConfig";

const unwrap = (response) => response?.data?.data ?? [];

export const receptionistApi = {
  async getRooms() {
    const res = await instance.get("/rooms");
    return unwrap(res);
  },

  async createPatient(patientData) {
    const res = await instance.post("/patients/register", patientData);
    return res?.data?.data;
  },

  async getPatientsByRoom(roomId) {
    const res = await instance.get(`/patients/room/${roomId}`);
    return unwrap(res);
  },

  async dischargePatient(patientId) {
    const res = await instance.put(`/rooms/discharge/${patientId}`);
    return res?.data?.data;
  },

  async assignPatientToRoom(patientId, roomId) {
    const res = await instance.post("/rooms/assign", {
      patientId,
      roomId,
    });
    return res?.data?.data;
  },

  async reassignPatient(patientId, newRoomId) {
    const res = await instance.put("/rooms/reassign", {
      patientId,
      newRoomId,
    });
    return res?.data?.data;
  },

  async getAllPatients() {
    const res = await instance.get("/patients");
    return unwrap(res);
  },

  async getHospital()  {
    const res = await instance.get("/hospitals");
    return unwrap(res);
  }

};
