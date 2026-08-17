'use client';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Bell, Building2, CircleDollarSign, CircleUserRound, Headphones, Home, Landmark, MapPin, PlayCircle, PlusCircle, WalletCards, X } from 'lucide-react';
import type { Balance, PropertyListing } from '@prime/contracts';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:4000/api/v1';
const TOKEN_KEY = 'prime_webapp_token';
type Tab='home'|'apartments'|'finance'|'profile';
type Profile={id:string;name:string;email:string;phone?:string;phpInvest:number;primeCapital:number};
type FinanceEntry={id:string;type:'income'|'expense';category:string;amount:number;note?:string};
type ContentItem={id:string;title:string;description?:string;url?:string;imageUrl?:string};
const money=(value:number)=>new Intl.NumberFormat('uz-UZ').format(value);
const navItems = [[Home,'home','Home'],[Building2,'apartments','Kvartiralar'],[CircleDollarSign,'finance','Finance'],[CircleUserRound,'profile','Profil']] as const;
function getToken(){return typeof window==='undefined'?null:localStorage.getItem(TOKEN_KEY)}
function setToken(token:string){localStorage.setItem(TOKEN_KEY,token)}
function clearToken(){localStorage.removeItem(TOKEN_KEY)}
async function request(path:string,options?:RequestInit){
  const token=getToken();
  const res=await fetch(`${API}${path}`,{...options,headers:{'content-type':'application/json',...(token?{authorization:`Bearer ${token}`}:{}),...(options?.headers??{})}});
  if(res.status===401){clearToken();throw new Error('unauthorized')}
  if(!res.ok)throw new Error(await res.text().catch(()=>'Xatolik'));
  return res.json();
}

export function WebApp({balances,properties,banners,videos}:{balances:Balance[];properties:PropertyListing[];banners:ContentItem[];videos:ContentItem[]}){
  const [checking,setChecking]=useState(true);
  const [profile,setProfile]=useState<Profile|null>(null);
  const [tab,setTab]=useState<Tab>('home');
  const [modal,setModal]=useState<'invest'|'withdraw'|'support'|'videos'|null>(null);
  const [notifications,setNotifications]=useState<ContentItem[]>([]);
  const [showNotifications,setShowNotifications]=useState(false);

  async function loadProfile(){
    const token=getToken();
    if(!token){setChecking(false);return}
    try{
      const payload=JSON.parse(atob(token.split('.')[1]));
      const user=await request(`/users/${payload.sub}`);
      setProfile(user);
    }catch{clearToken();setProfile(null)}
    setChecking(false);
  }
  useEffect(()=>{loadProfile()},[]);
  useEffect(()=>{request('/notifications').then(setNotifications).catch(()=>setNotifications([]))},[]);

  if(checking)return <div className="webapp"/>;
  if(!profile)return <AuthScreen onSuccess={()=>{setChecking(true);loadProfile()}}/>;

  return <div className="webapp"><header className="top"><div className="logo"><span className="logo-mark"><i/><i/><i/></span><span><b>PRIME</b><small>CAPITAL</small></span></div><button aria-label="Bildirishnomalar" onClick={()=>setShowNotifications(x=>!x)}><Bell/>{notifications.length?<em/>:null}</button></header>
  {showNotifications?<NotificationsPanel items={notifications} onClose={()=>setShowNotifications(false)}/>:null}
  <main>
    {tab==='home'?<HomeScreen balances={balances} properties={properties} banners={banners} onInvest={()=>setModal('invest')} onWithdraw={()=>setModal('withdraw')} onSupport={()=>setModal('support')} onVideos={()=>setModal('videos')}/>:null}
    {tab==='apartments'?<ApartmentsScreen properties={properties}/>:null}
    {tab==='finance'?<FinanceScreen/>:null}
    {tab==='profile'?<ProfileScreen profile={profile} onSupport={()=>setModal('support')} onVideos={()=>setModal('videos')} onLogout={()=>{clearToken();setProfile(null)}}/>:null}
  </main><nav className="bottom-nav">{navItems.map(([Icon,id,label])=><button className={tab===id?'active':''} onClick={()=>setTab(id)} key={id}><Icon/><span>{label}</span></button>)}</nav>
  {modal==='invest'?<MoneyModal title="Investitsiya kiritish" action="investments" onClose={()=>setModal(null)}/>:null}
  {modal==='withdraw'?<MoneyModal title="Pul yechish" action="withdrawals" onClose={()=>setModal(null)}/>:null}
  {modal==='support'?<SupportModal onClose={()=>setModal(null)}/>:null}
  {modal==='videos'?<VideosModal items={videos} onClose={()=>setModal(null)}/>:null}
  </div>
}

