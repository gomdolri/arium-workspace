'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useApp();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const ok = await login(email, password);
    if (ok) {
      router.push('/dashboard');
    } else {
      setError('이메일 또는 비밀번호가 올바르지 않습니다');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #F7F7F7 0%, #EFEFEF 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {/* Orange accent blob */}
      <div style={{
        position: 'fixed', top: -150, right: -150,
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,98,0,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'fixed', bottom: -100, left: -100,
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,98,0,0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: 400, padding: '0 24px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: 'linear-gradient(135deg, #FF6200, #CC4E00)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 8px 32px rgba(255,98,0,0.25)',
          }}>
            <span style={{ color: '#fff', fontWeight: 900, fontSize: 24 }}>A</span>
          </div>
          <h1 style={{ color: '#111111', fontSize: 24, fontWeight: 800, letterSpacing: 4 }}>
            ARIUM
          </h1>
          <p style={{ color: '#BBBBBB', fontSize: 12, marginTop: 4, letterSpacing: 2 }}>WORKSPACE</p>
        </div>

        {/* Form */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #EBEBEB',
          borderRadius: 20,
          padding: 32,
          boxShadow: '0 4px 40px rgba(0,0,0,0.06)',
        }}>
          <h2 style={{ color: '#111111', fontSize: 16, fontWeight: 600, marginBottom: 24 }}>
            팀 워크스페이스 로그인
          </h2>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ color: '#AAAAAA', fontSize: 11, display: 'block', marginBottom: 6 }}>
                이메일
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@arium.kr"
                required
                style={{
                  width: '100%', background: '#F7F7F7', border: '1px solid #EBEBEB',
                  borderRadius: 10, padding: '11px 14px', color: '#111111',
                  fontSize: 13, outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ color: '#AAAAAA', fontSize: 11, display: 'block', marginBottom: 6 }}>
                비밀번호
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%', background: '#F7F7F7', border: '1px solid #EBEBEB',
                  borderRadius: 10, padding: '11px 14px', color: '#111111',
                  fontSize: 13, outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>

            {error && (
              <p style={{
                color: '#EF4444', fontSize: 12, marginBottom: 16,
                background: 'rgba(239,68,68,0.06)', padding: '8px 12px',
                borderRadius: 8, border: '1px solid rgba(239,68,68,0.15)',
              }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '12px',
                background: loading ? '#E5E5E5' : 'linear-gradient(135deg, #FF6200, #CC4E00)',
                border: 'none', borderRadius: 10, color: loading ? '#AAAAAA' : '#fff',
                fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                letterSpacing: 1,
                boxShadow: loading ? 'none' : '0 4px 20px rgba(255,98,0,0.25)',
              }}>
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
