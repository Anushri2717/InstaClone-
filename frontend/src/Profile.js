import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from './App';
import api from './api';

export default function Profile() {
  const { username } = useParams();
  const { user: me, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [saved, setSaved] = useState([]);
  const [tab, setTab] = useState('posts');
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followers, setFollowers] = useState(0);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(null);
  const isMe = me?.username === username;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pr, po] = await Promise.all([api.get(`/users/${username}`), api.get(`/users/${username}/posts`)]);
      setProfile(pr.data); setPosts(po.data);
      setFollowing(pr.data.isFollowing||false);
      setFollowers(pr.data.followers?.length||0);
      setEditForm({fullName:pr.data.fullName,bio:pr.data.bio||'',website:pr.data.website||''});
      if (me?.username===username) { const sv=await api.get(`/users/${username}/saved`); setSaved(sv.data); }
    } catch {}
    setLoading(false);
  }, [username, me]);

  useEffect(() => { load(); }, [load]);

  const handleFollow = async () => {
    try { const{data}=await api.post(`/users/${profile.id}/follow`); setFollowing(data.following); setFollowers(data.followersCount); } catch {}
  };

  const handleSave = async () => {
    setSaving(true);
    try { const{data}=await api.put('/users/me/profile',editForm); setProfile(p=>({...p,...data})); updateUser(data); setEditOpen(false); } catch {}
    setSaving(false);
  };

  if (loading) return <div className="page-center"><div className="spin"/></div>;
  if (!profile) return <div className="page-center">User not found</div>;

  const display = tab==='saved' ? saved : posts;

  const tabStyle = (t) => ({
    display:'flex',alignItems:'center',gap:6,padding:'14px 0',fontSize:12,fontWeight:600,
    letterSpacing:1,color:tab===t?'var(--text)':'var(--gray)',background:'none',border:'none',
    borderTop:tab===t?'2px solid var(--text)':'2px solid transparent',marginTop:-1,cursor:'pointer'
  });

  return (
    <div style={{maxWidth:935,margin:'0 auto',padding:'30px 20px 60px'}}>
      <div style={{display:'flex',gap:60,marginBottom:44,alignItems:'flex-start',flexWrap:'wrap'}}>
        <div style={{flexShrink:0}}>
          <div style={{width:150,height:150,borderRadius:'50%',background:'var(--grad)',padding:3}}>
            <img src={profile.avatar} alt="" style={{width:'100%',height:'100%',borderRadius:'50%',objectFit:'cover',border:'3px solid #fff'}}/>
          </div>
        </div>
        <div style={{flex:1}}>
          <div style={{display:'flex',alignItems:'center',gap:20,marginBottom:20,flexWrap:'wrap'}}>
            <h2 style={{fontSize:20,fontWeight:300,display:'flex',alignItems:'center',gap:6}}>
              {profile.username}
              {profile.isVerified && <span style={{background:'var(--blue)',color:'#fff',borderRadius:'50%',fontSize:11,padding:'2px 5px'}}>✓</span>}
            </h2>
            <div style={{display:'flex',gap:8}}>
              {isMe ? (
                <button onClick={()=>setEditOpen(true)} style={{padding:'7px 16px',borderRadius:8,fontSize:14,fontWeight:600,background:'#fff',border:'1px solid var(--border)',cursor:'pointer'}}>Edit profile</button>
              ) : (
                <button onClick={handleFollow} style={{padding:'7px 16px',borderRadius:8,fontSize:14,fontWeight:600,border:'none',cursor:'pointer',background:following?'var(--light)':'var(--blue)',color:following?'var(--text)':'#fff'}}>
                  {following?'Following':'Follow'}
                </button>
              )}
            </div>
          </div>
          <div style={{display:'flex',gap:40,marginBottom:16,fontSize:16}}>
            <span><strong>{posts.length}</strong> posts</span>
            <span style={{cursor:'pointer'}}><strong>{followers}</strong> followers</span>
            <span style={{cursor:'pointer'}}><strong>{profile.following?.length||0}</strong> following</span>
          </div>
          <div>
            <strong style={{fontSize:14,display:'block',marginBottom:4}}>{profile.fullName}</strong>
            {profile.bio && <p style={{fontSize:14,lineHeight:1.6,whiteSpace:'pre-line',marginBottom:4}}>{profile.bio}</p>}
            {profile.website && <a href={profile.website} target="_blank" rel="noreferrer" style={{fontSize:14,color:'#00376b',fontWeight:600}}>{profile.website}</a>}
          </div>
        </div>
      </div>

      <div style={{display:'flex',borderTop:'1px solid var(--border)',marginBottom:4,justifyContent:'center',gap:60}}>
        <button style={tabStyle('posts')} onClick={()=>setTab('posts')}>POSTS</button>
        {isMe && <button style={tabStyle('saved')} onClick={()=>setTab('saved')}>SAVED</button>}
        <button style={tabStyle('tagged')} onClick={()=>setTab('tagged')}>TAGGED</button>
      </div>

      {display.length === 0 ? (
        <div style={{textAlign:'center',padding:60,borderTop:'1px solid var(--border)'}}>
          <div style={{fontSize:64,marginBottom:16}}>{tab==='saved'?'🔖':'📷'}</div>
          <h3>{tab==='saved'?'Save posts':'No posts yet'}</h3>
        </div>
      ) : (
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:3}}>
          {display.map(p => (
            <div key={p.id} style={{position:'relative',aspectRatio:1,overflow:'hidden',cursor:'pointer',background:'var(--light)'}} onClick={()=>setPreview(p)}>
              <img src={p.image} alt="" style={{width:'100%',height:'100%',objectFit:'cover',display:'block',transition:'filter .2s'}}
                onMouseOver={e=>e.target.style.filter='brightness(.8)'} onMouseOut={e=>e.target.style.filter='brightness(1)'}/>
              <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,.3)',display:'flex',alignItems:'center',justifyContent:'center',gap:24,opacity:0,transition:'opacity .2s',color:'#fff',fontWeight:700,fontSize:16}}
                onMouseOver={e=>e.currentTarget.style.opacity=1} onMouseOut={e=>e.currentTarget.style.opacity=0}>
                <span>❤️ {p.likesCount||0}</span><span>💬 {p.commentsCount||0}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {editOpen && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.6)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setEditOpen(false)}>
          <div style={{background:'#fff',borderRadius:12,width:'100%',maxWidth:440,overflow:'hidden'}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 24px',borderBottom:'1px solid var(--border)'}}>
              <h3 style={{fontSize:16,fontWeight:600}}>Edit Profile</h3>
              <button onClick={()=>setEditOpen(false)} style={{fontSize:20,background:'none',border:'none',cursor:'pointer'}}>✕</button>
            </div>
            <div style={{padding:24,display:'flex',flexDirection:'column',gap:18}}>
              {[['fullName','Name','text'],['bio','Bio','textarea'],['website','Website','url']].map(([k,label,type])=>(
                <div key={k} style={{display:'flex',flexDirection:'column',gap:6}}>
                  <label style={{fontWeight:600,fontSize:14}}>{label}</label>
                  {type==='textarea'
                    ? <textarea rows={4} value={editForm[k]||''} onChange={e=>setEditForm(f=>({...f,[k]:e.target.value}))} maxLength={150} style={{padding:'9px 12px',border:'1px solid var(--border)',borderRadius:8,fontSize:14,outline:'none',resize:'vertical',fontFamily:'inherit'}}/>
                    : <input type={type} value={editForm[k]||''} onChange={e=>setEditForm(f=>({...f,[k]:e.target.value}))} style={{padding:'9px 12px',border:'1px solid var(--border)',borderRadius:8,fontSize:14,outline:'none',fontFamily:'inherit'}}/>
                  }
                </div>
              ))}
            </div>
            <div style={{display:'flex',justifyContent:'flex-end',gap:10,padding:'16px 24px',borderTop:'1px solid var(--border)'}}>
              <button onClick={()=>setEditOpen(false)} style={{padding:'8px 20px',borderRadius:8,fontSize:14,fontWeight:600,background:'#fff',border:'1px solid var(--border)',cursor:'pointer'}}>Cancel</button>
              <button onClick={handleSave} disabled={saving} style={{padding:'8px 20px',borderRadius:8,fontSize:14,fontWeight:600,background:'var(--blue)',color:'#fff',border:'none',cursor:'pointer',opacity:saving?.6:1}}>{saving?'Saving…':'Submit'}</button>
            </div>
          </div>
        </div>
      )}

      {preview && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.7)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setPreview(null)}>
          <div style={{background:'#fff',borderRadius:4,display:'flex',overflow:'hidden',maxWidth:860,width:'90%',maxHeight:'90vh',position:'relative'}} onClick={e=>e.stopPropagation()}>
            <div style={{flex:1,background:'#000'}}><img src={preview.image} alt="" style={{width:'100%',height:'100%',objectFit:'contain',maxHeight:'90vh',display:'block'}}/></div>
            <div style={{width:300,flexShrink:0,padding:20,display:'flex',flexDirection:'column',gap:12,borderLeft:'1px solid var(--border)'}}>
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <img src={profile.avatar} alt="" style={{width:32,height:32,borderRadius:'50%',objectFit:'cover'}}/>
                <span style={{fontWeight:600,fontSize:14}}>{profile.username}</span>
              </div>
              {preview.caption && <p style={{fontSize:14,lineHeight:1.5}}><strong>{profile.username}</strong>{' '}{preview.caption}</p>}
              <div style={{fontSize:14,fontWeight:600}}>{preview.likesCount||0} likes</div>
              <Link to={`/p/${preview.id}`} style={{color:'var(--blue)',fontWeight:600,fontSize:14}}>View full post →</Link>
            </div>
            <button onClick={()=>setPreview(null)} style={{position:'absolute',top:12,right:12,background:'rgba(0,0,0,.5)',border:'none',color:'#fff',borderRadius:'50%',width:32,height:32,fontSize:18,cursor:'pointer'}}>✕</button>
          </div>
        </div>
      )}
    </div>
  );
}