function NotificationsPanel({items,onClose}:{items:ContentItem[];onClose:()=>void}){
  return <div className="notif-overlay" onClick={onClose}><div className="notif-panel" onClick={(e)=>e.stopPropagation()}>
    <div className="modal-head"><h2>Bildirishnomalar</h2><button onClick={onClose}><X size={18}/></button></div>
    {items.length?items.map(item=><article className="notif-row" key={item.id}><strong>{item.title}</strong>{item.description?<p>{item.description}</p>:null}</article>):<div className="empty-state">Hozircha bildirishnoma yo‘q.</div>}
  </div></div>
}

function VideosModal({items,onClose}:{items:ContentItem[];onClose:()=>void}){
  return <div className="modal-overlay" onClick={onClose}><div className="modal-card" onClick={(e)=>e.stopPropagation()}>
    <div className="modal-head"><h2>Video darslar</h2><button onClick={onClose}><X size={18}/></button></div>
    <div className="video-list">{items.length?items.map(item=><a className="video-row" href={item.url} target="_blank" rel="noreferrer" key={item.id}><PlayCircle/><div><strong>{item.title}</strong>{item.description?<span>{item.description}</span>:null}</div></a>):<div className="empty-state">Hozircha video yo‘q.</div>}</div>
  </div></div>
}

function AuthScreen({onSuccess}:{onSuccess:()=>void}){
  const [mode,setMode]=useState<'login'|'register'>('login');
  const [status,setStatus]=useState('');
  const [loading,setLoading]=useState(false);
  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    const form=e.currentTarget,f=new FormData(form);
    setLoading(true);setStatus('');
    try{
      const path=mode==='login'?'/auth/login':'/auth/register';
      const body=mode==='login'?{email:f.get('email'),password:f.get('password')}:{name:f.get('name'),email:f.get('email'),phone:f.get('phone'),password:f.get('password')};
      const data=await request(path,{method:'POST',body:JSON.stringify(body)});
      setToken(data.accessToken);
      onSuccess();
    }catch{setStatus(mode==='login'?'Email yoki parol noto‘g‘ri':'Ro‘yxatdan o‘tishda xatolik (email band bo‘lishi mumkin)')}
    finally{setLoading(false)}
  }
  return <div className="auth-screen"><div className="auth-card">
    <div className="logo"><span className="logo-mark"><i/><i/><i/></span><span><b>PRIME</b><small>CAPITAL</small></span></div>
    <div className="auth-tabs"><button className={mode==='login'?'active':''} onClick={()=>setMode('login')}>Kirish</button><button className={mode==='register'?'active':''} onClick={()=>setMode('register')}>Ro‘yxatdan o‘tish</button></div>
    <form onSubmit={submit}>
      {mode==='register'?<label>F.I.O<input name="name" required/></label>:null}
      <label>Email<input name="email" type="email" required/></label>
      {mode==='register'?<label>Telefon<input name="phone" placeholder="+998 90 123 45 67"/></label>:null}
      <label>Parol<input name="password" type="password" required minLength={6}/></label>
      <button className="primary" disabled={loading}>{loading?'Yuborilmoqda...':mode==='login'?'Kirish':'Ro‘yxatdan o‘tish'}</button>
      {status?<small className="auth-error">{status}</small>:null}
    </form>
  </div></div>
}

