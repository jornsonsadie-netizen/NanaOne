'use client';

import { useState, useEffect } from 'react';
import { Key, Copy, Check, Info, Zap, Layout, ArrowLeft, RefreshCw, Loader2, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

export default function Dashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [user, setUser] = useState<any>(null);
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [inputKey, setInputKey] = useState('');

  useEffect(() => {
    if (status === 'authenticated') {
      fetchUser();
      fetchModels();
    } else if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status]);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/user');
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
    } catch (e) {
      console.error('User fetch failed');
    } finally {
      setLoading(false);
    }
  };

  const fetchModels = async () => {
    try {
      const res = await fetch('/v1/models');
      if (res.ok) {
        const data = await res.json();
        setModels(data.data || []);
      }
    } catch (e) {
      console.error('Models fetch failed');
    }
  };

  const copyToClipboard = () => {
    if (!user?.apiKey) return;
    navigator.clipboard.writeText(user.apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading && !user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Loader2 className="animate-spin" style={{ color: 'var(--primary)' }} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '20px' }}>
      <button 
        onClick={() => router.push('/')}
        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '24px' }}
      >
        <ArrowLeft size={16} /> Back to Home
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 className="title-gradient" style={{ marginBottom: 0 }}>API Identity</h2>
              <button 
                onClick={() => signOut({ callbackUrl: '/login' })}
                style={{ 
                  background: 'rgba(255, 255, 255, 0.05)', 
                  border: '1px solid var(--glass-border)', 
                  color: 'var(--text-muted)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  cursor: 'pointer',
                  padding: '8px 16px',
                  borderRadius: '12px',
                  fontSize: '0.85rem',
                  transition: 'all 0.2s'
                }}
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
            
            {!user ? (
               <div style={{ textAlign: 'center', padding: '20px' }}>
                 <Loader2 className="animate-spin" style={{ margin: '0 auto', color: 'var(--primary)' }} />
                 <p style={{ color: 'var(--text-muted)', marginTop: '12px' }}>Provisioning access...</p>
               </div>
            ) : (
              <div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Your NanaOne API Key</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input 
                      className="input-field" 
                      readOnly 
                      value={user.apiKey} 
                      style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}
                    />
                    <button className="btn-primary" onClick={copyToClipboard} style={{ padding: '0 16px' }}>
                      {copied ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Daily Allowance</p>
                    <p style={{ fontSize: '1.25rem', fontWeight: 600 }}>$20.00</p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Remaining: ${user.balance?.toFixed(4)}</p>
                  </div>
                  <div style={{ background: 'rgba(124, 58, 237, 0.1)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(124, 58, 237, 0.2)' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--primary)', marginBottom: '4px' }}>One-Time Credits</p>
                    <p style={{ fontSize: '1.25rem', fontWeight: 600 }}>${user.oneTimeBalance?.toFixed(4)}</p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--primary)' }}>Non-resetting</p>
                  </div>
                </div>

                <div className="glass-card" style={{ background: 'rgba(255,255,255,0.02)', borderStyle: 'dashed' }}>
                  <p style={{ fontSize: '0.85rem', marginBottom: '12px' }}>Redeem Credit Code</p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input 
                      className="input-field" 
                      placeholder="Enter NANA-XXXX..." 
                      value={inputKey}
                      onChange={(e) => setInputKey(e.target.value)}
                    />
                    <button className="btn-primary" onClick={async () => {
                      if (!inputKey) return;
                      const res = await fetch('/api/user/redeem', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ code: inputKey, apiKey: user.apiKey })
                      });
                      const data = await res.json();
                      if (data.success) {
                        alert(`Successfully redeemed $${data.amount}!`);
                        await fetchUser();
                        setInputKey('');
                      } else {
                        alert(data.error);
                      }
                    }}>
                      Redeem
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Layout size={20} /> Available Models</h3>
              <button 
                onClick={fetchModels}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <RefreshCw size={14} />
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto', paddingRight: '4px' }}>
              {models.length > 0 ? models.map((m: any) => (
                <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                  <span style={{ fontSize: '0.9rem' }}>{m.id}</span>
                  <span className="badge" style={{ fontSize: '0.7rem' }}>OpenAI Compatible</span>
                </div>
              )) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center' }}>No models found. Configure provider in admin panel.</p>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1), transparent)' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}><Zap size={18} /> Quick Start</h4>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              <p>1. Copy your API key.</p>
              <p>2. Set Base URL to:</p>
              <code style={{ display: 'block', padding: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', margin: '8px 0', fontSize: '0.75rem' }}>
                {typeof window !== 'undefined' ? `${window.location.origin}/v1` : '.../v1'}
              </code>
              <p>3. Use any model from the list.</p>
            </div>
          </div>

          <div className="glass-card">
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}><Info size={18} /> Pricing</h4>
            <table style={{ width: '100%', fontSize: '0.8rem' }}>
              <tbody>
                <tr>
                  <td style={{ color: 'var(--text-muted)', padding: '4px 0' }}>Input</td>
                  <td style={{ textAlign: 'right' }}>$15 / 1M tokens</td>
                </tr>
                <tr>
                  <td style={{ color: 'var(--text-muted)', padding: '4px 0' }}>Output</td>
                  <td style={{ textAlign: 'right' }}>$75 / 1M tokens</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
