import axios from "axios";

const API = axios.create({
  baseURL: "https://rental-management-backend-zwzi.onrender.com/api",
});

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: "tenant" | "landlord";
}

export const registerUser = async (data: RegisterPayload) => {
  const response = await API.post("/auth/register", data);
  return response.data;
};

export interface Loginpayload {
  email: string;
  password: string;
} 

export const loginUser = async (email: string, password: string) => {
  const response = await API.post("/auth/login", { email, password });
  return response.data;
}