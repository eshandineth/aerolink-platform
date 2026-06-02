// Aerolink Platform - Main Application Router
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Booking from './pages/Booking';
import AdminDashboard from './pages/AdminDashboard';

import Profile from './pages/Profile';
import Baggage from './pages/Baggage';

// Protected Route Wrapper
const ProtectedRoute = ({ children, requiredRole }: { children: any, requiredRole?: string }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) {
    return <Navigate to="/login" replace />;
  }
  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  const isAuthenticated = !!localStorage.getItem('token');
  const role = localStorage.getItem('role');

  return (
    <Router>
      <nav className="navbar">
        <div className="nav-brand" style={{ fontSize: '1.5rem', fontWeight: '900', letterSpacing: '2px', background: 'linear-gradient(45deg, #fff, var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>AEROLINK</Link>
        </div>
        <div className="nav-links" style={{ display: 'flex', alignItems: 'center' }}>
          <Link to="/" style={{ color: '#fff', textDecoration: 'none', marginRight: '25px', fontWeight: 'bold', fontSize: '1.1rem' }}>Search Flights</Link>
          <Link to="/baggage" style={{ color: '#fff', textDecoration: 'none', marginRight: '25px', fontWeight: 'bold', fontSize: '1.1rem' }}>Track Baggage</Link>
          
          {isAuthenticated && (
            <Link to="/profile" style={{ color: '#fff', textDecoration: 'none', marginRight: '25px', fontWeight: 'bold', fontSize: '1.1rem' }}>My Trips</Link>
          )}
          
          {role === 'admin' && (
            <Link to="/admin" style={{ color: 'var(--accent)', textDecoration: 'none', marginRight: '25px', fontWeight: 'bold', fontSize: '1.1rem' }}>Admin Panel</Link>
          )}

          {!isAuthenticated ? (
            <Link to="/login" className="btn-primary" style={{ textDecoration: 'none', padding: '10px 25px' }}>Sign In</Link>
          ) : (
            <button className="btn-primary" onClick={() => { localStorage.clear(); window.location.href = '/'; }} style={{ padding: '10px 25px', background: 'rgba(255, 51, 102, 0.2)', border: '1px solid var(--danger)' }}>Logout</button>
          )}
        </div>
      </nav>
      <div className="container" style={{ padding: '40px 5%' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/baggage" element={<Baggage />} />
          
          {/* Protected Routes */}
          <Route path="/book/:flightId" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          
          {/* Admin Protected Route */}
          <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
