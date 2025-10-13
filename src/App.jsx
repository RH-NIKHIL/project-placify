import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

import Header from "./components/header";
import Hero from "./components/Hero";
import SignIn from "./components/signin";
import SignUp from "./components/signup";
import Features from "./components/features";
import AboutUs from "./components/aboutus";
import Contact from "./components/contact";
import AdminDashboard from "./components/dashboards/AdminDashboard";
import UserDashboard from "./components/dashboards/UserDashboard";
import CompanyDashboard from "./components/dashboards/CompanyDashboard";

function AppContent() {
  const location = useLocation();
  
  // Hide header and background elements on dashboard pages
  const isDashboard = location.pathname.includes("-dashboard");

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  return (
    <main>
      {/* Gradient image - hide on dashboard */}
      {!isDashboard && (
        <img
          className="absolute top-0 right-0 opacity-60 -z-1"
          src="/gradient.png"
          alt="Gradient-img"
        />
      )}

      {/* Blur Effect - hide on dashboard */}
      {!isDashboard && (
        <div className="h-0 w-[40rem] absolute top-[20%] right-[-5%] shadow-[0_0_900px_20px_#e99b63] -rotate-[30deg] -z-10"></div>
      )}

      {/* Header - hide on dashboard */}
      {!isDashboard && <Header />}

      {/* Routes */}
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/features" element={<Features />} />
        <Route path="/aboutus" element={<AboutUs />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path="/company-dashboard" element={<CompanyDashboard />} />
      </Routes>
    </main>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
