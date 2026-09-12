import React from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';
import DevotionalBackground from './components/DevotionalBackground';
import Home from './components/Home';

// Dedicated Page Views
import About from './components/pages/About';
import Timings from './components/pages/Timings';
import Services from './components/pages/Services';
import Annadaan from './components/pages/Annadaan';
import Gaushala from './components/pages/Gaushala';
import Events from './components/pages/Events';
import Prasadam from './components/pages/Prasadam';
import Gallery from './components/pages/Gallery';
import Donate from './components/pages/Donate';
import Contact from './components/pages/Contact';
import SearchPage from './components/pages/SearchPage';
import Login from './components/pages/Login';
import Signup from './components/pages/Signup';
import Profile from './components/pages/Profile';
import Dashboard from './components/pages/Dashboard';

import './admin.css';

export function App() {
  const loc = useLocation();
  const isAdmin = loc.pathname.startsWith('/admin') && loc.pathname !== '/admin/login';

  return (
    <>
      {/* Ambient Devotional Particle Layer (Lotus Petals & Light Motes) */}
      <DevotionalBackground />

      {!isAdmin && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/timings" element={<Timings />} />
        <Route path="/services" element={<Services />} />
        <Route path="/annadaan" element={<Annadaan />} />
        <Route path="/gaushala" element={<Gaushala />} />
        <Route path="/events" element={<Events />} />
        <Route path="/prasadam" element={<Prasadam />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/donate" element={<Donate />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/search" element={<SearchPage />} />

        {/* Devotee & Admin Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin" element={<Dashboard />} />
      </Routes>

      {!isAdmin && (
        <>
          <Footer />
          <Chatbot />
        </>
      )}
    </>
  );
}

export default App;
