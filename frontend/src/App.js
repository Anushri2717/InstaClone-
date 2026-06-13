import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, useContext, createContext, useCallback } from 'react';
import api from './api';
import Login from './Login';
import Register from './Register';
import Home from './Home';
import Profile from './Profile';
import Explore from './Explore';
import PostDetail from './PostDetail';

export const AuthContext = createContext(null);

export function useAuth() { return useContext(AuthContext); }

function Navbar() {
  const { user, logout } = useAuth();
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [focused, setFocused] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [unread, setUnread] = useState(0);
  const [showNotif, setShowNotif] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const timerRef = { current: null };

  useEffect(() => {
    api.get('/users/notifications').then(r => { setNotifs(r.data); setUnread(r.data.filter(n=>!n.read).length); }).catch(()=>{});
    const iv = setInterval(() => {
      api.get('/users/notifications').then(r => { setNotifs(r.data); setUnread(r.data.filter(n=>!n.read).length); }).catch(()=>{});
    }, 30000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    clearTimeout(timerRef.current);
    if (!q.trim()) { setResults([]); return; }
    timerRef.current = setTimeout(() => {
      api.get(`/users/search?q=${encodeURIComponent(q)}`).then(r => setResults(r.data)).catch(()=>{});
    }, 300);
  }, [q]);

  const openNotif = () => {
    setShowNotif(s => !s); setShowMenu(false);
    if (!showNotif && unread > 0) {
      setTimeout(() => { api.patch('/users/notifications/read').then(() => { setNotifs(p=>p.map(n=>({...n,read:true}))); setUnread(0); }); }, 1500);
    }
  };

  return (
    <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:100,background:'#fff',borderBottom:'1px solid var(--border)',height:60,display:'flex',alignItems:'center'}}>
      <div style={{maxWidth:975,margin:'0 auto',width:'100%',display:'flex',alignItems:'center',gap:8,padding:'0 20px'}}>
        <a href="/" style={{fontFamily:"'Dancing Script',cursive",fontSize:26,fontWeight:700,color:'#262626',minWidth:110}}>Instagram</a>

        <div style={{position:'relative',flex:1,maxWidth:268}}>
          <input value={q} onChange={e=>setQ(e.target.value)} onFocus={()=>setFocused(true)} onBlur={()=>setTimeout(()=>setFocused(false),200)}
            placeholder="Search" style={{width:'100%',padding:'8px 12px',background:'var(--light)',border:'1px solid transparent',borderRadius:8,outline:'none',fontSize:14}}/>
          {focused && (q ? results.length > 0 : false) && (
            <div style={{position:'absolute',top:'calc(100% + 8px)',left:0,right:0,background:'#fff',borderRadius:12,boxShadow:'0 4px 20px rgba(0,0,0,.15)',zIndex:200,padding:'8px 0'}}>
              {results.map(u => (
                <a key={u.id} href={`/${u.username}`} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 16px'}} onMouseDown={e=>e.preventDefault()}>
                  <img src={u.avatar} alt="" style={{width:36,height:36,borderRadius:'50%',objectFit:'cover'}}/>
                  <div><div style={{fontWeight:600}}>{u.username}</div><div style={{fontSize:12,color:'var(--gray)'}}>{u.fullName}</div></div>
                </a>
              ))}
            </div>
          )}
          {focused && q && results.length === 0 && (
            <div style={{position:'absolute',top:'calc(100% + 8px)',left:0,right:0,background:'#fff',borderRadius:12,boxShadow:'0 4px 20px rgba(0,0,0,.15)',zIndex:200,padding:20,textAlign:'center',color:'var(--gray)'}}>No results</div>
          )}
        </div>

        <div style={{display:'flex',alignItems:'center',gap:4,marginLeft:'auto'}}>
          <a href="/" style={{display:'flex',alignItems:'center',justifyContent:'center',width:40,height:40,borderRadius:'50%',color:'var(--text)'}}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </a>
          <a href="/explore" style={{display:'flex',alignItems:'center',justifyContent:'center',width:40,height:40,borderRadius:'50%',color:'var(--text)'}}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </a>

          <div style={{position:'relative'}}>
            <button onClick={openNotif} style={{display:'flex',alignItems:'center',justifyContent:'center',width:40,height:40,borderRadius:'50%',position:'relative'}}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill={showNotif?'currentColor':'none'} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              {unread > 0 && <span style={{position:'absolute',top:2,right:2,background:'var(--red)',color:'#fff',borderRadius:10,fontSize:10,fontWeight:700,minWidth:18,height:18,display:'flex',alignItems:'center',justifyContent:'center',padding:'0 4px',border:'2px solid #fff'}}>{unread > 9 ? '9+' : unread}</span>}
            </button>
            {showNotif && (
              <div style={{position:'absolute',top:'calc(100% + 10px)',right:-80,width:360,background:'#fff',borderRadius:16,boxShadow:'0 4px 24px rgba(0,0,0,.15)',zIndex:200,overflow:'hidden'}}>
                <div style={{padding:'16px',borderBottom:'1px solid var(--border)',fontWeight:600,fontSize:16}}>Notifications</div>
                <div style={{maxHeight:380,overflowY:'auto'}}>
                  {notifs.length === 0 ? <div style={{padding:40,textAlign:'center',color:'var(--gray)'}}>No notifications yet</div> : notifs.map(n => (
                    <a key={n.id} href={n.postId ? `/p/${n.postId}` : `/${n.fromUser?.username}`} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 16px',background:n.read?'#fff':'#eff8ff',borderBottom:'1px solid #f0f0f0'}} onClick={()=>setShowNotif(false)}>
                      <img src={n.fromUser?.avatar} alt="" style={{width:40,height:40,borderRadius:'50%',objectFit:'cover',flexShrink:0}}/>
                      <div style={{flex:1,fontSize:14,lineHeight:1.4}}>
                        <strong>{n.fromUser?.username}</strong>{' '}
                        {n.type==='like'?'liked your photo.':n.type==='comment'?`commented: "${n.text}"`:' started following you.'}
                      </div>
                      {n.post && <img src={n.post.image} alt="" style={{width:40,height:40,objectFit:'cover',borderRadius:4,flexShrink:0}}/>}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={{position:'relative'}}>
            <button onClick={()=>{setShowMenu(s=>!s);setShowNotif(false);}} style={{display:'flex',alignItems:'center',justifyContent:'center',width:40,height:40,borderRadius:'50%'}}>
              <img src={user?.avatar} alt="" style={{width:28,height:28,borderRadius:'50%',objectFit:'cover'}}/>
            </button>
            {showMenu && (
              <div style={{position:'absolute',top:'calc(100% + 10px)',right:0,width:200,background:'#fff',borderRadius:12,boxShadow:'0 4px 24px rgba(0,0,0,.15)',zIndex:200,padding:'6px 0'}}>
                <a href={`/${user?.username}`} onClick={()=>setShowMenu(false)} style={{display:'flex',alignItems:'center',gap:10,padding:'12px 16px',fontSize:14}}>Profile</a>
                <a href="/explore" onClick={()=>setShowMenu(false)} style={{display:'flex',alignItems:'center',gap:10,padding:'12px 16px',fontSize:14}}>Explore</a>
                <div style={{height:1,background:'var(--border)',margin:'6px 0'}}/>
                <button onClick={logout} style={{display:'flex',alignItems:'center',gap:10,padding:'12px 16px',fontSize:14,width:'100%',textAlign:'left'}}>Log Out</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function Layout({ children }) {
  return (
    <>
      <Navbar />
      <div style={{ paddingTop: 60 }}>{children}</div>
    </>
  );
}

function Private({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-center"><div className="spin"/></div>;
  return user ? <Layout>{children}</Layout> : <Navigate to="/login" replace />;
}

function Public({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-center"><div className="spin"/></div>;
  return user ? <Navigate to="/" replace /> : children;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('ig_token');
    if (!token) { setLoading(false); return; }
    api.get('/users/me').then(r => setUser(r.data)).catch(() => localStorage.clear()).finally(() => setLoading(false));
  }, []);

  const login = async (username, password) => {
    const { data } = await api.post('/auth/login', { username, password });
    localStorage.setItem('ig_token', data.token);
    setUser(data.user);
  };

  const register = async (form) => {
    const { data } = await api.post('/auth/register', form);
    localStorage.setItem('ig_token', data.token);
    setUser(data.user);
  };

  const logout = useCallback(() => { localStorage.clear(); setUser(null); }, []);
  const updateUser = useCallback(u => setUser(u), []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Public><Login/></Public>} />
          <Route path="/register" element={<Public><Register/></Public>} />
          <Route path="/" element={<Private><Home/></Private>} />
          <Route path="/explore" element={<Private><Explore/></Private>} />
          <Route path="/p/:id" element={<Private><PostDetail/></Private>} />
          <Route path="/:username" element={<Private><Profile/></Private>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}