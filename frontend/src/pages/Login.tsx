import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('passenger'); // passenger or admin
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isRegister) {
        await axios.post(`${API_URL}/auth/register`, { email, password, name, role });
        alert('Registration successful! Please login.');
        setIsRegister(false);
      } else {
        const res = await axios.post(`${API_URL}/auth/login`, { email, password });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('role', res.data.role);
        
        if (res.data.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }
    } catch (err: any) {
      console.warn("Auth error:", err);
      // Fallback for demo if backend is offline or EKS load balancer is down
      const isOfflineError = err.message === 'Network Error' || (err.response && err.response.status >= 500);
      
      if (isOfflineError) {
        if (isRegister) {
          alert("Backend not reachable. Simulating successful registration for Demo Mode!");
          setIsRegister(false);
        } else {
          alert("Backend not reachable. Simulating Demo Login.");
          localStorage.setItem('token', 'demo-token');
          localStorage.setItem('role', role);
          navigate(role === 'admin' ? '/admin' : '/');
        }
      } else {
        setError(err.response?.data?.error || 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '20px' }}>
      <div className="glass-panel" style={{ padding: '50px', width: '100%', maxWidth: '450px', position: 'relative', overflow: 'hidden' }}>
        
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'var(--accent)', filter: 'blur(80px)', opacity: 0.3 }}></div>
        
        <h2 style={{ textAlign: 'center', marginBottom: '10px', fontSize: '2.5rem' }}>{isRegister ? 'Create Account' : 'Welcome Back'}</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '40px' }}>{isRegister ? 'Join the future of aviation.' : 'Secure access to AeroLink Platform.'}</p>
        
        {error && <div style={{ background: 'rgba(255,51,102,0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '15px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div style={{ marginBottom: '25px', animation: 'fadeIn 0.3s' }}>
              <label style={{ display: 'block', marginBottom: '10px', color: 'var(--text-secondary)' }}>Full Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="input-field" required />
            </div>
          )}
          
          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', marginBottom: '10px', color: 'var(--text-secondary)' }}>Email Address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field" required />
          </div>
          
          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '10px', color: 'var(--text-secondary)' }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input-field" required />
          </div>

          <div style={{ marginBottom: '40px', display: 'flex', gap: '20px', alignItems: 'center' }}>
            <label style={{ color: 'var(--text-secondary)' }}>Login as:</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="input-field" style={{ padding: '10px', flex: 1 }}>
              <option value="passenger">Passenger</option>
              <option value="admin">System Administrator</option>
            </select>
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', padding: '15px', marginBottom: '20px', fontSize: '1.1rem' }} disabled={loading}>
            {loading ? 'Processing...' : (isRegister ? 'Register Now' : 'Secure Login')}
          </button>
          
          <div style={{ textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>
              {isRegister ? 'Already have an account? ' : "Don't have an account? "}
            </span>
            <button type="button" onClick={() => setIsRegister(!isRegister)} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}>
              {isRegister ? 'Sign In' : 'Register Here'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
