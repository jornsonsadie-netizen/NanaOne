'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import { Shield, Rocket, ChevronRight } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState('');

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'enyapeakshit') {
      localStorage.setItem('admin_access', 'true');
      router.push('/admin');
    } else {
      alert('Invalid admin password');
    }
  };

  return (
    <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '100px 20px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="grid-bg"></div>
      
      <div style={{ textAlign: 'center', marginBottom: '80px' }}>
        <h1 className="title-gradient" style={{ fontSize: 'clamp(3rem, 10vw, 5rem)', marginBottom: '16px', letterSpacing: '-2px' }}>NanaOne</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto' }}>
          The power of elite AI, delivered through a secure, high-performance gateway.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', flex: 1 }}>
        <div className="glass-card" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px' }}>
          <div style={{ background: 'rgba(124, 58, 237, 0.1)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <Rocket style={{ color: 'var(--primary)' }} />
          </div>
          <h3 style={{ marginBottom: '12px', fontSize: '1.5rem' }}>User Portal</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '0.95rem', lineHeight: '1.6' }}>
            Access the elite AI gateway. Generate unique keys, track credits, and manage your one-time balance.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {status === 'authenticated' ? (
              <button className="btn-primary" style={{ width: '100%' }} onClick={() => router.push('/dashboard')}>
                Go to Dashboard <Rocket size={18} />
              </button>
            ) : (
              <button className="btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={() => router.push('/login')}>
                Sign in with GitHub <ChevronRight size={18} />
              </button>
            )}
          </div>
        </div>

        <div className="glass-card" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px' }}>
          <div style={{ background: 'rgba(0, 242, 254, 0.1)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <Shield style={{ color: 'var(--accent)' }} />
          </div>
          <h3 style={{ marginBottom: '12px', fontSize: '1.5rem' }}>Admin Panel</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '0.95rem', lineHeight: '1.6' }}>
            Configure upstream providers, manage system models, and generate redeem codes.
          </p>
          
           {!isAdmin ? (
            <button className="btn-secondary" style={{ width: '100%', opacity: 0.8 }} onClick={() => setIsAdmin(true)}>
              Admin Login <Shield size={16} />
            </button>
          ) : (
            <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input 
                type="password" 
                className="input-field" 
                placeholder="Enter password..." 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
              <button type="submit" className="btn-primary" style={{ width: '100%' }}>Login</button>
            </form>
          )}
        </div>
      </div>

      <footer style={{ marginTop: '100px', paddingBottom: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
        <p>© 2026 NanaOne. All models integrated from private elite endpoints.</p>
      </footer>
    </main>
  );
}
