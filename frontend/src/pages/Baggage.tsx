import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Baggage() {
  const [baggageId, setBaggageId] = useState('');
  const [tracking, setTracking] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!baggageId) return;
    
    setIsSearching(true);
    setTimeout(() => {
      // Simulate API fetch
      setTracking({
        baggageId: baggageId,
        flightNumber: 'AL-101',
        passengerName: 'JOHN DOE',
        weight: '23 kg',
        status: 'IN_TRANSIT', // CHECKED_IN, LOADED, IN_TRANSIT, ARRIVED
      });
      setIsSearching(false);
    }, 800);
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

  const currentStep = tracking ? getStatusStep(tracking.status) : 0;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <h1 style={{ fontSize: '3rem', margin: '0 0 10px 0', background: 'linear-gradient(45deg, #ffffff, var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Baggage Tracking</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Enter your Baggage ID or PNR to track your luggage in real-time.</p>
      </div>

      <div className="glass-panel" style={{ padding: '30px', borderRadius: '15px', marginBottom: '40px' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '15px' }}>
          <input 
            type="text" 
            className="input-field" 
            placeholder="e.g. BAG-123456" 
            value={baggageId} 
            onChange={e => setBaggageId(e.target.value)}
            style={{ flex: 1, fontSize: '1.2rem', padding: '15px' }}
          />
          <button type="submit" className="btn-primary" style={{ padding: '0 40px', fontSize: '1.1rem' }}>
            {isSearching ? 'Searching...' : 'Track Bag'}
          </button>
        </form>
      </div>

      {tracking && (
        <div className="glass-panel" style={{ padding: '40px', borderRadius: '20px', animation: 'fadeIn 0.5s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px' }}>
            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Baggage ID</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent)' }}>{tracking.baggageId}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Flight</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{tracking.flightNumber}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Weight</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{tracking.weight}</div>
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
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', textDecoration: 'underline' }}>Back to Home</button>
      </div>
    </div>
  );
}
