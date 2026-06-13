import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from './App';
import api from './api';

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return `${s}s`; if (s < 3600) return `${Math.floor(s/60)}m`;
  if (s < 86400) return `${Math.floor(s/3600)}h`; return `${Math.floor(s/86400)}d`;
}

export default function PostDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [saved, setSaved] = useState(false);
  const [comments, setComments] = useState([]);
  const [txt, setTxt] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    api.get(`/posts/${id}`).then(r=>{setPost(r.data);setLiked(r.data.isLiked);setLikes(r.data.likesCount);setSaved(r.data.isSaved);setComments(r.data.comments||[]);}).catch(()=>{});
  }, [id]);

  const handleLike = async () => { setLiked(l=>!l); setLikes(c=>liked?c-1:c+1); try{await api.post(`/posts/${id}/like`);}catch{} };
  const handleSave = async () => { setSaved(s=>!s); try{await api.post(`/posts/${id}/save`);}catch{} };

  const addComment = async (e) => {
    e.preventDefault(); if (!txt.trim()) return;
    try { const{data}=await api.post(`/posts/${id}/comment`,{text:txt}); setComments(p=>[...p,data]); setTxt(''); } catch {}
  };

  const delComment = async (cid) => { try{await api.delete(`/posts/${id}/comment/${cid}`);setComments(p=>p.filter(c=>c.id!==cid));}catch{} };

  if (!post) return <div className="page-center"><div className="spin"/></div>;

  return (
    <div style={{maxWidth:935,margin:'30px auto',padding:'0 20px'}}>
      <div style={{display:'flex',background:'#fff',border:'1px solid var(--border)',borderRadius:4,overflow:'hidden',minHeight:600}}>
        <div style={{flex:1,background:'#000',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <img src={post.image} alt="" style={{width:'100%',maxHeight:'80vh',objectFit:'contain',display:'block'}}/>
        </div>
        <div style={{width:340,flexShrink:0,display:'flex',flexDirection:'column',borderLeft:'1px solid var(--border)'}}>
          <div style={{display:'flex',alignItems:'center',padding:'14px 16px',borderBottom:'1px solid var(--border)',gap:12}}>
            <div style={{background:'var(--grad)',borderRadius:'50%',padding:2}}>
              <img src={post.user?.avatar} alt="" style={{width:32,height:32,borderRadius:'50%',objectFit:'cover',border:'2px solid #fff'}}/>
            </div>
            <Link to={`/${post.user?.username}`} style={{fontWeight:600,fontSize:14}}>{post.user?.username}</Link>
          </div>

          <div style={{flex:1,overflowY:'auto',padding:16,display:'flex',flexDirection:'column',gap:14}}>
            {post.caption && (
              <div style={{display:'flex',gap:12}}>
                <img src={post.user?.avatar} alt="" style={{width:32,height:32,borderRadius:'50%',objectFit:'cover',flexShrink:0}}/>
                <div style={{fontSize:14,lineHeight:1.5}}>
                  <Link to={`/${post.user?.username}`} style={{fontWeight:600}}>{post.user?.username}</Link>{' '}{post.caption}
                  <div style={{fontSize:12,color:'var(--gray)',marginTop:4}}>{timeAgo(post.createdAt)}</div>
                </div>
              </div>
            )}
            {comments.map(c => (
              <div key={c.id} style={{display:'flex',gap:12}}>
                <img src={c.user?.avatar} alt="" style={{width:32,height:32,borderRadius:'50%',objectFit:'cover',flexShrink:0}}/>
                <div style={{flex:1,fontSize:14,lineHeight:1.5}}>
                  <Link to={`/${c.user?.username}`} style={{fontWeight:600}}>{c.user?.username}</Link>{' '}{c.text}
                  <div style={{display:'flex',gap:10,marginTop:4,fontSize:12,color:'var(--gray)'}}>
                    <span>{timeAgo(c.createdAt)}</span>
                    {c.userId===user?.id && <button onClick={()=>delComment(c.id)} style={{color:'var(--red)',fontSize:12,background:'none',border:'none',cursor:'pointer'}}>Delete</button>}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{borderTop:'1px solid var(--border)',padding:'6px 16px'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:6}}>
              <div style={{display:'flex',gap:4}}>
                <button onClick={handleLike} style={{padding:6,display:'flex',alignItems:'center',border:'none',background:'none',cursor:'pointer'}}>
                  {liked?<svg width="24" height="24" viewBox="0 0 24 24" fill="#ed4956"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    :<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>}
                </button>
                <button onClick={()=>inputRef.current?.focus()} style={{padding:6,display:'flex',alignItems:'center',border:'none',background:'none',cursor:'pointer'}}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                </button>
              </div>
              <button onClick={handleSave} style={{padding:6,display:'flex',alignItems:'center',border:'none',background:'none',cursor:'pointer'}}>
                {saved?<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                  :<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>}
              </button>
            </div>
            <div style={{fontSize:14,fontWeight:600,marginBottom:4}}>{likes} likes</div>
          </div>

          <form onSubmit={addComment} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 16px',borderTop:'1px solid var(--border)'}}>
            <span style={{fontSize:20}}>😊</span>
            <input ref={inputRef} type="text" placeholder="Add a comment…" value={txt} onChange={e=>setTxt(e.target.value)} maxLength={150}
              style={{flex:1,border:'none',outline:'none',fontSize:14,background:'none',fontFamily:'inherit'}}/>
            {txt.trim() && <button type="submit" style={{color:'var(--blue)',fontWeight:600,fontSize:14,background:'none',border:'none',cursor:'pointer'}}>Post</button>}
          </form>
        </div>
      </div>
    </div>
  );
}