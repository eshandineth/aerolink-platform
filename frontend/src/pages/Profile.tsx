import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

export default function Profile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [user, setUser] = useState({ name: 'Loading...', memberSince: '2026', id: '' });
  const [bookings, setBookings] = useState<any[]>([]);
  
  // Check-in modal state
  const [checkInModal, setCheckInModal] = useState<string | null>(null);
  const [passport, setPassport] = useState({ passportNumber: '', nationality: '', dateOfBirth: '' });
  const [checkInError, setCheckInError] = useState('');
  const [checkInLoading, setCheckInLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/login');
      
      const decoded: any = jwtDecode(token);
      setUser({ name: decoded.name || decoded.userId || 'Passenger', memberSince: '2026', id: decoded.userId });

      try {
        const res = await axios.get(`${API_URL}/bookings/user/${decoded.userId}`);
        setBookings(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to load bookings");
        setBookings([]);
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleCheckIn = async () => {
    if (!passport.passportNumber || !passport.nationality || !passport.dateOfBirth) {
      setCheckInError('All fields are required.');
      return;
    }
    setCheckInLoading(true);
    setCheckInError('');
    try {
      await axios.patch(`${API_URL}/bookings/${checkInModal}/checkin`, passport);
      alert('✅ Check-in successful! Your boarding pass is ready.');
      setCheckInModal(null);
      setPassport({ passportNumber: '', nationality: '', dateOfBirth: '' });
      window.location.reload();
    } catch (err: any) {
      setCheckInError(err.response?.data?.error || 'Check-in failed. Please try again.');
    }
    setCheckInLoading(false);
  };

  const getStatusBadge = (status: string) => {
    const styles: any = {
      CONFIRMED: { bg: 'rgba(0,255,157,0.15)', color: 'var(--success)', label: '✅ Confirmed' },
      PENDING: { bg: 'rgba(255,200,0,0.15)', color: '#ffc800', label: '⏳ Pending' },
      CHECKED_IN: { bg: 'rgba(0,200,255,0.15)', color: 'var(--accent)', label: '🛫 Checked In' },
      CANCELLED: { bg: 'rgba(255,51,102,0.15)', color: 'var(--danger)', label: '❌ Cancelled' },
      FAILED: { bg: 'rgba(255,51,102,0.15)', color: 'var(--danger)', label: '⚠️ Failed' },
    };
    const s = styles[status] || { bg: 'rgba(255,255,255,0.1)', color: '#aaa', label: status };
    return <span style={{ padding: '5px 12px', borderRadius: '20px', background: s.bg, color: s.color, fontSize: '0.85rem', fontWeight: 'bold' }}>{s.label}</span>;
  };

  const upcomingBookings = bookings.filter(b => b.status === 'CONFIRMED' || b.status === 'PENDING' || b.status === 'CHECKED_IN');
  const pastBookings = bookings.filter(b => b.status === 'COMPLETED' || b.status === 'CANCELLED' || b.status === 'FAILED');

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      {/* Profile Header */}
      <div className="glass-panel" style={{ padding: '40px', borderRadius: '20px', marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '30px' }}>
        <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), #00b3cc)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '3rem', color: '#000', fontWeight: 'bold' }}>
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 style={{ margin: '0 0 10px 0', fontSize: '2.5rem' }}>Welcome back, {user.name}</h1>
          <p style={{ color: 'var(--accent)', margin: 0 }}>AeroLink Premium Member since {user.memberSince}</p>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <button className="btn-primary" onClick={() => {
            localStorage.removeItem('token');
            navigate('/login');
          }} style={{ background: 'transparent', border: '1px solid var(--danger)', color: 'var(--danger)' }}>Sign Out</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px' }}>
        <button onClick={() => setActiveTab('upcoming')} style={{ background: 'none', border: 'none', fontSize: '1.2rem', color: activeTab === 'upcoming' ? 'var(--accent)' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: activeTab === 'upcoming' ? 'bold' : 'normal', borderBottom: activeTab === 'upcoming' ? '2px solid var(--accent)' : 'none', paddingBottom: '5px' }}>Upcoming Trips</button>
        <button onClick={() => setActiveTab('past')} style={{ background: 'none', border: 'none', fontSize: '1.2rem', color: activeTab === 'past' ? 'var(--accent)' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: activeTab === 'past' ? 'bold' : 'normal', borderBottom: activeTab === 'past' ? '2px solid var(--accent)' : 'none', paddingBottom: '5px' }}>Past Flights & Cancelled</button>
      </div>

      {/* Bookings List */}
      <div>
        {(activeTab === 'upcoming' ? upcomingBookings : pastBookings).map(b => (
          <div key={b.bookingId} className="glass-panel" style={{ padding: '25px', borderRadius: '15px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <div>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>JFK <span style={{ color: 'var(--accent)', margin: '0 10px' }}>✈️</span> LHR</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '5px' }}>Flight {b.flightId} • Seat {b.seatId || 'N/A'}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                {getStatusBadge(b.status)}
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '8px' }}>PNR: <strong style={{ color: 'var(--accent)', letterSpacing: '1px' }}>{b.bookingId}</strong></div>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px' }}>
              <button className="btn-primary" onClick={() => navigate(`/baggage?pnr=${b.bookingId}`)} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 16px', fontSize: '0.9rem' }}>🧳 Track Bag</button>
              
              {b.status === 'CONFIRMED' && (
                <button className="btn-primary" onClick={() => { setCheckInModal(b.bookingId); setCheckInError(''); }} style={{ background: 'var(--accent)', color: '#000', padding: '8px 16px', fontSize: '0.9rem' }}>🛫 Check-In (24h)</button>
              )}
              
              {activeTab === 'upcoming' && b.status !== 'CANCELLED' && (
                <button className="btn-primary" onClick={() => navigate(`/baggage?pnr=${b.bookingId}&add=true`)} style={{ background: 'rgba(255,255,255,0.1)', padding: '8px 16px', fontSize: '0.9rem' }}>📦 Add Bag</button>
              )}

              {activeTab === 'upcoming' && b.status !== 'CANCELLED' && (
                <button className="btn-primary" onClick={async () => {
                  if(confirm('Are you sure you want to cancel this booking?')) {
                     await axios.patch(`${API_URL}/bookings/${b.bookingId}/cancel`);
                     alert('Booking cancelled. Seat released.');
                     window.location.reload();
                  }
                }} style={{ background: 'transparent', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '8px 16px', fontSize: '0.9rem' }}>Cancel Trip</button>
              )}
            </div>
          </div>
        ))}
        {(activeTab === 'upcoming' ? upcomingBookings : pastBookings).length === 0 && (
          <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-secondary)' }}>
            No {activeTab} bookings found.
          </div>
        )}
      </div>

      {/* CHECK-IN MODAL */}
      {checkInModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' }}>
          <div className="glass-panel" style={{ padding: '40px', borderRadius: '20px', maxWidth: '500px', width: '90%', animation: 'fadeIn 0.3s' }}>
            <h2 style={{ marginBottom: '5px', color: 'var(--accent)' }}>🛫 Online Check-In</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '25px', fontSize: '0.9rem' }}>Booking <strong>{checkInModal}</strong> — Enter your passport details to complete check-in.</p>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>Passport Number</label>
              <input className="input-field" type="text" placeholder="e.g. N12345678" value={passport.passportNumber} onChange={e => setPassport({...passport, passportNumber: e.target.value})} />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>Nationality</label>
              <input className="input-field" type="text" placeholder="e.g. Sri Lankan" value={passport.nationality} onChange={e => setPassport({...passport, nationality: e.target.value})} />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>Date of Birth</label>
              <input className="input-field" type="date" value={passport.dateOfBirth} onChange={e => setPassport({...passport, dateOfBirth: e.target.value})} />
            </div>

            {checkInError && (
              <div style={{ padding: '10px 15px', background: 'rgba(255,51,102,0.15)', border: '1px solid var(--danger)', borderRadius: '8px', color: 'var(--danger)', marginBottom: '15px', fontSize: '0.9rem' }}>
                {checkInError}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn-primary" onClick={handleCheckIn} disabled={checkInLoading} style={{ flex: 1, padding: '12px', background: 'var(--accent)', color: '#000' }}>
                {checkInLoading ? 'Processing...' : '✅ Confirm Check-In'}
              </button>
              <button className="btn-primary" onClick={() => setCheckInModal(null)} style={{ padding: '12px 20px', background: 'rgba(255,255,255,0.1)' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
