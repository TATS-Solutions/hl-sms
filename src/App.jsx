import { Routes, Route } from "react-router-dom"
import Header from "./components/Header"
import Homepage from "./pages/Homepage"
import ServiceDetail from "./pages/ServiceDetail"

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/services/:id" element={<ServiceDetail />} />
      </Routes>
    </>
  )
}

export default App