function HomeScreen({balances,properties,banners,onInvest,onWithdraw,onSupport,onVideos}:{balances:Balance[];properties:PropertyListing[];banners:ContentItem[];onInvest:()=>void;onWithdraw:()=>void;onSupport:()=>void;onVideos:()=>void}){
  const quickItems = [[PlusCircle,'Investitsiya kiritish',onInvest],[PlayCircle,'Video darslar',onVideos],[Headphones,'Aloqa',onSupport],[WalletCards,'Pul yechish',onWithdraw]] as const;
  const hero=banners[0];
  return <>
 <section className="hero"><img src={hero?.imageUrl||'/residence.png'} alt={hero?.title||'Prime Capital zamonaviy turar joy majmuasi'}/><div><h1>{hero?.title||<>Prime joylarda<br/>kelajagingizni yarating</>}</h1><p>{hero?.description||'Ishonchli investitsiya, barqaror daromad.'}</p><a href={hero?.url||'#'}><button>Loyihalarni ko‘rish <span>→</span></button></a></div></section>
 {banners.length>1?<section className="banner-rail">{banners.slice(1).map(b=><a className="banner-card" href={b.url||'#'} key={b.id}>{b.imageUrl?<img src={b.imageUrl} alt={b.title}/>:null}<div><strong>{b.title}</strong>{b.description?<span>{b.description}</span>:null}</div></a>)}</section>:null}
 <section className="balances">{balances.slice(0,2).map((balance,index)=><article key={balance.id}><div className={`account-icon ${index?'cyan':''}`}>{index?<Landmark/>:<Building2/>}</div><div><h2>{balance.name}</h2><span>Hisob raqami</span></div><strong>{money(balance.amount)} <small>so‘m</small></strong><p>Oylik o‘zgarish <b className={balance.monthlyChange<0?'negative':''}>{balance.monthlyChange>0?'+':''}{balance.monthlyChange}% {balance.monthlyChange>0?'↗':'↘'}</b></p></article>)}</section>
 <section className="quick">{quickItems.map(([Icon,label,onClick])=><button key={label} onClick={onClick}><span><Icon/></span>{label}</button>)}</section><Chart/>
 <section className="property-section"><div className="section-title"><h2>Yangi novostroykalar</h2><button>Barchasini ko‘rish →</button></div><div className="property-rail">{properties.slice(0,3).map((item)=><article key={item.id}><div className="property-image"><img src="/residence.png" alt=""/><b>Yangi</b></div><h3>{item.title}</h3><p><MapPin/> {item.location}</p><strong>{money(item.price)} so‘m / m²</strong></article>)}</div></section></>}
function Chart(){return <section className="chart-card"><div className="section-title"><h2>Daromad dinamikasi</h2><select aria-label="Davr"><option>6 oy</option><option>1 yil</option></select></div><div className="chart-legend"><i/> PHP Invest <i/> Prime Capital</div><svg viewBox="0 0 700 250" role="img" aria-label="Daromad dinamikasi"><g className="lines"><line x1="30" y1="45" x2="680" y2="45"/><line x1="30" y1="105" x2="680" y2="105"/><line x1="30" y1="165" x2="680" y2="165"/><line x1="30" y1="225" x2="680" y2="225"/></g><polyline className="turquoise" points="30,120 150,100 270,85 390,95 510,70 680,42"/><polyline className="blue" points="30,190 150,178 270,165 390,140 510,110 680,75"/></svg></section>}
function ApartmentsScreen({properties}:{properties:PropertyListing[]}){return <section className="page"><h1>Kvartiralar</h1><p>Yangi novostroyka va sotiladigan uylar</p><div className="apartment-list">{properties.map(item=><article key={item.id}><img src="/residence.png" alt=""/><div><span>{item.type==='new-build'?'Novostroyka':'Ikkilamchi'}</span><h2>{item.title}</h2><p><MapPin/> {item.location}</p><strong>{money(item.price)} so‘m</strong></div></article>)}</div></section>}

function FinanceScreen(){
  const [entries,setEntries]=useState<FinanceEntry[]>([]);
  const [loading,setLoading]=useState(true);
  const [showForm,setShowForm]=useState(false);
  const total=useMemo(()=>entries.reduce((sum,item)=>sum+(item.type==='income'?item.amount:-item.amount),0),[entries]);
  useEffect(()=>{request('/finance').then(setEntries).catch(()=>setEntries([])).finally(()=>setLoading(false))},[]);
  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    const form=e.currentTarget,f=new FormData(form);
    try{
      const created=await request('/finance',{method:'POST',body:JSON.stringify({type:f.get('type'),category:f.get('category'),amount:Number(f.get('amount')),note:f.get('note')})});
      setEntries(x=>[created,...x]);form.reset();setShowForm(false);
    }catch{/* xatolik quyida ko‘rsatilmaydi, forma ochiq qoladi */}
  }
  return <section className="page finance-page"><h1>Finance tracker</h1><p>Kirim va chiqimlaringizni nazorat qiling</p>
    <div className="finance-total"><span>Joriy qoldiq</span><strong>{money(total)} so‘m</strong><button onClick={()=>setShowForm(x=>!x)}>{showForm?'Bekor qilish':'+ Xarajat qo‘shish'}</button></div>
    {showForm?<form className="finance-form" onSubmit={submit}>
      <select name="type" defaultValue="expense"><option value="income">Kirim</option><option value="expense">Chiqim</option></select>
      <input name="category" placeholder="Kategoriya" required/>
      <input name="amount" type="number" placeholder="Summa" required min={1}/>
      <input name="note" placeholder="Izoh (ixtiyoriy)"/>
      <button className="primary" type="submit">Saqlash</button>
    </form>:null}
    {loading?<div className="empty-state">Yuklanmoqda...</div>:entries.length?entries.map((item)=><div className="entry" key={item.id}><i className={item.type}/><div><b>{item.category}</b><span>{item.type==='income'?'Kirim':'Chiqim'}</span></div><strong className={item.type}>{item.type==='income'?'+':'-'}{money(item.amount)}</strong></div>):<div className="empty-state">Hozircha yozuv yo‘q.</div>}
  </section>}

