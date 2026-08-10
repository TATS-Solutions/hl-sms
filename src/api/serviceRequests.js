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

export const uploadPaymentReceipt = (referenceCode, residentPhone, file) => {
  const formData = new FormData();
  formData.append("resident_phone", residentPhone);
  formData.append("receipt", file);
  return apiClient.post(`/service-requests/${referenceCode}/payment-receipt`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};