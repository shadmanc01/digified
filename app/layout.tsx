import './globals.css';
import './auth.css';
import Link from 'next/link';
import { categories } from '@/lib/data';
import AuthNav from '@/components/AuthNav';

export const metadata = { title: 'digified — photography through the cameras that create it', description: 'A social network for digital camera photography.' };

export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="en"><body>
    <header className="topbar"><div className="shell" style={{width:'100%',display:'flex',alignItems:'center',gap:24}}>
      <Link href="/" className="brand">digified</Link>
      <form className="search" action="/search"><span>⌕</span><input name="q" aria-label="Search" placeholder="Search photos, cameras, lenses, photographers..."/></form>
      <nav className="nav"><Link href="/explore">Explore</Link><Link className="hideTablet" href="/following">Following</Link><Link className="hideTablet" href="/cameras">Cameras</Link><Link href="/upload">Upload</Link><Link className="hideTablet" href="/messages">Messages</Link><AuthNav /></nav>
    </div></header>
    <div className="shell"><div className="categoryStrip"><Link href="/explore"><b>Editorial</b></Link>{categories.slice(0,14).map(c=><Link key={c} href={`/category/${encodeURIComponent(c.toLowerCase())}`}>{c}</Link>)}</div></div>
    {children}
    <footer className="footer shell"><div><b style={{color:'#111'}}>digified</b> · photography through the cameras that create it.</div><div>Community · Privacy · Terms</div></footer>
    <nav className="bottomnav"><Link href="/">⌂<span>Home</span></Link><Link href="/explore">⌕<span>Explore</span></Link><Link href="/upload">＋<span>Upload</span></Link><Link href="/notifications">♡<span>Activity</span></Link><Link href="/maya.chen">●<span>Profile</span></Link></nav>
  </body></html>
}
