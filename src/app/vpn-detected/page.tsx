'use client';

import { ShieldAlert, RefreshCw, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function VPNDetectedPage() {
  const router = useRouter();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'radial-gradient(circle at center, #1a1a1a 0%, #000 100%)',
      color: 'white',
      fontFamily: 'var(--font-geist-sans), sans-serif',
      padding: '20px',
      textAlign: 'center'
    }}>
      <div className="glass-card" style={{
        maxWidth: '500px',
        width: '100%',
        padding: '40px',
        border: '1px solid rgba(255, 77, 77, 0.3)',
        boxShadow: '0 0 30px rgba(255, 77, 77, 0.1)'
      }}>
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
          <div style={{
            background: 'rgba(255, 77, 77, 0.1)',
            padding: '20px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ShieldAlert size={48} color="#ff4d4d" />
          </div>
        </div>

        <h1 className="title-gradient" style={{ 
          fontSize: '1.8rem', 
          marginBottom: '16px',
          background: 'linear-gradient(to bottom, #fff, #ff4d4d)'
        }}>
          VPN Detected
        </h1>
        
        <p style={{ 
          color: 'var(--text-muted)', 
          lineHeight: '1.6', 
          marginBottom: '32px',
          fontSize: '0.95rem'
        }}>
          To ensure the integrity of our API services and prevent unauthorized redistribution, 
          we do not allow access via VPN or Proxy servers.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button 
            onClick={() => window.location.reload()}
            className="btn-primary"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '8px', 
              background: '#ff4d4d',
              borderColor: '#ff6666'
            }}
          >
            <RefreshCw size={18} /> I have disabled my VPN
          </button>
          
          <button 
            onClick={() => router.push('/')}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--text-muted)', 
              cursor: 'pointer',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              marginTop: '8px'
            }}
          >
            <ArrowLeft size={14} /> Back to Landing Page
          </button>
        </div>
      </div>

      <p style={{ marginTop: '24px', fontSize: '0.75rem', color: '#444' }}>
        Protected by NanaOne Security Intelligence
      </p>
    </div>
  );
}
