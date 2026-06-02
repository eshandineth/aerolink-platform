import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// The Ingress/ALB or local API Gateway endpoint
const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

export default function Home() {
  const [flights, setFlights] = useState<any[]>([]);
  const [searchOrigin, setSearchOrigin] = useState('');
  const [searchDest, setSearchDest] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [passengers, setPassengers] = useState('1');
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFlights();
  }, []);

  const fetchFlights = () => {
    setIsSearching(true);
    axios.get(`${API_URL}/flights`)
      .then(res => setFlights(res.data))
      .catch(err => {
        console.error("Failed to fetch flights, using dummy data", err);
        setFlights([
          { flightId: 'AL-7023', flightNumber: 'AL-101', origin: 'JFK', destination: 'LHR', price: 450, availableSeats: 120, departureTime: '2023-11-01T08:00:00Z', arrivalTime: '2023-11-01T20:00:00Z' },
          { flightId: 'AL-4491', flightNumber: 'AL-102', origin: 'LAX', destination: 'NRT', price: 800, availableSeats: 45, departureTime: '2023-11-02T10:00:00Z', arrivalTime: '2023-11-03T14:00:00Z' },
          { flightId: 'AL-9204', flightNumber: 'AL-303', origin: 'DXB', destination: 'SYD', price: 1200, availableSeats: 12, departureTime: '2023-11-05T22:00:00Z', arrivalTime: '2023-11-06T18:00:00Z' },
        ]);
      })
      .finally(() => {
         setTimeout(() => setIsSearching(false), 600); // fake loading delay for wow factor
      });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFlights();
  };

  const filteredFlights = flights.filter(f => 
    f.origin.toLowerCase().includes(searchOrigin.toLowerCase()) &&
    f.destination.toLowerCase().includes(searchDest.toLowerCase())
  );

  return (
    <div>
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <h1 style={{ fontSize: '4rem', marginBottom: '10px', background: 'linear-gradient(45deg, #ffffff, var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Explore The Skies
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>Book your next premium flight with AeroLink.</p>
      </div>

      <div className="glass-panel" style={{ padding: '30px', marginBottom: '50px', borderRadius: '20px' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>From</label>
            <input type="text" placeholder="e.g. JFK" value={searchOrigin} onChange={e => setSearchOrigin(e.target.value)} className="input-field" style={{ width: '100%' }} />
          </div>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>To</label>
            <input type="text" placeholder="e.g. LHR" value={searchDest} onChange={e => setSearchDest(e.target.value)} className="input-field" style={{ width: '100%' }} />
          </div>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Date</label>
            <input type="date" value={searchDate} onChange={e => setSearchDate(e.target.value)} className="input-field" style={{ width: '100%', colorScheme: 'dark' }} />
          </div>
          <div style={{ flex: '1 1 100px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Passengers</label>
            <select value={passengers} onChange={e => setPassengers(e.target.value)} className="input-field" style={{ width: '100%' }}>
              {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} Adult{n > 1 ? 's' : ''}</option>)}
            </select>
          </div>
          <button type="submit" className="btn-primary" style={{ padding: '15px 30px', flex: '0 0 auto' }}>
            {isSearching ? 'Searching...' : 'Search Flights'}
          </button>
        </form>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '30px' }}>
        {filteredFlights.map(flight => (
          <div key={flight.flightId} className="glass-panel" style={{ padding: '30px', transition: 'transform 0.3s ease', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <span style={{ padding: '5px 12px', background: 'rgba(0, 229, 255, 0.1)', color: 'var(--accent)', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 'bold' }}>{flight.flightNumber || `AL-${flight.flightId.substring(0, 3).toUpperCase()}`}</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{flight.availableSeats || 120} seats left</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', textShadow: '0 0 10px rgba(255,255,255,0.2)' }}>{flight.origin}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Departure</div>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 15px' }}>
                <span style={{ fontSize: '1.5rem', color: 'var(--accent)', marginBottom: '-10px' }}>✈️</span>
                <div style={{ width: '100%', borderBottom: '2px dashed rgba(255,255,255,0.2)' }}></div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', textShadow: '0 0 10px rgba(255,255,255,0.2)' }}>{flight.destination}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Arrival</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Price per passenger</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#fff' }}>${flight.price || 450}</div>
              </div>
              <button className="btn-primary" onClick={() => navigate(`/book/${flight.flightId}?passengers=${passengers}`)}>Select Flight</button>
            </div>
          </div>
        ))}
        {filteredFlights.length === 0 && !isSearching && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '50px', color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🔍</div>
            <h2 style={{ color: '#fff' }}>No flights found</h2>
            <p>We couldn't find any flights matching your criteria. Try different dates or locations.</p>
          </div>
        )}
      </div>
    </div>
  );
}
