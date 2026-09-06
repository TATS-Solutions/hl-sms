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
  // Content-Type must be explicitly cleared (not just omitted) here. apiClient has a
  // default "Content-Type: application/json" — if that's still in effect when axios
  // sees a FormData body, its transformRequest treats the request as JSON and converts
  // the FormData into a plain object (formDataToJSON) before JSON.stringify-ing it,
  // silently destroying the file upload and mangling documents[<id>] into a sparse
  // array. Setting it to null overrides the default so axios sends the FormData as-is,
  // and leaves the header itself unset so the browser can generate the correct
  // "multipart/form-data; boundary=..." value (a hardcoded string here would omit the
  // boundary and be just as unparseable server-side).
  return apiClient.post("/service-requests", formData, {
    headers: { "Content-Type": null },
  });
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
  // See the Content-Type note in submitServiceRequest above — null (not a hardcoded
  // "multipart/form-data" string) is required so the browser fills in the boundary.
  return apiClient.post(`/service-requests/${referenceCode}/payment-receipt`, formData, {
    headers: { "Content-Type": null },
  });
};

// Resident replaces a document a reviewer rejected — only works while that specific
// document's status is "rejected". Same ownership/rate-limit model as lookup().
export const replaceDocument = (referenceCode, documentId, residentPhone, file) => {
  const formData = new FormData();
  formData.append("resident_phone", residentPhone);
  formData.append("document", file);
  // See the Content-Type note in submitServiceRequest above.
  return apiClient.post(`/service-requests/${referenceCode}/documents/${documentId}`, formData, {
    headers: { "Content-Type": null },
  });
};