function ProfileScreen({profile,onSupport,onVideos,onLogout}:{profile:Profile;onSupport:()=>void;onVideos:()=>void;onLogout:()=>void}){
  const balances:Balance[]=[{id:'prime-capital',name:'Prime Capital',amount:profile.primeCapital,monthlyChange:0,updatedAt:new Date().toISOString()},{id:'php-invest',name:'PHP Invest',amount:profile.phpInvest,monthlyChange:0,updatedAt:new Date().toISOString()}];
  const items:[string,(()=>void)?][]=[['Ma’lumotlarim'],['Support',onSupport],['Aktivlarim'],[`PHP Invest balansim: ${money(profile.phpInvest)} so‘m`],[`Prime Capital balansim: ${money(profile.primeCapital)} so‘m`],['Video darslar',onVideos]];
  return <section className="page profile-page"><div className="profile-head"><CircleUserRound/><div><h1>{profile.name}</h1><p>{profile.email}</p></div></div>
    {items.map(([label,onClick])=><button key={label} onClick={onClick}>{label}<span>›</span></button>)}
    <button className="logout" onClick={onLogout}>Chiqish</button>
    <small>Umumiy balans: {money(balances.reduce((s,b)=>s+b.amount,0))} so‘m</small></section>}

function MoneyModal({title,action,onClose}:{title:string;action:'investments'|'withdrawals';onClose:()=>void}){
  const [status,setStatus]=useState('');
  const [done,setDone]=useState(false);
  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    const form=e.currentTarget,f=new FormData(form);
    setStatus('Yuborilmoqda...');
    try{
      await request(`/${action}`,{method:'POST',body:JSON.stringify({product:f.get('product'),amount:Number(f.get('amount')),note:f.get('note')})});
      setDone(true);setStatus('So‘rov qabul qilindi, admin tasdiqlaydi.');
    }catch{setStatus('Xatolik yuz berdi, qayta urinib ko‘ring.')}
  }
  return <div className="modal-overlay" onClick={onClose}><div className="modal-card" onClick={(e)=>e.stopPropagation()}>
    <div className="modal-head"><h2>{title}</h2><button onClick={onClose}><X size={18}/></button></div>
    {done?<p className="modal-success">{status}</p>:<form onSubmit={submit}>
      <label>Yo‘nalish<select name="product" defaultValue="prime-capital"><option value="prime-capital">Prime Capital</option><option value="php-invest">PHP Invest</option></select></label>
      <label>Summa (so‘m)<input name="amount" type="number" required min={1}/></label>
      <label>Izoh (ixtiyoriy)<input name="note"/></label>
      <button className="primary" type="submit">Yuborish</button>
      {status?<small>{status}</small>:null}
    </form>}
  </div></div>
}

function SupportModal({onClose}:{onClose:()=>void}){
  const [status,setStatus]=useState('');
  const [done,setDone]=useState(false);
  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    const form=e.currentTarget,f=new FormData(form);
    setStatus('Yuborilmoqda...');
    try{
      await request('/support',{method:'POST',body:JSON.stringify({subject:f.get('subject'),message:f.get('message')})});
      setDone(true);setStatus('Xabaringiz qabul qilindi, tez orada javob beramiz.');
    }catch{setStatus('Xatolik yuz berdi, qayta urinib ko‘ring.')}
  }
  return <div className="modal-overlay" onClick={onClose}><div className="modal-card" onClick={(e)=>e.stopPropagation()}>
    <div className="modal-head"><h2>Aloqa / Support</h2><button onClick={onClose}><X size={18}/></button></div>
    {done?<p className="modal-success">{status}</p>:<form onSubmit={submit}>
      <label>Mavzu<input name="subject" required/></label>
      <label>Xabar<textarea name="message" rows={4} required/></label>
      <button className="primary" type="submit">Yuborish</button>
      {status?<small>{status}</small>:null}
    </form>}
  </div></div>
}
