import apiClient from "./client";

export const submitServiceRequest = (payload, requirementFiles = {}) => {
  const fileEntries = Object.entries(requirementFiles).filter(([, file]) => file);
  if (fileEntries.length === 0) {
    return apiClient.post("/service-requests", payload);
  }
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === null || value === undefined) return;
    formData.append(key, typeof value === "object" ? JSON.stringify(value) : value);
  });
  fileEntries.forEach(([requirementId, file]) => {
    formData.append(`documents[${requirementId}]`, file);
  });
  // Do NOT set Content-Type manually here: axios's xhr adapter passes an explicit
  // header straight to XMLHttpRequest.setRequestHeader() without a boundary param,
  // and the browser will not append one once the header is already set, so the
  // multipart body would be silently unparseable server-side. Leaving it unset lets
  // axios/the browser generate "multipart/form-data; boundary=..." automatically.
  return apiClient.post("/service-requests", formData);
};

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
