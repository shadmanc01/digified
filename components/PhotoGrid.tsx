import Link from 'next/link';import Image from 'next/image';import type { Photo } from '@/lib/data';
export default function PhotoGrid({items}:{items:Photo[]}){return <div className="masonry">{items.map(p=><Link className="photoCard" href={`/photo/${p.id}`} key={p.id}>
  <Image src={p.src} alt={p.alt} width={p.aspect==='portrait'?900:1200} height={p.aspect==='portrait'?1200:p.aspect==='square'?1000:800} sizes="(max-width:460px) 100vw,(max-width:760px) 50vw,(max-width:1100px) 33vw,25vw" style={{width:'100%',height:'auto',objectFit:'contain'}}/>
  <div className="overlay"><div className="row"><div className="userline"><span className="avatar">{p.user.avatar}</span><span>{p.user.name}</span></div><span>♡ {p.likes.toLocaleString()}</span></div><span className="cameraChip">{p.camera.name} · {p.lens.name}</span></div>
</Link>)}</div>}
