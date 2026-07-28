import { loginStaff, logoutStaff, fetchStaffMe } from "../api/staff";

const TOKEN_KEY = "hl-sms-staff-token";
const USER_KEY = "hl-sms-staff-user";

export async function staffLogin(email, password) {
  const response = await loginStaff(email, password);
  localStorage.setItem(TOKEN_KEY, response.data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
  return response.data.user;
}

export async function staffLogout() {
  try {
    await logoutStaff();
  } catch {
    // even if the server call fails, clear local state so the UI logs out
  }
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isStaffAuthenticated() {
  return !!localStorage.getItem(TOKEN_KEY);
}

export function getStoredStaffUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
}

export async function verifyStaffSession() {
  const response = await fetchStaffMe();
  localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
  return response.data.user;
}