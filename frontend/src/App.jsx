import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Donate from "./pages/Donate";
import Services from "./pages/Services";
import Contact from "./pages/Contact";

// NOTE: swap `isAdmin={false}` on <Services /> for your teammate's real
// auth check (e.g. `isAdmin={user?.role === "admin"}`) once auth is wired up.

export default function App() {
  return (
    <BrowserRouter>
      <nav className="flex gap-6 px-6 py-4 bg-temple-maroon text-temple-ivory font-body">
        <Link to="/donate">Donate</Link>
        <Link to="/services">Services</Link>
        <Link to="/contact">Contact</Link>
      </nav>
      <Routes>
        <Route path="/donate" element={<Donate />} />
        <Route path="/services" element={<Services isAdmin={false} />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </BrowserRouter>
  );
}
