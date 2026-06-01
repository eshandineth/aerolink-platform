// Aerolink Platform - Main Application Router
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Booking from './pages/Booking';
import AdminDashboard from './pages/AdminDashboard';

import Profile from './pages/Profile';
import Baggage from './pages/Baggage';

function App() {
  return (
    <Router>
      <nav className="navbar">
        <div className="nav-brand" style={{ fontSize: '1.5rem', fontWeight: '900', letterSpacing: '2px', background: 'linear-gradient(45deg, #fff, var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>AEROLINK</Link>
        </div>
        <div className="nav-links" style={{ display: 'flex', alignItems: 'center' }}>
          <Link to="/" style={{ color: '#fff', textDecoration: 'none', marginRight: '25px', fontWeight: 'bold', fontSize: '1.1rem' }}>Search Flights</Link>
          <Link to="/baggage" style={{ color: '#fff', textDecoration: 'none', marginRight: '25px', fontWeight: 'bold', fontSize: '1.1rem' }}>Track Baggage</Link>
          <Link to="/profile" style={{ color: '#fff', textDecoration: 'none', marginRight: '25px', fontWeight: 'bold', fontSize: '1.1rem' }}>My Trips</Link>
          <Link to="/login" className="btn-primary" style={{ textDecoration: 'none', padding: '10px 25px' }}>Sign In</Link>
        </div>
      </nav>
      <div className="container" style={{ padding: '40px 5%' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/book/:flightId" element={<Booking />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/baggage" element={<Baggage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
