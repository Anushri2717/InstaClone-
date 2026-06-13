import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './App';

const DEMOS = [
  { u:'alex_morgan', p:'Alex@1234', label:'🌿 Alex Morgan' },
  { u:'sarah_chen', p:'Sarah@5678', label:'🏙️ Sarah Chen' },
  { u:'mike_patel', p:'Mike@9012', label:'🍜 Mike Patel' },
  { u:'emma_fit', p:'Emma@3456', label:'💪 Emma Johnson' },
  { u:'liam_travels', p:'Liam@7890', label:'✈️ Liam Walker' },
];

export default function Login() {
  const [form, setForm] = useState({ username:'', password:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { await login(form.username, form.password); navigate('/'); }
    catch (err) { setError(err.response?.data?.message || 'Login failed'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg)',padding:20}}>
      <div style={{display:'flex',flexDirection:'column',gap:10,width:'100%',maxWidth:350}}>
        <div style={{background:'#fff',border:'1px solid var(--border)',borderRadius:3,padding:'40px 40px 28px'}}>
          <h1 style={{fontFamily:"'Dancing Script',cursive",fontSize:36,textAlign:'center',marginBottom:28}}>Instagram</h1>
          {error && <div style={{background:'#fff3f3',border:'1px solid #f5b8b8',borderRadius:4,color:'#c0392b',padding:'10px 12px',marginBottom:12,fontSize:13}}>{error}</div>}
          <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:6}}>
            <input type="text" placeholder="Username or email" value={form.username} onChange={e=>setForm({...form,username:e.target.value.trim()})} required autoFocus
              style={{padding:'9px 10px',background:'var(--bg)',border:'1px solid var(--border)',borderRadius:3,outline:'none',fontSize:12}}/>
            <input type="password" placeholder="Password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required
              style={{padding:'9px 10px',background:'var(--bg)',border:'1px solid var(--border)',borderRadius:3,outline:'none',fontSize:12}}/>
            <button type="submit" disabled={loading||!form.username||!form.password}
              style={{marginTop:8,padding:7,background:'var(--blue)',color:'#fff',borderRadius:8,fontWeight:600,fontSize:14,border:'none',cursor:'pointer',opacity:(loading||!form.username||!form.password)?0.5:1}}>
              {loading ? 'Logging in...' : 'Log in'}
            </button>
          </form>
          <div style={{display:'flex',alignItems:'center',gap:16,margin:'16px 0 10px',color:'var(--gray)',fontSize:13,fontWeight:600}}>
            <div style={{flex:1,height:1,background:'var(--border)'}}/>OR<div style={{flex:1,height:1,background:'var(--border)'}}/>
          </div>
          <p style={{fontSize:12,color:'var(--gray)',textAlign:'center',marginBottom:8}}>Quick demo access</p>
          <div style={{display:'flex',flexDirection:'column',gap:4}}>
            {DEMOS.map(d => (
              <button key={d.u} onClick={()=>setForm({username:d.u,password:d.p})}
                style={{padding:'7px 12px',background:'var(--bg)',border:'1px solid var(--border)',borderRadius:6,fontSize:13,textAlign:'left',cursor:'pointer'}}>
                {d.label}
              </button>
            ))}
          </div>
        </div>
        <div style={{background:'#fff',border:'1px solid var(--border)',borderRadius:3,padding:18,textAlign:'center',fontSize:14}}>
          Don't have an account? <Link to="/register" style={{color:'var(--blue)',fontWeight:600}}>Sign up</Link>
        </div>
      </div>
    </div>
  );
}