import { useState, useEffect } from 'react';
import axios from 'axios';

const API = axios.create({
  baseURL: 'https://anime-explorer-backend.onrender.com/api',
  withCredentials: true
});

interface Anime {
  mal_id: number;
  title: string;
  images: { jpg: { image_url: string } };
  score: number;
  synopsis: string;
  episodes: number;
}

function App() {
  const [isAuth, setIsAuth] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [query, setQuery] = useState('');
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [selected, setSelected] = useState<Anime | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [encryptKey, setEncryptKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const key = localStorage.getItem('encryptKey');
    if (key) {
      setEncryptKey(key);
      setIsAuth(true);
    }
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const res = await API.post(endpoint, { email, password });
      localStorage.setItem('encryptKey', res.data.encryptKey);
      setEncryptKey(res.data.encryptKey);
      setIsAuth(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error occurred');
    }
    setLoading(false);
  };

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const res = await axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(searchQuery)}&limit=12`);
      setAnimes(res.data.data);
      await API.post('/search/history', { query: searchQuery });
    } catch (err) {
      setError('Search failed');
    }
    setLoading(false);
  };

  const fetchHistory = async () => {
    try {
      const res = await API.get('/search/history');
      setHistory(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await API.get('/user/profile');
      const decrypted = await decrypt(res.data.encryptedProfile, encryptKey);
      setProfile(decrypted);
    } catch (err) {
      setError('Failed to load profile');
    }
  };

  const decrypt = async (encrypted: string, key: string) => {
    if (!encrypted || !key) throw new Error('Missing encrypted data or key');
    const parts = encrypted.split(':');
    if (parts.length !== 3) throw new Error('Invalid encrypted format');
    const [ivHex, tagHex, encHex] = parts;
    const iv = hexToBytes(ivHex);
    const tag = hexToBytes(tagHex);
    const enc = hexToBytes(encHex);
    // AES-GCM ciphertext expects ciphertext + tag concatenated
    const combined = new Uint8Array(enc.length + tag.length);
    combined.set(enc, 0);
    combined.set(tag, enc.length);

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(key),
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv, tagLength: 128 },
      cryptoKey,
      combined
    );

    return JSON.parse(new TextDecoder().decode(decrypted));
  };

  const hexToBytes = (hex: string) => {
    if (!hex) return new Uint8Array();
    const normalized = hex.length % 2 === 0 ? hex : '0' + hex;
    const bytes = new Uint8Array(normalized.length / 2);
    for (let i = 0; i < normalized.length; i += 2) {
      bytes[i / 2] = parseInt(normalized.substr(i, 2), 16);
    }
    return bytes;
  };

  const logout = async () => {
    try {
      await API.post('/auth/logout');
    } catch (err) {
      // ignore errors on logout
      console.warn(err);
    }
    localStorage.removeItem('encryptKey');
    setIsAuth(false);
    setAnimes([]);
    setProfile(null);
  };

  // 🎨 Design System: Consistent colors, shadows, and spacing
  const theme = {
    bg: {
      primary: 'linear-gradient(135deg, #0a0e27 0%, #1a1a2e 50%, #16213e 100%)', // Deep space gradient
      card: 'rgba(26, 26, 46, 0.6)', // Semi-transparent for glassmorphism
      cardHover: 'rgba(26, 26, 46, 0.9)',
      input: 'rgba(255, 255, 255, 0.04)',
      modal: 'rgba(10, 14, 39, 0.95)',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b8b8d1',
      muted: '#6b6b8c',
      accent: '#a78bfa', // Purple accent
    },
    accent: {
      purple: '#8b5cf6',
      purpleLight: '#a78bfa',
      purpleDark: '#6d28d9',
      neon: '#e879f9', // Neon pink
      cyan: '#06b6d4',
    },
    shadow: {
      sm: '0 2px 8px rgba(139, 92, 246, 0.08)',
      md: '0 4px 20px rgba(139, 92, 246, 0.12)',
      lg: '0 10px 40px rgba(139, 92, 246, 0.16)',
      glow: '0 0 20px rgba(139, 92, 246, 0.28)',
      neon: '0 0 30px rgba(232, 121, 249, 0.28)',
    },
  };

  // -------------------------
  // Authentication screen (glass + animated)
  // -------------------------
  if (!isAuth) {
    return (
      <div style={{
        minHeight: '100vh',
        background: theme.bg.primary,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Animated ambient glow */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(232, 121, 249, 0.06) 0%, transparent 50%)',
          animation: 'pulse 6s ease-in-out infinite',
        }} />

        <div style={{
          background: theme.bg.card,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '24px',
          border: '1px solid rgba(139, 92, 246, 0.12)',
          boxShadow: theme.shadow.lg,
          padding: '48px 40px',
          width: '100%',
          maxWidth: '440px',
          position: 'relative',
          zIndex: 1,
          animation: 'fadeInUp 0.6s ease-out',
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '60%',
            height: '2px',
            background: 'linear-gradient(90deg, transparent, #8b5cf6, transparent)',
            boxShadow: '0 0 20px rgba(139, 92, 246, 0.6)',
          }} />

          <h2 style={{
            fontSize: '36px',
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: '12px',
            background: 'linear-gradient(135deg, #ffffff 0%, #a78bfa 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.5px',
          }}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>

          <p style={{
            textAlign: 'center',
            color: theme.text.secondary,
            marginBottom: '36px',
            fontSize: '14px',
          }}>
            {isLogin ? 'Enter your credentials to continue' : 'Join the anime exploration'}
          </p>

          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.18)',
              color: '#fca5a5',
              padding: '14px 16px',
              borderRadius: '12px',
              marginBottom: '24px',
              fontSize: '14px',
              animation: 'shake 0.36s ease',
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  background: theme.bg.input,
                  border: '1px solid rgba(139, 92, 246, 0.12)',
                  borderRadius: '12px',
                  color: theme.text.primary,
                  fontSize: '15px',
                  outline: 'none',
                  transition: 'all 0.18s ease',
                }}
                onFocus={(e) => {
                  (e.target as HTMLInputElement).style.boxShadow = theme.shadow.glow;
                  (e.target as HTMLInputElement).style.borderColor = theme.accent.purple;
                }}
                onBlur={(e) => {
                  (e.target as HTMLInputElement).style.boxShadow = 'none';
                  (e.target as HTMLInputElement).style.borderColor = 'rgba(139, 92, 246, 0.12)';
                }}
              />
            </div>

            <div style={{ position: 'relative' }}>
              <input
                type="password"
                placeholder="Password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  background: theme.bg.input,
                  border: '1px solid rgba(139, 92, 246, 0.12)',
                  borderRadius: '12px',
                  color: theme.text.primary,
                  fontSize: '15px',
                  outline: 'none',
                  transition: 'all 0.18s ease',
                }}
                onFocus={(e) => {
                  (e.target as HTMLInputElement).style.boxShadow = theme.shadow.glow;
                  (e.target as HTMLInputElement).style.borderColor = theme.accent.purple;
                }}
                onBlur={(e) => {
                  (e.target as HTMLInputElement).style.boxShadow = 'none';
                  (e.target as HTMLInputElement).style.borderColor = 'rgba(139, 92, 246, 0.12)';
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '16px',
                background: loading ? theme.text.muted : `linear-gradient(135deg, ${theme.accent.purple} 0%, ${theme.accent.purpleDark} 100%)`,
                color: theme.text.primary,
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.18s ease',
                boxShadow: loading ? 'none' : theme.shadow.md,
                opacity: loading ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = theme.shadow.glow;
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = theme.shadow.md;
              }}
            >
              {loading ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255,255,255,0.28)',
                    borderTopColor: '#fff',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                    display: 'inline-block'
                  }} />
                  Processing...
                </span>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          <p style={{
            textAlign: 'center',
            marginTop: '28px',
            color: theme.text.secondary,
            fontSize: '14px',
          }}>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              style={{
                background: 'none',
                border: 'none',
                color: theme.accent.purpleLight,
                fontWeight: 600,
                cursor: 'pointer',
                textDecoration: 'none',
                transition: 'all 0.12s ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = theme.accent.neon;
                (e.currentTarget as HTMLButtonElement).style.textDecoration = 'underline';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = theme.accent.purpleLight;
                (e.currentTarget as HTMLButtonElement).style.textDecoration = 'none';
              }}
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

        <style>{`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-8px); }
            75% { transform: translateX(8px); }
          }
        `}</style>
      </div>
    );
  }

  // -------------------------
  // Main app UI
  // -------------------------
  return (
    <div style={{
      minHeight: '100vh',
      background: theme.bg.primary,
      padding: '20px',
      position: 'relative',
    }}>
      {/* Ambient background */}
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'radial-gradient(circle at 10% 20%, rgba(139, 92, 246, 0.06) 0%, transparent 50%), radial-gradient(circle at 90% 80%, rgba(232, 121, 249, 0.05) 0%, transparent 50%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: '1600px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '40px',
          flexWrap: 'wrap',
          gap: '20px',
          animation: 'fadeInUp 0.6s ease-out',
        }}>
          <h1 style={{
            fontSize: '42px',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #ffffff 0%, #a78bfa 50%, #e879f9 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-1px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <span style={{ fontSize: '48px' }}>🎌</span>
            Anime Explorer
          </h1>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              onClick={fetchProfile}
              style={{
                padding: '12px 24px',
                background: theme.bg.card,
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(139, 92, 246, 0.12)',
                borderRadius: '12px',
                color: theme.accent.purpleLight,
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                boxShadow: theme.shadow.sm,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = theme.bg.cardHover;
                (e.currentTarget as HTMLButtonElement).style.borderColor = theme.accent.purple;
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = theme.shadow.md;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = theme.bg.card;
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(139, 92, 246, 0.12)';
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = theme.shadow.sm;
              }}
            >
              👤 Profile
            </button>

            <button
              onClick={logout}
              style={{
                padding: '12px 24px',
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.16)',
                borderRadius: '12px',
                color: '#fca5a5',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.18s ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239, 68, 68, 0.14)';
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#ef4444';
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239, 68, 68, 0.08)';
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(239, 68, 68, 0.16)';
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
              }}
            >
              🚪 Logout
            </button>
          </div>
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); handleSearch(query); setShowHistory(false); }}
          style={{
            marginBottom: '50px',
            position: 'relative',
            animation: 'fadeInUp 0.7s ease-out',
          }}
        >
          <div style={{ display: 'flex', gap: '12px', maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => { setShowHistory(true); fetchHistory(); }}
                onBlur={() => setTimeout(() => setShowHistory(false), 200)}
                placeholder="Search for anime... (e.g., Naruto, One Piece)"
                style={{
                  width: '100%',
                  padding: '20px 28px',
                  background: theme.bg.card,
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(139, 92, 246, 0.12)',
                  borderRadius: '16px',
                  color: theme.text.primary,
                  fontSize: '17px',
                  outline: 'none',
                  transition: 'all 0.18s ease',
                  boxShadow: theme.shadow.sm,
                }}
                onFocusCapture={(e) => {
                  (e.target as HTMLInputElement).style.borderColor = theme.accent.purple;
                  (e.target as HTMLInputElement).style.boxShadow = theme.shadow.glow;
                  (e.target as HTMLInputElement).style.background = 'rgba(139, 92, 246, 0.04)';
                }}
                onBlurCapture={(e) => {
                  (e.target as HTMLInputElement).style.borderColor = 'rgba(139, 92, 246, 0.12)';
                  (e.target as HTMLInputElement).style.boxShadow = theme.shadow.sm;
                  (e.target as HTMLInputElement).style.background = theme.bg.card;
                }}
              />

              {showHistory && history.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 12px)',
                  left: 0,
                  right: 0,
                  background: theme.bg.modal,
                  backdropFilter: 'blur(18px)',
                  border: '1px solid rgba(139, 92, 246, 0.12)',
                  borderRadius: '16px',
                  boxShadow: theme.shadow.lg,
                  zIndex: 10,
                  overflow: 'hidden',
                  animation: 'slideDown 0.28s ease-out',
                }}>
                  <div style={{
                    padding: '12px 20px',
                    borderBottom: '1px solid rgba(139, 92, 246, 0.06)',
                    color: theme.text.secondary,
                    fontSize: '13px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    Recent Searches
                  </div>
                  {history.map((h, idx) => (
                    <div
                      key={h._id || idx}
                      onClick={() => { setQuery(h.query); handleSearch(h.query); }}
                      style={{
                        padding: '16px 20px',
                        cursor: 'pointer',
                        borderBottom: idx < history.length - 1 ? '1px solid rgba(139, 92, 246, 0.04)' : 'none',
                        transition: 'all 0.12s ease',
                        color: theme.text.primary,
                        fontSize: '15px',
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLDivElement).style.background = 'rgba(139, 92, 246, 0.06)';
                        (e.currentTarget as HTMLDivElement).style.paddingLeft = '28px';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                        (e.currentTarget as HTMLDivElement).style.paddingLeft = '20px';
                      }}
                    >
                      🔍 {h.query}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '20px 40px',
                background: loading ? theme.text.muted : `linear-gradient(135deg, ${theme.accent.purple} 0%, ${theme.accent.neon} 100%)`,
                border: 'none',
                borderRadius: '16px',
                color: theme.text.primary,
                fontSize: '16px',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.18s ease',
                boxShadow: loading ? 'none' : theme.shadow.md,
                opacity: loading ? 0.7 : 1,
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-3px) scale(1.02)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = theme.shadow.neon;
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0) scale(1)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = theme.shadow.md;
              }}
            >
              {loading ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    width: '18px',
                    height: '18px',
                    border: '2px solid rgba(255,255,255,0.28)',
                    borderTopColor: '#fff',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                    display: 'inline-block'
                  }} />
                  Searching...
                </span>
              ) : '🔍 Search'}
            </button>
          </div>
        </form>

        {animes.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '28px',
            animation: 'fadeInUp 0.8s ease-out',
          }}>
            {animes.map((anime, idx) => (
              <div
                key={anime.mal_id}
                onClick={() => setSelected(anime)}
                style={{
                  background: theme.bg.card,
                  backdropFilter: 'blur(10px)',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.36s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: '1px solid rgba(139, 92, 246, 0.08)',
                  boxShadow: theme.shadow.sm,
                  position: 'relative',
                  animation: `scaleIn 0.5s ease-out ${idx * 0.04}s both`,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-12px) scale(1.03)';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = theme.shadow.lg;
                  (e.currentTarget as HTMLDivElement).style.borderColor = theme.accent.purple;
                  (e.currentTarget as HTMLDivElement).style.zIndex = '10';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0) scale(1)';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = theme.shadow.sm;
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(139, 92, 246, 0.08)';
                  (e.currentTarget as HTMLDivElement).style.zIndex = '1';
                }}
              >
                <div style={{ position: 'relative', overflow: 'hidden', height: '360px' }}>
                  <img
                    src={anime.images.jpg.image_url}
                    alt={anime.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.4s ease',
                      display: 'block',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.08)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)';
                    }}
                  />

                  {/* Gradient overlay for readability */}
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '55%',
                    background: 'linear-gradient(to top, rgba(10,14,39,0.95) 0%, rgba(10,14,39,0.5) 40%, rgba(10,14,39,0) 100%)',
                    pointerEvents: 'none',
                  }} />
                </div>

                {/* Card content */}
                <div style={{ padding: '20px' }}>
                  <h3 style={{
                    fontWeight: 700,
                    fontSize: '18px',
                    marginBottom: '12px',
                    color: theme.text.primary,
                    lineHeight: 1.4,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical' as any,
                    overflow: 'hidden',
                    minHeight: '50px',
                  }}>
                    {anime.title}
                  </h3>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      background: 'linear-gradient(135deg, rgba(251,191,36,0.06) 0%, rgba(245,158,11,0.04) 100%)',
                      border: '1px solid rgba(251,191,36,0.08)',
                      borderRadius: '8px',
                      color: '#fbbf24',
                      fontWeight: 700,
                      fontSize: '15px',
                    }}>
                      ⭐ {anime.score || 'N/A'}
                    </span>

                    <span style={{
                      color: theme.text.secondary,
                      fontSize: '14px',
                      fontWeight: 600,
                    }}>
                      {anime.episodes ?? '?'} eps
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Anime detail modal */}
        {selected && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
              zIndex: 50,
              animation: 'fadeIn 0.28s ease-out',
            }}
            onClick={() => setSelected(null)}
          >
            <div
              style={{
                background: theme.bg.modal,
                backdropFilter: 'blur(30px)',
                borderRadius: '28px',
                maxWidth: '700px',
                width: '100%',
                maxHeight: '85vh',
                overflow: 'auto',
                border: '1px solid rgba(139, 92, 246, 0.12)',
                boxShadow: `0 20px 60px rgba(139, 92, 246, 0.16)`,
                animation: 'scaleIn 0.36s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{
                position: 'absolute',
                top: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '80%',
                height: '3px',
                background: 'linear-gradient(90deg, transparent, #8b5cf6, #e879f9, transparent)',
                boxShadow: '0 0 30px rgba(139, 92, 246, 0.6)',
              }} />

              <div style={{ padding: '40px' }}>
                <div style={{ marginBottom: '28px' }}>
                  <h2 style={{
                    fontSize: '32px',
                    fontWeight: 800,
                    marginBottom: '8px',
                    background: 'linear-gradient(135deg, #ffffff 0%, #a78bfa 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    lineHeight: 1.3,
                  }}>
                    {selected.title}
                  </h2>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: '16px',
                  marginBottom: '32px',
                }}>
                  <div style={{
                    padding: '16px',
                    background: 'rgba(139, 92, 246, 0.06)',
                    border: '1px solid rgba(139, 92, 246, 0.08)',
                    borderRadius: '16px',
                  }}>
                    <div style={{
                      fontSize: '13px',
                      color: theme.text.secondary,
                      marginBottom: '6px',
                      fontWeight: 600,
                    }}>
                      Score
                    </div>
                    <div style={{
                      fontSize: '24px',
                      fontWeight: 700,
                      color: '#fbbf24',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}>
                      ⭐ {selected.score || 'N/A'}
                    </div>
                  </div>

                  <div style={{
                    padding: '16px',
                    background: 'rgba(232, 121, 249, 0.06)',
                    border: '1px solid rgba(232, 121, 249, 0.08)',
                    borderRadius: '16px',
                  }}>
                    <div style={{
                      fontSize: '13px',
                      color: theme.text.secondary,
                      marginBottom: '6px',
                      fontWeight: 600,
                    }}>
                      Episodes
                    </div>
                    <div style={{
                      fontSize: '24px',
                      fontWeight: 700,
                      color: theme.accent.neon,
                    }}>
                      {selected.episodes ?? 'Unknown'}
                    </div>
                  </div>
                </div>

                <div style={{
                  padding: '24px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '16px',
                  border: '1px solid rgba(139, 92, 246, 0.05)',
                  marginBottom: '28px',
                }}>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: 700,
                    color: theme.accent.purpleLight,
                    marginBottom: '14px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    Synopsis
                  </h3>
                  <p style={{
                    color: theme.text.secondary,
                    lineHeight: 1.8,
                    fontSize: '15px',
                  }}>
                    {selected.synopsis || 'No synopsis available.'}
                  </p>
                </div>

                <button
                  onClick={() => setSelected(null)}
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: `linear-gradient(135deg, ${theme.accent.purple} 0%, ${theme.accent.purpleDark} 100%)`,
                    border: 'none',
                    borderRadius: '14px',
                    color: theme.text.primary,
                    fontSize: '16px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                    boxShadow: theme.shadow.md,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = theme.shadow.glow;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = theme.shadow.md;
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Profile modal */}
        {profile && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
              zIndex: 50,
              animation: 'fadeIn 0.28s ease-out',
            }}
            onClick={() => setProfile(null)}
          >
            <div
              style={{
                background: theme.bg.modal,
                backdropFilter: 'blur(30px)',
                borderRadius: '28px',
                padding: '48px',
                maxWidth: '550px',
                width: '100%',
                border: '1px solid rgba(139, 92, 246, 0.12)',
                boxShadow: `0 20px 60px rgba(139, 92, 246, 0.16)`,
                animation: 'scaleIn 0.36s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{
                position: 'absolute',
                top: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '60%',
                height: '3px',
                background: 'linear-gradient(90deg, transparent, #8b5cf6, transparent)',
                boxShadow: '0 0 30px rgba(139, 92, 246, 0.6)',
              }} />

              <h2 style={{
                fontSize: '32px',
                fontWeight: 800,
                marginBottom: '32px',
                textAlign: 'center',
                background: 'linear-gradient(135deg, #ffffff 0%, #a78bfa 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Your Profile
              </h2>

              <div style={{
                padding: '20px',
                background: 'rgba(139, 92, 246, 0.06)',
                borderRadius: '16px',
                marginBottom: '16px',
                border: '1px solid rgba(139, 92, 246, 0.06)',
              }}>
                <div style={{
                  fontSize: '13px',
                  color: theme.text.secondary,
                  marginBottom: '6px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  Email Address
                </div>
                <div style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  color: theme.text.primary,
                }}>
                  {profile.email}
                </div>
              </div>

              <div style={{
                padding: '20px',
                background: 'rgba(232, 121, 249, 0.06)',
                borderRadius: '16px',
                marginBottom: '28px',
                border: '1px solid rgba(232, 121, 249, 0.06)',
              }}>
                <div style={{
                  fontSize: '13px',
                  color: theme.text.secondary,
                  marginBottom: '6px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  Member Since
                </div>
                <div style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  color: theme.text.primary,
                }}>
                  {profile.joined}
                </div>
              </div>

              <div style={{
                padding: '20px',
                background: 'linear-gradient(135deg, rgba(16,185,129,0.04) 0%, rgba(5,150,105,0.04) 100%)',
                borderRadius: '16px',
                border: '1px solid rgba(16,185,129,0.06)',
                marginBottom: '28px',
              }}>
                <p style={{
                  fontSize: '14px',
                  color: '#6ee7b7',
                  lineHeight: 1.6,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                }}>
                  <span style={{ fontSize: '20px' }}>🔒</span>
                  <span>
                    Your data is protected with <strong>AES-256-GCM encryption</strong>. All information is encrypted server-side and decrypted securely in your browser using the Web Crypto API.
                  </span>
                </p>
              </div>

              <button
                onClick={() => setProfile(null)}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: `linear-gradient(135deg, ${theme.accent.purple} 0%, ${theme.accent.purpleDark} 100%)`,
                  border: 'none',
                  borderRadius: '14px',
                  color: theme.text.primary,
                  fontSize: '16px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  boxShadow: theme.shadow.md,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = theme.shadow.glow;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = theme.shadow.md;
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; } to { opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; } 50% { opacity: 0.5; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

export default App;
