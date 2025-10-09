import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "/api";

export const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 10000,
});

export default axiosInstance;
