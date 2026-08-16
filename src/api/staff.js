import apiClient from "./client";

export const loginStaff = (email, password) =>
  apiClient.post("/login", { email, password });

export const logoutStaff = () => apiClient.post("/logout");

export const fetchStaffMe = () => apiClient.get("/staff/me");

export const fetchServiceRequests = (params = {}) =>
  apiClient.get("/admin/service-requests", { params });

export const fetchServiceRequestStats = (params = {}) =>
  apiClient.get("/admin/service-requests/stats", { params });

export const updateServiceRequestStatus = (id, payload) =>
  apiClient.patch(`/admin/service-requests/${id}/status`, payload);

export const assessServiceRequestFees = (id, payload) =>
  apiClient.post(`/admin/service-requests/${id}/assess`, payload);

export const markOrderOfPaymentPaid = (orderOfPaymentId, payload) =>
  apiClient.post(`/admin/order-of-payments/${orderOfPaymentId}/mark-paid`, payload);