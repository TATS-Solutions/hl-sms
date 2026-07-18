const AUTH_KEY = "hl-sms-staff-auth";
const STAFF_EMAIL = "staff@hilongos.gov.ph";
const STAFF_PASSWORD = "staff2026";

export function staffLogin(email, password) {
    if (email.trim().toLowerCase() === STAFF_EMAIL && password === STAFF_PASSWORD) {
        localStorage.setItem(AUTH_KEY, "true");
        return true;
    }
    return false;
}

export function staffLogout() {
    localStorage.removeItem(AUTH_KEY);
}

export function isStaffAuthenticated() {
    return localStorage.getItem(AUTH_KEY) === "true";
}