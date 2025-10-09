import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "https://ai-crypto-advisor.onrender.com",
  withCredentials: true,
  timeout: 10000,
});

export default axiosInstance;
