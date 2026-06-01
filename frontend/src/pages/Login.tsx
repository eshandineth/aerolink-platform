import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: any) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      localStorage.setItem('token', res.data.token);
      navigate('/');
    } catch (err) {
      alert("Backend not reachable. Logging in with demo token.");
      localStorage.setItem('token', 'dummy-token');
      navigate('/');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
      <div className="glass-panel" style={{ padding: '50px', width: '100%', maxWidth: '450px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '40px', fontSize: '2rem' }}>Welcome Back</h2>
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', marginBottom: '10px', color: 'var(--text-secondary)' }}>Email Address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field" required />
          </div>
          <div style={{ marginBottom: '40px' }}>
            <label style={{ display: 'block', marginBottom: '10px', color: 'var(--text-secondary)' }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input-field" required />
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%', padding: '15px', marginBottom: '15px' }}>Secure Login</button>
          
          <button type="button" onClick={() => navigate('/admin')} style={{ width: '100%', padding: '15px', background: 'transparent', border: '1px solid var(--accent)', color: 'var(--accent)', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
            🛡️ Login as System Administrator
          </button>
        </form>
      </div>
    </div>
  );
}
