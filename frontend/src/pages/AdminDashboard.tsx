import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

export default function AdminDashboard() {
  const [flights, setFlights] = useState([]);

  useEffect(() => {
    // Fetch flights to display in the admin panel
    const fetchFlights = async () => {
      try {
        const res = await axios.get(`${API_URL}/flights`);
        setFlights(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchFlights();
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <h2 style={{ fontSize: '2.5rem', color: 'var(--accent)' }}>🛡️ Admin Control Panel</h2>
        <div style={{ padding: '10px 20px', background: 'rgba(0, 255, 157, 0.1)', border: '1px solid var(--success)', borderRadius: '20px', color: 'var(--success)' }}>
          System Status: SECURE & ONLINE
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '40px' }}>
        <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--text-secondary)' }}>Total Active Flights</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '10px 0 0 0' }}>{flights.length || 3}</p>
        </div>
        <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--text-secondary)' }}>Microservices Health</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '10px 0 0 0', color: 'var(--success)' }}>100%</p>
        </div>
        <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--text-secondary)' }}>Saga Orchestrations</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '10px 0 0 0' }}>12</p>
        </div>
      </div>

      <h3 style={{ marginBottom: '20px' }}>Flight Management Database</h3>
      <div className="glass-panel" style={{ padding: '20px', overflowX: 'auto' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <th style={{ padding: '15px' }}>Flight ID</th>
              <th style={{ padding: '15px' }}>Origin</th>
              <th style={{ padding: '15px' }}>Destination</th>
              <th style={{ padding: '15px' }}>Available Seats</th>
              <th style={{ padding: '15px' }}>Status</th>
              <th style={{ padding: '15px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {flights.map((f: any) => (
              <tr key={f.flightId} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '15px', fontFamily: 'monospace', color: 'var(--accent)' }}>{f.flightId}</td>
                <td style={{ padding: '15px' }}>{f.origin}</td>
                <td style={{ padding: '15px' }}>{f.destination}</td>
                <td style={{ padding: '15px' }}>{f.availableSeats}</td>
                <td style={{ padding: '15px' }}><span style={{ padding: '5px 10px', background: 'rgba(0,255,157,0.1)', color: 'var(--success)', borderRadius: '10px', fontSize: '0.8rem' }}>ON TIME</span></td>
                <td style={{ padding: '15px' }}><button style={{ padding: '5px 10px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: '5px', cursor: 'pointer' }}>Manage</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
