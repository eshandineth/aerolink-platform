import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// The Ingress/ALB or local API Gateway endpoint
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export default function Home() {
  const [flights, setFlights] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // In a real environment, we fetch from flight-service
    axios.get(`${API_URL}/flights`)
      .then(res => setFlights(res.data))
      .catch(err => {
        console.error("Failed to fetch flights, using dummy data", err);
        setFlights([
          { flightId: 'AL-7023', flightNumber: 'AL-101', origin: 'JFK', destination: 'LHR', price: 450, availableSeats: 120 },
          { flightId: 'AL-4491', flightNumber: 'AL-102', origin: 'LAX', destination: 'NRT', price: 800, availableSeats: 45 },
          { flightId: 'AL-9204', flightNumber: 'AL-303', origin: 'DXB', destination: 'SYD', price: 1200, availableSeats: 12 },
        ]);
      });
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: '3.5rem', marginBottom: '10px' }}>Explore The Skies</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '50px', fontSize: '1.2rem' }}>Book your next premium flight with AeroLink.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' }}>
        {flights.map(flight => (
          <div key={flight.flightId} className="glass-panel" style={{ padding: '30px' }}>
            <h2 style={{ margin: '0 0 15px 0', color: 'var(--accent)' }}>{flight.flightNumber}</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', fontSize: '1.1rem' }}>
              <span>{flight.origin}</span>
              <span>✈️</span>
              <span>{flight.destination}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>${flight.price}</span>
              <button className="btn-primary" onClick={() => navigate(`/book/${flight.flightId}`)}>Book Now</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
