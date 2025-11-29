import { useState, useEffect } from 'react';
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
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
      const res = await axios.get(`https://api.jikan.moe/v4/anime?q=${searchQuery}&limit=12`);
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
    const [ivHex, tagHex, encHex] = encrypted.split(':');
    const iv = hexToBytes(ivHex);
    const tag = hexToBytes(tagHex);
    const enc = hexToBytes(encHex);
    const combined = new Uint8Array([...enc, ...tag]);
    
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
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return bytes;
  };

  const logout = async () => {
    await API.post('/auth/logout');
    localStorage.removeItem('encryptKey');
    setIsAuth(false);
    setAnimes([]);
    setProfile(null);
  };

  if (!isAuth) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)', padding: '40px', width: '100%', maxWidth: '400px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 'bold', textAlign: 'center', marginBottom: '30px' }}>
            {isLogin ? 'Login' : 'Register'}
          </h2>
          {error && <div style={{ background: '#fee', color: '#c00', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>{error}</div>}
          <form onSubmit={handleAuth}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ marginBottom: '15px' }}
              required
            />
            <input
              type="password"
              placeholder="Password (min 6 chars)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ marginBottom: '20px' }}
              required
              minLength={6}
            />
            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', background: '#764ba2', color: 'white', padding: '14px', fontSize: '16px' }}
            >
              {loading ? 'Processing...' : isLogin ? 'Login' : 'Register'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '20px' }}>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              style={{ background: 'none', color: '#764ba2', textDecoration: 'underline', padding: 0 }}
            >
              {isLogin ? 'Register' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', padding: '20px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: 'white' }}>🎌 Anime Explorer</h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={fetchProfile} style={{ background: 'white', color: '#764ba2' }}>Profile</button>
            <button onClick={logout} style={{ background: '#dc2626', color: 'white' }}>Logout</button>
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSearch(query); setShowHistory(false); }} style={{ marginBottom: '30px', position: 'relative' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => { setShowHistory(true); fetchHistory(); }}
                onBlur={() => setTimeout(() => setShowHistory(false), 200)}
                placeholder="Search anime..."
                style={{ padding: '16px', fontSize: '18px' }}
              />
              {showHistory && history.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '8px', background: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 10 }}>
                  {history.map((h) => (
                    <div
                      key={h._id}
                      onClick={() => { setQuery(h.query); handleSearch(h.query); }}
                      style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid #eee' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                    >
                      {h.query}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button type="submit" disabled={loading} style={{ padding: '16px 32px', background: '#764ba2', color: 'white', fontSize: '16px' }}>
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        {animes.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
            {animes.map((anime) => (
              <div
                key={anime.mal_id}
                onClick={() => setSelected(anime)}
                style={{ background: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.3s' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <img src={anime.images.jpg.image_url} alt={anime.title} style={{ width: '100%', height: '300px', objectFit: 'cover' }} />
                <div style={{ padding: '15px' }}>
                  <h3 style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{anime.title}</h3>
                  <span style={{ color: '#fbbf24', fontWeight: '600' }}>⭐ {anime.score || 'N/A'}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {selected && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 50 }} onClick={() => setSelected(null)}>
            <div style={{ background: 'white', borderRadius: '12px', maxWidth: '600px', width: '100%', padding: '30px', maxHeight: '80vh', overflow: 'auto' }} onClick={(e) => e.stopPropagation()}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>{selected.title}</h2>
              <p style={{ marginBottom: '10px' }}><strong>Score:</strong> ⭐ {selected.score || 'N/A'}</p>
              <p style={{ marginBottom: '10px' }}><strong>Episodes:</strong> {selected.episodes || 'Unknown'}</p>
              <p style={{ marginBottom: '20px' }}><strong>Synopsis:</strong> {selected.synopsis || 'No synopsis'}</p>
              <button onClick={() => setSelected(null)} style={{ background: '#764ba2', color: 'white' }}>Close</button>
            </div>
          </div>
        )}

        {profile && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 50 }} onClick={() => setProfile(null)}>
            <div style={{ background: 'white', borderRadius: '12px', padding: '40px', maxWidth: '500px', width: '100%' }} onClick={(e) => e.stopPropagation()}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Profile</h2>
              <p style={{ marginBottom: '10px' }}><strong>Email:</strong> {profile.email}</p>
              <p style={{ marginBottom: '20px' }}><strong>Joined:</strong> {profile.joined}</p>
              <div style={{ padding: '15px', background: '#d1fae5', borderRadius: '8px', marginBottom: '20px' }}>
                <p style={{ fontSize: '14px', color: '#065f46' }}>🔒 Data encrypted with AES-256-GCM</p>
              </div>
              <button onClick={() => setProfile(null)} style={{ background: '#764ba2', color: 'white' }}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;