import apiClient from "./client";

export const fetchServices = (params = {}) =>
  apiClient.get("/services", { params });

export const fetchServiceBySlug = (slug) =>
  apiClient.get(`/services/${slug}`);