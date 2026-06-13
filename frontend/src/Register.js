import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './App';

export default function Register() {
  const [form, setForm] = useState({ email:'', fullName:'', username:'', password:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { await register(form); navigate('/'); }
    catch (err) { setError(err.response?.data?.message || 'Registration failed'); }
    finally { setLoading(false); }
  };

  const inp = (key, placeholder, type='text') => (
    <input type={type} placeholder={placeholder} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} required
      style={{padding:'9px 10px',background:'var(--bg)',border:'1px solid var(--border)',borderRadius:3,outline:'none',fontSize:12,width:'100%'}}/>
  );

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg)',padding:20}}>
      <div style={{display:'flex',flexDirection:'column',gap:10,width:'100%',maxWidth:350}}>
        <div style={{background:'#fff',border:'1px solid var(--border)',borderRadius:3,padding:'40px 40px 28px'}}>
          <h1 style={{fontFamily:"'Dancing Script',cursive",fontSize:36,textAlign:'center',marginBottom:16}}>Instagram</h1>
          <p style={{textAlign:'center',color:'var(--gray)',fontWeight:600,fontSize:17,marginBottom:20,lineHeight:1.5}}>Sign up to see photos from your friends.</p>
          {error && <div style={{background:'#fff3f3',border:'1px solid #f5b8b8',borderRadius:4,color:'#c0392b',padding:'10px 12px',marginBottom:12,fontSize:13}}>{error}</div>}
          <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:6}}>
            {inp('email','Email','email')}
            {inp('fullName','Full Name')}
            {inp('username','Username')}
            {inp('password','Password','password')}
            <button type="submit" disabled={loading}
              style={{marginTop:8,padding:7,background:'var(--blue)',color:'#fff',borderRadius:8,fontWeight:600,fontSize:14,border:'none',cursor:'pointer',opacity:loading?0.5:1}}>
              {loading?'Creating account...':'Sign up'}
            </button>
          </form>
        </div>
        <div style={{background:'#fff',border:'1px solid var(--border)',borderRadius:3,padding:18,textAlign:'center',fontSize:14}}>
          Have an account? <Link to="/login" style={{color:'var(--blue)',fontWeight:600}}>Log in</Link>
        </div>
      </div>
    </div>
  );
}