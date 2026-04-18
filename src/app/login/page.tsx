'use client';

import { signIn } from 'next-auth/react';
import { ArrowRight, ShieldCheck, Zap, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: '#0a0a0a' }}>
      {/* Background Glows */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '-10%',
        width: '40%',
        height: '40%',
        background: 'radial-gradient(circle, rgba(124, 58, 237, 0.15) 0%, transparent 70%)',
        filter: 'blur(80px)',
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-10%',
        right: '-10%',
        width: '40%',
        height: '40%',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
        filter: 'blur(80px)',
        zIndex: 0
      }} />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="glass-card w-full max-w-md relative z-10"
        style={{ padding: '48px', textAlign: 'center' }}
      >
        <div style={{ marginBottom: '32px' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))', 
            borderRadius: '16px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 24px',
            boxShadow: '0 0 20px rgba(124, 58, 237, 0.3)'
          }}>
            <ShieldCheck size={32} color="white" />
          </div>
          <h1 className="title-gradient" style={{ fontSize: '2rem', marginBottom: '12px' }}>Welcome Back</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Sign in to access your NanaOne dashboard</p>
        </div>

        <button 
          onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
          className="btn-primary w-full"
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '12px', 
            padding: '16px', 
            fontSize: '1rem',
            background: 'white',
            color: 'black',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: 600,
            transition: 'all 0.2s'
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.041-1.416-4.041-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          Continue with GitHub
          <ArrowRight size={18} />
        </button>

        <div style={{ marginTop: '32px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          <div style={{ textAlign: 'center' }}>
            <Zap size={20} style={{ color: 'var(--primary)', marginBottom: '8px', margin: '0 auto' }} />
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Ultra Fast</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <ShieldCheck size={20} style={{ color: 'var(--secondary)', marginBottom: '8px', margin: '0 auto' }} />
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Secure Auth</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Globe size={20} style={{ color: 'var(--primary)', marginBottom: '8px', margin: '0 auto' }} />
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Edge Ready</p>
          </div>
        </div>

        <p style={{ marginTop: '40px', fontSize: '0.75rem', color: 'var(--text-muted)', opacity: 0.6 }}>
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
}
