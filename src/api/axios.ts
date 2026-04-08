import axios from "axios";

const BASE_URL = "https://rental-management-backend-zwzi.onrender.com/api";

const API = axios.create({
  baseURL: BASE_URL,
});

API.interceptors.request.use(
  (req) => {
    const token = localStorage.getItem("token");

    if (token) {
      req.headers.Authorization = `Bearer ${token}`;
    }

    return req;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;