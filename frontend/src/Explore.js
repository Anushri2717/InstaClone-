import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from './api';

export default function Explore() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get('/posts/explore').then(r=>{setPosts(r.data);setLoading(false);}).catch(()=>setLoading(false)); }, []);

  if (loading) return <div className="page-center"><div className="spin"/></div>;

  return (
    <div style={{maxWidth:935,margin:'0 auto',padding:20}}>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:3,gridAutoFlow:'dense'}}>
        {posts.map((p,i) => (
          <Link key={p.id} to={`/p/${p.id}`} style={{position:'relative',overflow:'hidden',background:'var(--light)',aspectRatio:i%5===0?'auto':'1',gridRow:i%5===0?'span 2':'auto',display:'block'}}>
            <img src={p.image} alt="" style={{width:'100%',height:'100%',objectFit:'cover',display:'block',transition:'filter .2s'}}
              onMouseOver={e=>e.target.style.filter='brightness(.8)'} onMouseOut={e=>e.target.style.filter='brightness(1)'}/>
            <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,.3)',display:'flex',alignItems:'center',justifyContent:'center',gap:24,opacity:0,transition:'opacity .2s',color:'#fff',fontWeight:700,fontSize:16}}
              onMouseOver={e=>e.currentTarget.style.opacity=1} onMouseOut={e=>e.currentTarget.style.opacity=0}>
              <span>❤️ {p.likesCount}</span><span>💬 {p.commentsCount}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}