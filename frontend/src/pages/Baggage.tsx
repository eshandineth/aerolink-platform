import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { jwtDecode } from 'jwt-decode';

const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

export default function Baggage() {
  const [searchParams] = useSearchParams();
  const initialPnr = searchParams.get('pnr') || '';
  const isAdding = searchParams.get('add') === 'true';
  const flightIdParam = searchParams.get('flight') || '';
  
  const [bookingId, setBookingId] = useState(initialPnr);
  const [baggage, setBaggage] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  // For Adding Bag
  const [weight, setWeight] = useState('');
  const [isAddingMode, setIsAddingMode] = useState(isAdding);

  // Auto-search if PNR provided and not adding
  useEffect(() => {
    if (initialPnr && !isAddingMode) {
      handleSearch(initialPnr);
    }
  }, []);

  const bookingIdForSocket = baggage?.bookingId;
  useEffect(() => {
    if (!bookingIdForSocket) return;
    
    const wsUrl = API_URL.replace('/api/v1', '');
    const socket = io(wsUrl.includes('localhost') ? 'http://localhost:3000' : wsUrl);
    socket.emit('join_baggage', bookingIdForSocket);
    
    socket.on('status_update', (data) => {
      console.log('Live Baggage Update:', data);
      setBaggage((prev: any) => ({ ...prev, ...data })); 
    });

    return () => { socket.disconnect(); };
  }, [bookingIdForSocket]);

  const handleSearch = async (searchId: string) => {
    if (!searchId) return;
    setIsSearching(true);
    try {
      const res = await axios.get(`${API_URL}/baggage/booking/${searchId}`);
      setBaggage(res.data);
      setIsAddingMode(false);
    } catch (err) {
      alert("No baggage found for this Booking ID.");
      setBaggage(null);
    }
    setIsSearching(false);
  };

  const trackBaggage = async (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(bookingId);
  };

  const submitAddBag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight || !bookingId) return;
    
    const token = localStorage.getItem('token');
    if (!token) return alert("You must be logged in to add baggage.");
    const decoded: any = jwtDecode(token);

    try {
      await axios.post(`${API_URL}/baggage/checkin`, {
        bookingId,
        flightId: flightIdParam || 'UNKNOWN',
        passengerId: decoded.userId,
        weight: parseInt(weight)
      });
      alert('Baggage added successfully! You can now track it.');
      setIsAddingMode(false);
      handleSearch(bookingId);
    } catch (err) {
      alert('Failed to add baggage.');
    }
  };

  const getStatusStep = (status: string) => {
    switch (status) {
      case 'CHECKED_IN': return 1;
      case 'LOADED': return 2;
      case 'IN_TRANSIT': return 3;
      case 'ARRIVED': return 4;
      default: return 0;
    }
  };

  const currentStep = baggage ? getStatusStep(baggage.status) : 0;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
      
      {/* Toggle between Track and Add modes if we have a PNR */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', justifyContent: 'center' }}>
        <button onClick={() => setIsAddingMode(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', color: !isAddingMode ? 'var(--accent)' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: !isAddingMode ? 'bold' : 'normal' }}>Track Baggage</button>
        <button onClick={() => setIsAddingMode(true)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', color: isAddingMode ? 'var(--accent)' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: isAddingMode ? 'bold' : 'normal' }}>Add Baggage</button>
      </div>

      {!isAddingMode ? (
        <div className="glass-panel" style={{ padding: '40px', borderRadius: '20px', marginBottom: '30px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Track Your Bags</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>Enter your Booking ID (PNR) to get real-time updates.</p>
          
          <form onSubmit={trackBaggage} style={{ display: 'flex', gap: '15px', maxWidth: '500px', margin: '0 auto' }}>
            <input 
              type="text" 
              className="input-field" 
              placeholder="e.g. 8xy92z" 
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
              style={{ flex: 1 }} 
            />
            <button type="submit" className="btn-primary">{isSearching ? 'Searching...' : 'Track Now'}</button>
          </form>
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '40px', borderRadius: '20px', marginBottom: '30px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Add Baggage</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>Register a new piece of baggage for your flight.</p>
          
          <form onSubmit={submitAddBag} style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px', margin: '0 auto', textAlign: 'left' }}>
            <div>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Booking ID (PNR)</label>
              <input type="text" className="input-field" value={bookingId} onChange={e => setBookingId(e.target.value)} required />
            </div>
            <div>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Baggage Weight (kg)</label>
              <input type="number" min="1" max="50" className="input-field" value={weight} onChange={e => setWeight(e.target.value)} placeholder="e.g. 23" required />
            </div>
            <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>Check-In Baggage</button>
          </form>
        </div>
      )}

      {baggage && !isAddingMode && (
        <div className="glass-panel" style={{ padding: '40px', borderRadius: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Baggage ID</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{baggage.baggageId}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Weight</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{baggage.weight} kg</div>
            </div>
          </div>

          {/* Amazon style Timeline */}
          <div style={{ position: 'relative', padding: '20px 0', display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ position: 'absolute', top: '35px', left: '10%', right: '10%', height: '4px', background: 'rgba(255,255,255,0.1)', zIndex: 0 }}></div>
            <div style={{ position: 'absolute', top: '35px', left: '10%', width: `${(currentStep - 1) * 33.33}%`, height: '4px', background: 'var(--accent)', zIndex: 1, transition: 'width 1s ease' }}></div>
            
            {[
              { id: 1, label: 'Checked In', icon: '📝' },
              { id: 2, label: 'Loaded', icon: '🛫' },
              { id: 3, label: 'In Transit', icon: '☁️' },
              { id: 4, label: 'Arrived', icon: '🛬' }
            ].map(step => (
              <div key={step.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, width: '25%' }}>
                <div style={{ 
                  width: '35px', height: '35px', 
                  borderRadius: '50%', 
                  background: currentStep >= step.id ? 'var(--accent)' : '#333',
                  color: currentStep >= step.id ? '#000' : '#888',
                  display: 'flex', justifyContent: 'center', alignItems: 'center',
                  fontWeight: 'bold', marginBottom: '15px',
                  boxShadow: currentStep >= step.id ? '0 0 15px var(--accent)' : 'none',
                  transition: 'all 0.5s ease'
                }}>
                  {currentStep > step.id ? '✓' : step.id}
                </div>
                <div style={{ fontSize: '2rem', marginBottom: '10px' }}>{step.icon}</div>
                <div style={{ fontWeight: currentStep >= step.id ? 'bold' : 'normal', color: currentStep >= step.id ? '#fff' : '#888' }}>
                  {step.label}
                </div>
              </div>
            ))}
          </div>
          
          {currentStep === 3 && (
            <div style={{ marginTop: '50px', padding: '20px', background: 'rgba(0, 229, 255, 0.1)', borderRadius: '10px', textAlign: 'center', color: 'var(--accent)' }}>
              ℹ️ Your baggage is currently flying to the destination.
            </div>
          )}
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <button onClick={() => navigate('/profile')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', textDecoration: 'underline' }}>Back to My Trips</button>
      </div>
    </div>
  );
}
