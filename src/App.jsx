import { Routes, Route, useLocation } from "react-router-dom"
import Header from "./components/Header"
import Homepage from "./pages/Homepage"
import ServiceDetail from "./pages/ServiceDetail"
import BookingFlow from "./pages/BookingFlow"
import ClaimTicket from "./pages/ClaimTicket"
import MyBookings from "./pages/MyBookings"
import StaffLogin from "./pages/StaffLogin"
import StaffDashboard from "./pages/StaffDashboard"
import ApiCheck from "./pages/ApiCheck"

function App() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <>
      <Header />
      <div className={isHome ? "" : "pt-16"}>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/services/:id" element={<ServiceDetail />} />
          <Route path="/book/:serviceId" element={<BookingFlow />} />
          <Route path="/ticket/:reference" element={<ClaimTicket />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/staff/login" element={<StaffLogin />} />
          <Route path="/staff/dashboard" element={<StaffDashboard />} />
          <Route path="/api-check" element={<ApiCheck />} />
        </Routes>
      </div>
    </>
  )
}

export default App