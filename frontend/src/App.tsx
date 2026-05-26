import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Booking from './pages/Booking';

function App() {
  return (
    <Router>
      <nav className="navbar">
        <div className="nav-brand">AeroLink</div>
        <div className="nav-links">
          <Link to="/" style={{ color: '#fff', textDecoration: 'none', marginRight: '20px' }}>Flights</Link>
          <Link to="/login" className="btn-primary" style={{ textDecoration: 'none' }}>Login</Link>
        </div>
      </nav>
      <div className="container" style={{ padding: '40px 5%' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/book/:flightId" element={<Booking />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
