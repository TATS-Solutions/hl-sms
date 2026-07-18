const STORAGE_KEY = "hl-sms-bookings";

function generateReference() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `HLG-${code}`;
}

export function getAllBookings() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

export function saveBooking(booking) {
  const bookings = getAllBookings();
  const newBooking = {
    ...booking,
    reference: generateReference(),
    status: "upcoming",
    createdAt: new Date().toISOString(),
  };
  bookings.push(newBooking);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
  return newBooking;
}

export function getBookingByReference(reference) {
  return getAllBookings().find((b) => b.reference === reference);
}

export function cancelBooking(reference) {
  const bookings = getAllBookings();
  const updated = bookings.map((b) =>
    b.reference === reference ? { ...b, status: "cancelled" } : b
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}