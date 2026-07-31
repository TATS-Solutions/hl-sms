import apiClient from "./client";

export const submitServiceRequest = (payload) =>
  apiClient.post("/service-requests", payload);

export const lookupServiceRequest = (referenceCode, residentPhone) =>
  apiClient.post("/service-requests/lookup", {
    reference_code: referenceCode,
    resident_phone: residentPhone,
  });

export const fetchServiceAvailability = (serviceId, date) =>
  apiClient.get(`/services/${serviceId}/availability`, { params: { date } });