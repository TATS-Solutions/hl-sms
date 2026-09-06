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

// Department proposes an amount for a variable-fee service (staff, admin).
export const proposeAssessment = (id, payload) =>
  apiClient.post(`/admin/service-requests/${id}/propose-assessment`, payload);

// Treasurer issues the official Order of Payment — {} approves the proposal as-is,
// or pass { items, adjustment_note, penalty_amount } to amend it (treasurer, admin).
export const issueOrderOfPayment = (id, payload = {}) =>
  apiClient.post(`/admin/service-requests/${id}/order-of-payment`, payload);

// Treasurer voids a proposal or an unpaid issued order (treasurer, admin).
export const voidOrderOfPayment = (orderOfPaymentId, payload) =>
  apiClient.post(`/admin/order-of-payments/${orderOfPaymentId}/void`, payload);

// Treasurer records the OR number and settles payment in one step — replaces the
// old propose-fees-then-mark-paid two-call flow (treasurer, admin).
export const confirmPayment = (orderOfPaymentId, payload) =>
  apiClient.post(`/admin/order-of-payments/${orderOfPaymentId}/confirm-payment`, payload);

// The Treasurer's queue — bucket is "issuance" (default), "payment", or "receipts".
export const fetchTreasuryWorklist = (bucket, params = {}) =>
  apiClient.get("/admin/treasury/worklist", { params: { bucket, ...params } });

export const verifyServiceRequestDocument = (documentId, payload) =>
  apiClient.patch(`/admin/service-request-documents/${documentId}/verify`, payload);

// Verifies every outstanding document on a request in one action, or just the ones
// in documentIds when supplied (staff, admin).
export const bulkVerifyDocuments = (id, documentIds) =>
  apiClient.post(`/admin/service-requests/${id}/documents/verify`, documentIds ? { document_ids: documentIds } : {});