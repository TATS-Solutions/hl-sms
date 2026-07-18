import { Routes, Route } from "react-router-dom"
import Header from "./components/Header"
import Homepage from "./pages/Homepage"
import ServiceDetail from "./pages/ServiceDetail"
import BookingFlow from "./pages/BookingFlow"
import ClaimTicket from "./pages/ClaimTicket"

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/services/:id" element={<ServiceDetail />} />
        <Route path="/book/:serviceId" element={<BookingFlow />} />
        <Route path="/ticket/:reference" element={<ClaimTicket />} />
      </Routes>
    </>
  )
}

export default App