import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3000'; 

export default function Booking() {
  const { flightId } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('IDLE'); // IDLE, BOOKING, CONFIRMED, FAILED
  const [liveSeats, setLiveSeats] = useState(120);

  useEffect(() => {
    // Real-time WebSocket connection for live seat updates
    const socket = io(WS_URL);
    socket.emit('join_flight', flightId);

    socket.on('seat_update', (data: any) => {
      console.log('Live Seat Update:', data);
      if (data.flightId === flightId) {
        setLiveSeats(data.availableSeats);
      }
    });

    return () => { socket.disconnect(); };
  }, [flightId]);

  const handleBook = async (simulateFailure: boolean) => {
    setStatus('BOOKING');
    try {
      const res = await axios.post(`${API_URL}/bookings`, {
        userId: 'user-123',
        flightId,
        price: 450,
        simulatePaymentFailure: simulateFailure
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      console.log(res.data);
      setStatus('CONFIRMED');
    } catch (err) {
      console.error(err);
      setStatus('FAILED');
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '50px', maxWidth: '700px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Complete Booking</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>Flight Reference: <span style={{ color: 'var(--text-primary)' }}>{flightId}</span></p>
      
      <div style={{ margin: '40px 0', padding: '30px', background: 'rgba(0, 240, 255, 0.05)', borderRadius: '12px', border: '1px solid rgba(0, 240, 255, 0.3)' }}>
        <h3 style={{ margin: '0 0 15px 0', color: 'var(--accent)' }}>Live Seat Availability</h3>
        <p style={{ fontSize: '3rem', margin: 0, fontWeight: 'bold', textShadow: '0 0 20px rgba(0,240,255,0.5)' }}>
          {liveSeats} <span style={{ fontSize: '1.2rem', fontWeight: 'normal', color: 'var(--text-secondary)', textShadow: 'none' }}>seats remaining</span>
        </p>
        <small style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '10px' }}>🟢 Real-time updates via WebSocket</small>
      </div>

      {status === 'IDLE' && (
        <div style={{ display: 'flex', gap: '20px', marginTop: '40px' }}>
          <button className="btn-primary" onClick={() => handleBook(false)} style={{ flex: 1, padding: '15px' }}>Confirm Payment (Success)</button>
          <button className="btn-primary" onClick={() => handleBook(true)} style={{ flex: 1, padding: '15px', background: 'linear-gradient(135deg, var(--danger), #cc0033)' }}>Simulate Payment Failure</button>
        </div>
      )}

      {status === 'BOOKING' && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <h3 style={{ color: 'var(--accent)' }}>Processing secure transaction...</h3>
          <p style={{ color: 'var(--text-secondary)' }}>The Saga Pattern is currently orchestrating the microservices.</p>
        </div>
      )}
      
      {status === 'CONFIRMED' && (
        <div style={{ padding: '30px', background: 'rgba(0, 255, 157, 0.1)', border: '1px solid var(--success)', borderRadius: '12px', marginTop: '30px' }}>
          <h3 style={{ color: 'var(--success)', margin: '0 0 10px 0' }}>✅ Booking Confirmed!</h3>
          <p style={{ color: '#fff' }}>Your transaction was successful. Check your email (via SNS Lambda) for the receipt.</p>
          <button className="btn-primary" onClick={() => navigate('/')} style={{ marginTop: '20px' }}>Back to Home</button>
        </div>
      )}

      {status === 'FAILED' && (
        <div style={{ padding: '30px', background: 'rgba(255, 51, 102, 0.1)', border: '1px solid var(--danger)', borderRadius: '12px', marginTop: '30px' }}>
          <h3 style={{ color: 'var(--danger)', margin: '0 0 10px 0' }}>❌ Booking Failed (Saga Rollback Triggered)</h3>
          <p style={{ color: '#fff' }}>The payment was declined. The Saga Pattern successfully intercepted the failure, rolled back the pending booking, and released your seat to prevent ghost reservations.</p>
          <button className="btn-primary" onClick={() => setStatus('IDLE')} style={{ marginTop: '20px' }}>Try Again</button>
        </div>
      )}
    </div>
  );
}
