import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [user, setUser] = useState({ name: 'John Doe', memberSince: '2025' });

  // Dummy bookings
  const upcomingBookings = [
    { pnr: '8XY92Z', flight: 'AL-101', origin: 'JFK', dest: 'LHR', date: '12 Nov 2026', status: 'CONFIRMED' }
  ];
  
  const pastBookings = [
    { pnr: '2AB34C', flight: 'AL-303', origin: 'DXB', dest: 'SYD', date: '01 Jan 2026', status: 'COMPLETED' }
  ];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      {/* Profile Header */}
      <div className="glass-panel" style={{ padding: '40px', borderRadius: '20px', marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '30px' }}>
        <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), #00b3cc)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '3rem', color: '#000', fontWeight: 'bold' }}>
          {user.name.charAt(0)}
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
        <button onClick={() => setActiveTab('past')} style={{ background: 'none', border: 'none', fontSize: '1.2rem', color: activeTab === 'past' ? 'var(--accent)' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: activeTab === 'past' ? 'bold' : 'normal', borderBottom: activeTab === 'past' ? '2px solid var(--accent)' : 'none', paddingBottom: '5px' }}>Past Flights</button>
      </div>

      {/* Bookings List */}
      <div>
        {(activeTab === 'upcoming' ? upcomingBookings : pastBookings).map(b => (
          <div key={b.pnr} className="glass-panel" style={{ padding: '25px', borderRadius: '15px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>{b.date} • Flight {b.flight}</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{b.origin} <span style={{ color: 'var(--accent)', margin: '0 10px' }}>✈️</span> {b.dest}</div>
            </div>
            
            <div style={{ textAlign: 'center', padding: '0 40px', borderLeft: '1px solid rgba(255,255,255,0.1)', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>PNR</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '2px' }}>{b.pnr}</div>
            </div>
            
            <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
              <button className="btn-primary" onClick={() => navigate('/baggage')} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>Track Bag</button>
              {activeTab === 'upcoming' && (
                <button className="btn-primary" onClick={() => {
                  alert('Saga Cancellation Triggered. Seat released back to inventory.');
                }} style={{ background: 'transparent', border: '1px solid var(--danger)', color: 'var(--danger)' }}>Cancel Trip</button>
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
    </div>
  );
}
