import axios from "axios";

const api = axios.create({
  baseURL: "/api", // backend port
  withCredentials: true, // ถ้าใช้ cookie auth
});

export default api;
