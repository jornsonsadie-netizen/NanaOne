'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, RefreshCw, Save, ArrowLeft, Globe, Key, Zap, Users, ShieldOff, ShieldCheck } from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const [endpoint, setEndpoint] = useState('');
  const [key, setKey] = useState('');
  const [contextLimit, setContextLimit] = useState(16000);
  const [maxOutputTokens, setMaxOutputTokens] = useState(4000);
  const [saving, setSaving] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userFilter, setUserFilter] = useState<'all' | 'flagged' | 'banned'>('all');
  const [bannedIPs, setBannedIPs] = useState<any[]>([]);

  useEffect(() => {
    const access = localStorage.getItem('admin_access');
    if (access !== 'true') {
      router.push('/');
      return;
    }

    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        setEndpoint(data.upstreamEndpoint || '');
        setKey(data.upstreamKey || '');
        setContextLimit(data.contextLimit || 16000);
        setMaxOutputTokens(data.maxOutputTokens || 4000);
      });

    fetchLogs();
    fetchUsers();
    fetchBannedIPs();
    const interval = setInterval(() => { fetchLogs(); fetchUsers(); fetchBannedIPs(); }, 5000);
    return () => clearInterval(interval);
  }, [router]);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/logs');
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (e: any) {
      console.error('Logs fetch failed');
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) setAllUsers(await res.json());
    } catch (e: any) {
      console.error('Users fetch failed');
    }
  };

  const fetchBannedIPs = async () => {
    try {
      const res = await fetch('/api/admin/ip-bans');
      if (res.ok) setBannedIPs(await res.json());
    } catch (e: any) {
      console.error('IP bans fetch failed');
    }
  };

  const handleUnbanIP = async (ip: string) => {
    await fetch('/api/admin/ip-bans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ip, action: 'unban' }),
    });
    await fetchBannedIPs();
  };

  const handleUserAction = async (userId: string, action: 'ban' | 'unban', reason?: string) => {
    await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, action, reason }),
    });
    await fetchUsers();
  };

  const handleSave = async () => {
    setSaving(true);
    await fetch('/api/admin/settings', {
      method: 'POST',
      body: JSON.stringify({ endpoint, key, contextLimit, maxOutputTokens }),
    });
    setSaving(false);
    alert('Settings saved and models refreshed!');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px' }}>
      <button 
        onClick={() => router.push('/')}
        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '24px' }}
      >
        <ArrowLeft size={16} /> Back to Landing
      </button>

      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
          <Settings className="title-gradient" />
          <h2 className="title-gradient">Provider Configuration</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Globe size={14} /> Upstream API Endpoint
            </label>
            <input 
              className="input-field" 
              value={endpoint} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEndpoint(e.target.value)}
              placeholder="https://api.openai.com/v1"
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Key size={14} /> Upstream API Key
            </label>
            <input 
              type="password"
              className="input-field" 
              value={key} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setKey(e.target.value)}
              placeholder="sk-..."
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RefreshCw size={14} /> Context Limit (Tokens)
              </label>
              <input 
                type="number"
                className="input-field" 
                value={contextLimit} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContextLimit(parseInt(e.target.value))}
                placeholder="16000"
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RefreshCw size={14} /> Max Output Tokens
              </label>
              <input 
                type="number"
                className="input-field" 
                value={maxOutputTokens} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMaxOutputTokens(parseInt(e.target.value))}
                placeholder="4000"
              />
            </div>
          </div>

          <button 
            className="btn-primary" 
            onClick={handleSave} 
            disabled={saving}
            style={{ marginTop: '12px' }}
          >
            {saving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
            {saving ? 'Saving...' : 'Save & Refresh Models'}
          </button>
        </div>
      </div>

      <div className="glass-card" style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <Key className="title-gradient" />
          <h2 className="title-gradient">Redeem Codes</h2>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
          <input 
            type="text" 
            className="input-field" 
            placeholder="Code Name (Optional)" 
            id="customCode"
            style={{ width: '200px' }}
          />
          <input 
            type="number" 
            className="input-field" 
            placeholder="Amount ($)" 
            id="codeAmount"
            style={{ width: '150px' }}
          />
          <button className="btn-primary" onClick={async () => {
            const customCode = (document.getElementById('customCode') as HTMLInputElement).value;
            const amount = (document.getElementById('codeAmount') as HTMLInputElement).value;
            if (!amount) return alert('Enter amount');
            const res = await fetch('/api/admin/redeem-codes', {
              method: 'POST',
              body: JSON.stringify({ amount, customCode })
            });
            const data = await res.json();
            if (data.error) return alert(data.error);
            alert(`Code Created: ${data.code}`);
            window.location.reload();
          }}>
            Generate Code
          </button>
        </div>

        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
           <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Latest codes are generated above. Check database for full list.</p>
        </div>
      </div>

      <div className="glass-card" style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <Zap className="title-gradient" />
          <h2 className="title-gradient">System Curation Logs</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {logs.length > 0 ? logs.map((log: any) => (
            <div key={log.id} style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--glass-border)', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{new Date(log.createdAt).toLocaleString()}</span>
                  <span className="badge" style={{ fontSize: '0.65rem' }}>ID: {log.requestId?.substring(0, 8)}</span>
                </div>
                <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
                  {log.originalTokens > log.curatedTokens ? `-${(((log.originalTokens - log.curatedTokens) / log.originalTokens) * 100).toFixed(0)}% Shrunk` : 'No Shrink'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Tokens:</span> {log.originalTokens} → <span style={{ color: 'var(--primary)' }}>{log.curatedTokens}</span>
                </div>
                <button 
                  onClick={() => setSelectedLog(selectedLog?.id === log.id ? null : log)}
                  style={{ background: 'rgba(124, 58, 237, 0.1)', border: '1px solid rgba(124, 58, 237, 0.2)', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.75rem', padding: '4px 12px', borderRadius: '6px' }}
                >
                  {selectedLog?.id === log.id ? 'Hide Trace' : 'View Trace'}
                </button>
              </div>
              {selectedLog?.id === log.id && (
                <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', fontSize: '0.75rem', border: '1px solid rgba(124, 58, 237, 0.2)', fontFamily: 'monospace' }}>
                  <p style={{ marginBottom: '12px', color: 'var(--primary)', fontWeight: 600, fontSize: '0.8rem' }}>Step-by-Step Execution:</p>
                  {JSON.parse(log.curationSteps).map((step: any, i: number) => (
                    <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '6px', color: step.error ? '#ff4d4d' : 'var(--text-muted)' }}>
                      <span style={{ opacity: 0.5, whiteSpace: 'nowrap' }}>{step.time.split('T')[1].split('.')[0]}</span>
                      <span style={{ color: step.error ? '#ff4d4d' : 'var(--text)' }}>{step.step}</span>
                    </div>
                  ))}
                  <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>
                    Provider: {log.modelUsed}
                  </div>
                </div>
              )}
            </div>
          )) : (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              <RefreshCw className="animate-spin" style={{ margin: '0 auto 12px' }} />
              <p>Waiting for system activity...</p>
            </div>
          )}
        </div>
      </div>

      <div className="glass-card" style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <Users className="title-gradient" />
          <h2 className="title-gradient">User Management</h2>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          {(['all', 'flagged', 'banned'] as const).map(f => (
            <button key={f} onClick={() => setUserFilter(f)} style={{
              padding: '6px 14px', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer',
              background: userFilter === f ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${userFilter === f ? 'rgba(124,58,237,0.6)' : 'var(--glass-border)'}`,
              color: userFilter === f ? 'var(--primary)' : 'var(--text-muted)',
            }}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
          <button onClick={fetchUsers} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <RefreshCw size={14} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '400px', overflowY: 'auto' }}>
          {allUsers
            .filter(u => userFilter === 'all' ? true : userFilter === 'banned' ? u.banned : (u.abuseFlagCount > 0 && !u.banned))
            .map(u => (
            <div key={u.id} style={{
              padding: '12px 16px', borderRadius: '10px',
              background: u.banned ? 'rgba(255,77,77,0.07)' : u.abuseFlagCount > 0 ? 'rgba(255,165,0,0.07)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${u.banned ? 'rgba(255,77,77,0.25)' : u.abuseFlagCount > 0 ? 'rgba(255,165,0,0.25)' : 'var(--glass-border)'}`,
              fontSize: '0.82rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontFamily: 'monospace', color: 'var(--text-muted)', fontSize: '0.75rem' }}>{u.apiKey?.substring(0, 20)}...</span>
                  {u.email && <span style={{ marginLeft: '8px', color: 'var(--text-muted)' }}>{u.email}</span>}
                  {u.banned && <span style={{ marginLeft: '8px', color: '#ff4d4d', fontSize: '0.75rem' }}>BANNED</span>}
                  {!u.banned && u.abuseFlagCount > 0 && <span style={{ marginLeft: '8px', color: 'orange', fontSize: '0.75rem' }}>{u.abuseFlagCount} FLAG(S)</span>}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => setSelectedUser(selectedUser?.id === u.id ? null : u)} style={{
                    background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
                    color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.72rem', padding: '3px 10px', borderRadius: '6px',
                  }}>
                    {selectedUser?.id === u.id ? 'Hide' : 'Details'}
                  </button>
                  {u.banned ? (
                    <button onClick={() => handleUserAction(u.id, 'unban')} style={{
                      background: 'rgba(0,200,100,0.1)', border: '1px solid rgba(0,200,100,0.3)',
                      color: '#00c864', cursor: 'pointer', fontSize: '0.72rem', padding: '3px 10px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px',
                    }}>
                      <ShieldCheck size={11} /> Unban
                    </button>
                  ) : (
                    <button onClick={() => {
                      const reason = prompt('Ban reason (optional):') ?? 'Manually banned by admin';
                      handleUserAction(u.id, 'ban', reason);
                    }} style={{
                      background: 'rgba(255,77,77,0.1)', border: '1px solid rgba(255,77,77,0.3)',
                      color: '#ff4d4d', cursor: 'pointer', fontSize: '0.72rem', padding: '3px 10px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px',
                    }}>
                      <ShieldOff size={11} /> Ban
                    </button>
                  )}
                </div>
              </div>

              {selectedUser?.id === u.id && (
                <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                  <div style={{ color: 'var(--text-muted)', marginBottom: '6px' }}>ID: {u.id} | Balance: ${u.balance?.toFixed(4)} daily + ${u.oneTimeBalance?.toFixed(4)} one-time</div>
                  {u.banReason && <div style={{ color: '#ff4d4d', marginBottom: '6px' }}>Ban reason: {u.banReason}</div>}
                  {u.abuseFlags && u.abuseFlags !== 'null' && (
                    <div>
                      <div style={{ color: 'orange', marginBottom: '4px' }}>Abuse flags:</div>
                      {(() => {
                        try {
                          const flags = JSON.parse(u.abuseFlags);
                          return Array.isArray(flags) ? flags.map((f: any, i: number) => (
                            <div key={i} style={{ color: 'var(--text-muted)', paddingLeft: '8px' }}>
                              {f.time?.split('T')[1]?.split('.')[0] || 'Unknown'} — {f.reason}
                            </div>
                          )) : null;
                        } catch {
                          return null;
                        }
                      })()}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          {allUsers.filter(u => userFilter === 'all' ? true : userFilter === 'banned' ? u.banned : (u.abuseFlagCount > 0 && !u.banned)).length === 0 && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '20px' }}>No users in this category.</p>
          )}
        </div>
      </div>

      <div className="glass-card" style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <ShieldOff className="title-gradient" />
          <h2 className="title-gradient">Security & IP Banning</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
          {bannedIPs.length > 0 ? bannedIPs.map(b => (
            <div key={b.ip} style={{
              padding: '12px 16px', borderRadius: '10px',
              background: 'rgba(255,77,77,0.07)',
              border: '1px solid rgba(255,77,77,0.25)',
              fontSize: '0.82rem',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <span style={{ fontWeight: 600, color: 'var(--text)' }}>{b.ip}</span>
                <span style={{ marginLeft: '12px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>{b.reason}</span>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px' }}>Banned on: {new Date(b.createdAt).toLocaleString()}</div>
              </div>
              <button onClick={() => handleUnbanIP(b.ip)} style={{
                background: 'rgba(0,200,100,0.1)', border: '1px solid rgba(0,200,100,0.3)',
                color: '#00c864', cursor: 'pointer', fontSize: '0.72rem', padding: '4px 12px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px',
              }}>
                <ShieldCheck size={12} /> Lift Ban
              </button>
            </div>
          )) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '20px' }}>No active IP bans. System secure.</p>
          )}
        </div>
        <p style={{ marginTop: '16px', fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
          Note: Honeypot triggers (e.g. visiting /.env) will automatically appear here.
        </p>
      </div>

      <div className="glass-card" style={{ marginTop: '24px', opacity: 0.7 }}>
        <h4 style={{ marginBottom: '12px', fontSize: '0.9rem' }}>System Info</h4>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
          <span>Version</span>
          <span>NanaOne v1.0.0</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginTop: '8px' }}>
          <span>Pricing</span>
          <span>$15/1M Input, $75/1M Output</span>
        </div>
      </div>
    </div>
  );
}
