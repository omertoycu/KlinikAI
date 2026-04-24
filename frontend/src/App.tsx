import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Admin from "@/pages/Admin";
import HastaGirisi from "@/pages/HastaGirisi";
import HastaDashboard from "@/pages/HastaDashboard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/hasta-girisi" element={<HastaGirisi />} />
        <Route path="/hesabim" element={<HastaDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
