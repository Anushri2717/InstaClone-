import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './App';
import api from './api';

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s/60)}m`;
  if (s < 86400) return `${Math.floor(s/3600)}h`;
  return `${Math.floor(s/86400)}d`;
}

function Stories() {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [viewing, setViewing] = useState(null);
  const [idx, setIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const timer = useRef(null);

  useEffect(() => { api.get('/stories').then(r=>setGroups(r.data)).catch(()=>{}); }, []);

  const start = (id) => {
    clearInterval(timer.current);
    if (id) api.post(`/stories/${id}/seen`).catch(()=>{});
    let p = 0; setProgress(0);
    timer.current = setInterval(() => {
      p += 2; setProgress(p);
      if (p >= 100) { clearInterval(timer.current); next(); }
    }, 100);
  };

  const open = (g, gi) => { setViewing({g,gi}); setIdx(0); start(g.stories[0]?.id); };

  const next = () => setViewing(prev => {
    if (!prev) return null;
    if (prev.g.stories[idx+1]) { setIdx(i=>i+1); setProgress(0); start(prev.g.stories[idx+1]?.id); return prev; }
    const ng = groups[prev.gi+1];
    if (ng) { setIdx(0); setProgress(0); start(ng.stories[0]?.id); return {g:ng,gi:prev.gi+1}; }
    clearInterval(timer.current); return null;
  });

  const close = () => { clearInterval(timer.current); setViewing(null); };

  useEffect(() => () => clearInterval(timer.current), []);

  return (
    <>
      <div style={{background:'#fff',border:'1px solid var(--border)',borderRadius:3,marginBottom:24,padding:'16px 0'}}>
        <div style={{display:'flex',gap:18,overflowX:'auto',padding:'2px 16px',scrollbarWidth:'none'}}>
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:6,cursor:'pointer',flexShrink:0}}>
            <div style={{width:62,height:62,borderRadius:'50%',background:'var(--light)',padding:2,position:'relative'}}>
              <img src={user?.avatar} alt="" style={{width:'100%',height:'100%',borderRadius:'50%',objectFit:'cover',border:'2px solid #fff'}}/>
              <span style={{position:'absolute',bottom:-1,right:-1,background:'var(--blue)',color:'#fff',borderRadius:'50%',width:22,height:22,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,border:'2px solid #fff',lineHeight:1}}>+</span>
            </div>
            <span style={{fontSize:12,maxWidth:66,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>Your story</span>
          </div>
          {groups.map((g,gi) => (
            <div key={g.userId} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:6,cursor:'pointer',flexShrink:0}} onClick={()=>open(g,gi)}>
              <div style={{width:62,height:62,borderRadius:'50%',padding:2.5,background:g.allSeen?'#c7c7c7':'var(--grad)'}}>
                <img src={g.user?.avatar} alt="" style={{width:'100%',height:'100%',borderRadius:'50%',objectFit:'cover',border:'2.5px solid #fff'}}/>
              </div>
              <span style={{fontSize:12,maxWidth:66,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{g.user?.username}</span>
            </div>
          ))}
        </div>
      </div>

      {viewing && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.9)',zIndex:2000,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={close}>
          <div style={{position:'relative',width:400,maxHeight:'95vh',borderRadius:12,overflow:'hidden',background:'#000'}} onClick={e=>e.stopPropagation()}>
            <div style={{position:'absolute',top:12,left:12,right:12,zIndex:10,display:'flex',gap:4}}>
              {viewing.g.stories.map((_,i) => (
                <div key={i} style={{flex:1,height:3,background:'rgba(255,255,255,.35)',borderRadius:2,overflow:'hidden'}}>
                  <div style={{height:'100%',background:'#fff',width: i<idx?'100%':i===idx?`${progress}%`:'0%'}}/>
                </div>
              ))}
            </div>
            <div style={{position:'absolute',top:24,left:12,right:12,zIndex:10,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <Link to={`/${viewing.g.user?.username}`} onClick={close} style={{display:'flex',alignItems:'center',gap:10}}>
                <img src={viewing.g.user?.avatar} alt="" style={{width:36,height:36,borderRadius:'50%',border:'2px solid #fff',objectFit:'cover'}}/>
                <span style={{color:'#fff',fontWeight:600,fontSize:14}}>{viewing.g.user?.username}</span>
              </Link>
              <button onClick={close} style={{color:'#fff',fontSize:20,background:'none',border:'none',cursor:'pointer'}}>✕</button>
            </div>
            <img src={viewing.g.stories[idx]?.image} alt="" style={{width:'100%',aspectRatio:'9/16',objectFit:'cover',display:'block'}}/>
            <div style={{position:'absolute',left:0,top:0,bottom:0,width:'35%',cursor:'pointer',zIndex:5}} onClick={()=>{if(idx>0){setIdx(i=>i-1);setProgress(0);start(viewing.g.stories[idx-1]?.id);}}}/>
            <div style={{position:'absolute',right:0,top:0,bottom:0,width:'35%',cursor:'pointer',zIndex:5}} onClick={next}/>
          </div>
        </div>
      )}
    </>
  );
}

function PostCard({ post: init, onDelete }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(init.isLiked);
  const [likes, setLikes] = useState(init.likesCount);
  const [saved, setSaved] = useState(init.isSaved);
  const [comments, setComments] = useState(init.comments||[]);
  const [txt, setTxt] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [heartAnim, setHeartAnim] = useState(false);
  const lastTap = useRef(0);
  const inputRef = useRef(null);

  const handleLike = async () => {
    setLiked(l=>!l); setLikes(c=>liked?c-1:c+1);
    try { await api.post(`/posts/${init.id}/like`); } catch {}
  };

  const doubleTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 350) { if (!liked) handleLike(); setHeartAnim(true); setTimeout(()=>setHeartAnim(false),900); }
    lastTap.current = now;
  };

  const handleSave = async () => { setSaved(s=>!s); try{await api.post(`/posts/${init.id}/save`);}catch{} };

  const addComment = async (e) => {
    e.preventDefault();
    if (!txt.trim()) return;
    try { const{data}=await api.post(`/posts/${init.id}/comment`,{text:txt}); setComments(p=>[...p,data]); setTxt(''); setShowAll(true); } catch {}
  };

  const delComment = async (cid) => {
    try { await api.delete(`/posts/${init.id}/comment/${cid}`); setComments(p=>p.filter(c=>c.id!==cid)); } catch {}
  };

  const cap = init.caption||'';
  const showComments = showAll ? comments : comments.slice(-2);

  return (
    <div style={{background:'#fff',border:'1px solid var(--border)',borderRadius:3,marginBottom:24,maxWidth:614,width:'100%'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 16px'}}>
        <Link to={`/${init.user?.username}`} style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{background:'var(--grad)',borderRadius:'50%',padding:2,flexShrink:0}}>
            <img src={init.user?.avatar} alt="" style={{width:32,height:32,borderRadius:'50%',objectFit:'cover',border:'2px solid #fff'}}/>
          </div>
          <div>
            <span style={{fontWeight:600,fontSize:14,display:'flex',alignItems:'center',gap:4}}>
              {init.user?.username}
              {init.user?.isVerified && <span style={{background:'var(--blue)',color:'#fff',borderRadius:'50%',fontSize:9,padding:'1px 3px'}}>✓</span>}
            </span>
            {init.location && <span style={{fontSize:12,color:'var(--gray)'}}>{init.location}</span>}
          </div>
        </Link>
        {init.user?.id === user?.id && (
          <button onClick={async()=>{if(window.confirm('Delete?')){await api.delete(`/posts/${init.id}`);onDelete&&onDelete(init.id);}}} style={{color:'var(--gray)',fontSize:13,padding:4}}>Delete</button>
        )}
      </div>

      <div style={{position:'relative',background:'#000',cursor:'pointer'}} onClick={doubleTap}>
        <img src={init.image} alt="" style={{width:'100%',aspectRatio:1,objectFit:'cover',display:'block'}}/>
        {heartAnim && <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',fontSize:90,pointerEvents:'none',animation:'heartPop .9s ease forwards'}}>❤️</div>}
      </div>

      <style>{`@keyframes heartPop{0%{transform:translate(-50%,-50%) scale(0);opacity:0}20%{transform:translate(-50%,-50%) scale(1.3);opacity:1}70%{transform:translate(-50%,-50%) scale(1);opacity:1}100%{transform:translate(-50%,-50%) scale(1.1);opacity:0}}`}</style>

      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'6px 12px'}}>
        <div style={{display:'flex',gap:4}}>
          <button onClick={handleLike} style={{padding:6,display:'flex',alignItems:'center'}}>
            {liked ? <svg width="24" height="24" viewBox="0 0 24 24" fill="#ed4956"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              : <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>}
          </button>
          <button onClick={()=>inputRef.current?.focus()} style={{padding:6,display:'flex',alignItems:'center'}}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </button>
        </div>
        <button onClick={handleSave} style={{padding:6,display:'flex',alignItems:'center'}}>
          {saved ? <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
            : <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>}
        </button>
      </div>

      <div style={{padding:'0 16px 4px',fontWeight:600,fontSize:14}}>{likes > 0 ? `${likes} like${likes===1?'':'s'}` : 'Be the first to like'}</div>

      {cap && (
        <div style={{padding:'0 16px 4px',fontSize:14,lineHeight:1.5}}>
          <Link to={`/${init.user?.username}`} style={{fontWeight:600}}>{init.user?.username}</Link>{' '}
          {cap.length > 120 && !expanded ? <>{cap.slice(0,120)}<button onClick={()=>setExpanded(true)} style={{color:'var(--gray)',fontSize:14}}>... more</button></> : cap}
        </div>
      )}

      {comments.length > 2 && !showAll && (
        <button onClick={()=>setShowAll(true)} style={{display:'block',padding:'0 16px 4px',fontSize:14,color:'var(--gray)'}}>View all {comments.length} comments</button>
      )}

      <div style={{padding:'0 16px 2px'}}>
        {showComments.map(c => (
          <div key={c.id} style={{fontSize:14,lineHeight:1.5,marginBottom:4,display:'flex',alignItems:'baseline',gap:4}}>
            <Link to={`/${c.user?.username}`} style={{fontWeight:600,flexShrink:0}}>{c.user?.username}</Link>
            <span style={{wordBreak:'break-word',flex:1}}>{c.text}</span>
            {c.userId === user?.id && <button onClick={()=>delComment(c.id)} style={{color:'var(--gray)',fontSize:11,opacity:0.6,flexShrink:0}}>✕</button>}
          </div>
        ))}
      </div>

      <div style={{padding:'2px 16px 8px',fontSize:10,color:'var(--gray)',textTransform:'uppercase'}}>{timeAgo(init.createdAt)}</div>

      <form onSubmit={addComment} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 16px',borderTop:'1px solid var(--border)'}}>
        <span style={{fontSize:20}}>😊</span>
        <input ref={inputRef} type="text" placeholder="Add a comment…" value={txt} onChange={e=>setTxt(e.target.value)} maxLength={150}
          style={{flex:1,border:'none',outline:'none',fontSize:14,background:'none'}}/>
        {txt.trim() && <button type="submit" style={{color:'var(--blue)',fontWeight:600,fontSize:14}}>Post</button>}
      </form>
    </div>
  );
}

function Sidebar() {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState([]);
  const [followed, setFollowed] = useState({});

  useEffect(() => { api.get('/users/suggestions').then(r=>setSuggestions(r.data)).catch(()=>{}); }, []);

  const follow = async (id) => {
    try { const{data}=await api.post(`/users/${id}/follow`); setFollowed(p=>({...p,[id]:data.following})); } catch {}
  };

  return (
    <aside style={{width:293,flexShrink:0,paddingTop:10}}>
      <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:24}}>
        <Link to={`/${user?.username}`}><img src={user?.avatar} alt="" style={{width:56,height:56,borderRadius:'50%',objectFit:'cover'}}/></Link>
        <div style={{flex:1}}>
          <Link to={`/${user?.username}`} style={{fontWeight:600,fontSize:14,display:'block'}}>{user?.username}</Link>
          <span style={{fontSize:14,color:'var(--gray)'}}>{user?.fullName}</span>
        </div>
        <Link to={`/${user?.username}`} style={{fontSize:12,fontWeight:600,color:'var(--blue)'}}>Switch</Link>
      </div>

      {suggestions.length > 0 && (
        <>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:14}}>
            <span style={{fontSize:14,fontWeight:600,color:'var(--gray)'}}>Suggested for you</span>
            <Link to="/explore" style={{fontSize:12,fontWeight:600,color:'var(--text)'}}>See All</Link>
          </div>
          {suggestions.map(u => (
            <div key={u.id} style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
              <Link to={`/${u.username}`}><img src={u.avatar} alt="" style={{width:32,height:32,borderRadius:'50%',objectFit:'cover'}}/></Link>
              <div style={{flex:1}}>
                <Link to={`/${u.username}`} style={{fontWeight:600,fontSize:14,display:'block'}}>{u.username}</Link>
                <span style={{fontSize:12,color:'var(--gray)'}}>Suggested for you</span>
              </div>
              <button onClick={()=>follow(u.id)} style={{fontSize:12,fontWeight:600,color:followed[u.id]?'var(--gray)':'var(--blue)'}}>
                {followed[u.id]?'Following':'Follow'}
              </button>
            </div>
          ))}
        </>
      )}

      <div style={{marginTop:24}}>
        <div style={{display:'flex',flexWrap:'wrap',gap:'3px 8px',marginBottom:8}}>
          {['About','Help','Press','API','Jobs','Privacy','Terms'].map(l=><a key={l} href="#!" style={{fontSize:11,color:'var(--gray)'}}>{l}</a>)}
        </div>
        <p style={{fontSize:11,color:'#c7c7c7',textTransform:'uppercase'}}>© 2024 Instagram from Meta</p>
      </div>
    </aside>
  );
}

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get('/posts/feed').then(r=>setPosts(r.data)).catch(()=>{}).finally(()=>setLoading(false)); }, []);

  if (loading) return <div className="page-center"><div className="spin"/></div>;

  return (
    <div style={{maxWidth:975,margin:'0 auto',padding:'30px 20px',display:'flex',gap:28,alignItems:'flex-start'}}>
      <div style={{flex:1,maxWidth:614,minWidth:0}}>
        <Stories/>
        {posts.length === 0 ? (
          <div style={{background:'#fff',border:'1px solid var(--border)',borderRadius:3,padding:60,textAlign:'center'}}>
            <div style={{fontSize:64,marginBottom:16}}>📷</div>
            <h3 style={{marginBottom:8}}>Start following people</h3>
            <p style={{color:'var(--gray)'}}>Their posts will appear here.</p>
          </div>
        ) : posts.map(p => <PostCard key={p.id} post={p} onDelete={id=>setPosts(ps=>ps.filter(x=>x.id!==id))}/>)}
      </div>
      <Sidebar/>
    </div>
  );
}