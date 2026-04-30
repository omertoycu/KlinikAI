import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Admin from "@/pages/Admin";
import Asistan from "@/pages/Asistan";
import HastaGirisi from "@/pages/HastaGirisi";
import HastaDashboard from "@/pages/HastaDashboard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/asistan" element={<Asistan />} />
        <Route path="/hasta-girisi" element={<HastaGirisi />} />
        <Route path="/hesabim" element={<HastaDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
