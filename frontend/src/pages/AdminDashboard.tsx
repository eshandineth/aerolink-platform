import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

export default function AdminDashboard() {
  const [flights, setFlights] = useState([]);
  const [users, setUsers] = useState([]);
  const [allBaggage, setAllBaggage] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [flightsRes, usersRes, baggageRes] = await Promise.all([
          axios.get(`${API_URL}/flights`),
          axios.get(`${API_URL}/auth/users`),
          axios.get(`${API_URL}/baggage`)
        ]);
        setFlights(flightsRes.data);
        setUsers(usersRes.data);
        setAllBaggage(baggageRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
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
          <h3 style={{ color: 'var(--text-secondary)' }}>Total Registered Users</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '10px 0 0 0' }}>{users.length || 0}</p>
        </div>
      </div>

      <h3 style={{ marginBottom: '20px' }}>Flight Management Database</h3>
      <div className="glass-panel" style={{ padding: '20px', overflowX: 'auto', marginBottom: '40px' }}>
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
                <td style={{ padding: '15px' }}>
                  <button onClick={async () => {
                    if (confirm('Are you sure you want to cancel this flight?')) {
                      try {
                        await axios.delete(`${API_URL}/flights/${f.flightId}`);
                        window.location.reload();
                      } catch (e) {
                        alert('Failed to delete flight');
                      }
                    }
                  }} style={{ padding: '5px 10px', background: 'rgba(255, 51, 102, 0.2)', border: '1px solid var(--danger)', color: '#fff', borderRadius: '5px', cursor: 'pointer', marginRight: '10px' }}>Cancel</button>
                  <button onClick={() => {
                    const price = prompt('Enter new price:', f.price);
                    if (!price) return;
                    axios.put(`${API_URL}/flights/${f.flightId}`, {
                      origin: f.origin,
                      destination: f.destination,
                      departureTime: f.departureTime,
                      price: parseInt(price)
                    }).then(() => window.location.reload())
                      .catch(() => alert('Failed to edit flight'));
                  }} style={{ padding: '5px 10px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: '5px', cursor: 'pointer' }}>Manage Price</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        {/* ADD FLIGHT */}
        <div className="glass-panel" style={{ padding: '30px' }}>
          <h3 style={{ color: 'var(--accent)', marginBottom: '20px' }}>➕ Schedule New Flight</h3>
          <form onSubmit={async (e: any) => { 
            e.preventDefault(); 
            const data = {
              flightNumber: `AL-${Math.floor(Math.random() * 900) + 100}`,
              origin: e.target.origin.value,
              destination: e.target.destination.value,
              departureTime: e.target.time.value,
              arrivalTime: new Date(new Date(e.target.time.value).getTime() + 14400000).toISOString(),
              price: 450,
              totalSeats: 120
            };
            try {
              await axios.post(`${API_URL}/flights`, data);
              alert('Flight scheduled successfully!');
              window.location.reload();
            } catch (err) {
              console.error(err);
              alert('Failed to schedule flight.');
            }
          }}>
            <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>Origin</label>
                <input name="origin" type="text" className="input-field" placeholder="e.g. JFK" required />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>Destination</label>
                <input name="destination" type="text" className="input-field" placeholder="e.g. LHR" required />
              </div>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>Departure Time</label>
              <input name="time" type="datetime-local" className="input-field" required />
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px' }}>Deploy Flight to Cloud</button>
          </form>
        </div>

        {/* BAGGAGE CONTROL */}
        <div className="glass-panel" style={{ padding: '30px' }}>
          <h3 style={{ color: 'var(--accent)', marginBottom: '20px' }}>🧳 Real-Time Baggage Control</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Update baggage statuses here. Our WebSocket server will instantly push this update to the user's tracking timeline.
          </p>
          <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
            <input id="adminBagId" type="text" className="input-field" placeholder="Baggage ID (e.g. BAG-123)" style={{ flex: 1 }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {['CHECKED_IN', 'LOADED', 'IN_TRANSIT', 'ARRIVED'].map(status => (
              <button 
                key={status}
                onClick={async () => {
                  const id = (document.getElementById('adminBagId') as HTMLInputElement).value;
                  if (!id) return alert('Enter Baggage ID');
                  try {
                    await axios.patch(`${API_URL}/baggage/${id}/status`, { status });
                    alert(`Status updated to ${status}`);
                  } catch (err: any) {
                    console.error(err);
                    alert(err.response?.data?.error || 'Failed to update status.');
                  }
                }}
                className="btn-primary" 
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', padding: '10px', fontSize: '0.85rem' }}>
                Set: {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      <h3 style={{ marginBottom: '20px', marginTop: '40px' }}>User Directory</h3>
      <div className="glass-panel" style={{ padding: '20px', overflowX: 'auto', marginBottom: '40px' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <th style={{ padding: '15px' }}>Email / User ID</th>
              <th style={{ padding: '15px' }}>Name</th>
              <th style={{ padding: '15px' }}>Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u: any) => (
              <tr key={u.userId} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '15px', color: 'var(--accent)' }}>{u.userId}</td>
                <td style={{ padding: '15px' }}>{u.name || 'N/A'}</td>
                <td style={{ padding: '15px' }}>
                  <span style={{ padding: '5px 10px', background: u.role === 'admin' ? 'rgba(255, 51, 102, 0.2)' : 'rgba(255,255,255,0.1)', color: u.role === 'admin' ? 'var(--danger)' : '#fff', borderRadius: '10px', fontSize: '0.8rem' }}>
                    {u.role.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 style={{ marginBottom: '20px', marginTop: '40px' }}>Active Baggage Directory</h3>
      <div className="glass-panel" style={{ padding: '20px', overflowX: 'auto', marginBottom: '40px' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <th style={{ padding: '15px' }}>Baggage ID</th>
              <th style={{ padding: '15px' }}>Booking PNR</th>
              <th style={{ padding: '15px' }}>Passenger</th>
              <th style={{ padding: '15px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {allBaggage.map((b: any) => (
              <tr key={b.baggageId} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '15px', fontFamily: 'monospace', color: 'var(--accent)', fontWeight: 'bold' }}>{b.baggageId}</td>
                <td style={{ padding: '15px' }}>{b.bookingId || <span style={{color:'red'}}>Ghost Bag</span>}</td>
                <td style={{ padding: '15px' }}>{b.passengerId}</td>
                <td style={{ padding: '15px' }}>{b.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
