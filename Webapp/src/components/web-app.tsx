'use client';
import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Bell, Building2, Camera, CircleDollarSign, CircleUserRound, Headphones, Home, ImagePlus, Landmark, MapPin, PlayCircle, PlusCircle, WalletCards, X } from 'lucide-react';
import type { Balance, PropertyListing } from '@prime/contracts';
import { useLang, LanguageSwitcher } from '@/lib/i18n';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:4000/api/v1';
const TOKEN_KEY = 'prime_webapp_token';
const AUTH_EXPIRED_EVENT = 'prime-webapp-auth-expired';
const BOT_START_URL = 'https://t.me/Prime_capital_bot?start=webapp';
type Tab='home'|'apartments'|'finance'|'profile';
type Profile={id:string;name:string;email:string;phone?:string;phpInvest:number;primeCapital:number;photoUrl?:string};
type FinanceEntry={id:string;type:'income'|'expense';category:string;amount:number;note?:string};
type NotificationButton={label:string;url:string};
type ContentItem={id:string;title:string;description?:string;url?:string;imageUrl?:string;videoUrl?:string;buttons?:NotificationButton[]};
const money=(value:number)=>new Intl.NumberFormat('uz-UZ').format(value);
/** Prime Capital / PHP Invest balances are always denominated in USD, never so'm — property prices and finance-tracker entries stay in so'm. */
const usd=(value:number)=>`$${new Intl.NumberFormat('en-US',{maximumFractionDigits:2}).format(value)}`;
/** The two account cards must always show THIS user's own balance, never a platform-wide total. `productBalances` only supplies the real "monthlyChange" percent last applied by admin. */
function myBalances(profile:Profile,productBalances:Balance[]):Balance[]{
  const pct=(id:string)=>productBalances.find(b=>b.id===id)?.monthlyChange??0;
  return [
    {id:'prime-capital',name:'Prime Capital',amount:profile.primeCapital,monthlyChange:pct('prime-capital'),updatedAt:new Date().toISOString()},
    {id:'php-invest',name:'PHP Invest',amount:profile.phpInvest,monthlyChange:pct('php-invest'),updatedAt:new Date().toISOString()},
  ];
}
function getToken(){return typeof window==='undefined'?null:localStorage.getItem(TOKEN_KEY)}
function setToken(token:string){localStorage.setItem(TOKEN_KEY,token)}
function clearToken(){localStorage.removeItem(TOKEN_KEY)}
function expireSession(){
  clearToken();
  if(typeof window!=='undefined')window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
}
function tokenHasExpired(token:string){
  try{
    const payload=JSON.parse(atob(token.split('.')[1]));
    return typeof payload.exp==='number' && payload.exp*1000<=Date.now();
  }catch{return true}
}
async function request(path:string,options?:RequestInit){
  const token=getToken();
  const res=await fetch(`${API}${path}`,{...options,headers:{'content-type':'application/json',...(token?{authorization:`Bearer ${token}`}:{}),...(options?.headers??{})}});
  if(res.status===401){if(token)expireSession();throw new Error('unauthorized')}
  if(!res.ok)throw new Error(await res.text().catch(()=>'Xatolik'));
  return res.json();
}
/** Official Prime Capital brand-book mark (vector-traced from the PDF brand book) — replaces the old placeholder CSS bars. */
function LogoMark({className}:{className?:string}){
  return <svg className={className} viewBox="0 0 173.29 208.48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path fill="#068CEF" d="M45.27 167.44L45.27 3.96C45.27 1.52 42.63 0 40.52 1.22L1.58 23.7C0.6 24.27 0 25.31 0 26.44L0 144.96C0 146.09 0.6 147.13 1.58 147.7L40.52 170.18C42.63 171.4 45.27 169.88 45.27 167.44Z M109.28 77.59L109.28 26.44C109.28 25.31 108.68 24.27 107.7 23.7L68.76 1.22C66.65 0 64.01 1.52 64.01 3.96L64.01 100.07C64.01 102.51 66.65 104.03 68.76 102.81L107.7 80.33C108.68 79.76 109.28 78.72 109.28 77.59Z M64.01 182.04L64.01 130.89C64.01 129.76 64.62 128.72 65.6 128.15L104.53 105.67C106.64 104.45 109.28 105.98 109.28 108.41L109.28 204.52C109.28 206.96 106.64 208.48 104.53 207.26L65.6 184.78C64.62 184.21 64.01 183.17 64.01 182.04Z M128.02 41.04L128.02 204.52C128.02 206.96 130.66 208.48 132.77 207.26L171.71 184.78C172.69 184.21 173.29 183.17 173.29 182.04L173.29 63.52C173.29 62.39 172.69 61.35 171.71 60.78L132.77 38.3C130.66 37.08 128.02 38.6 128.02 41.04Z"/>
  </svg>;
}
declare global { interface Window { Telegram?: { WebApp?: { initData?: string; ready?: () => void; expand?: () => void; close?: () => void; openTelegramLink?: (url:string) => void } } } }
/** If opened from the bot's WebApp button, log in silently using Telegram's signed initData — no password screen for bot-registered users. */
async function loginWithTelegram(){
  const initData=typeof window!=='undefined'?window.Telegram?.WebApp?.initData:undefined;
  if(!initData)return false;
  try{const data=await request('/auth/telegram',{method:'POST',body:JSON.stringify({initData})});setToken(data.accessToken);return true}catch{return false}
}

export function WebApp({balances,properties,banners,videos}:{balances:Balance[];properties:PropertyListing[];banners:ContentItem[];videos:ContentItem[]}){
  const { t } = useLang();
  const [checking,setChecking]=useState(true);
  const [profile,setProfile]=useState<Profile|null>(null);
  const [sessionExpired,setSessionExpired]=useState(false);
  const [tab,setTab]=useState<Tab>('home');
  const [modal,setModal]=useState<'invest'|'withdraw'|'support'|'videos'|'promotion'|null>(null);
  const [notifications,setNotifications]=useState<ContentItem[]>([]);
  const [showNotifications,setShowNotifications]=useState(false);

  const navItems = [[Home,'home',t('wa.nav.home')],[Building2,'apartments',t('wa.nav.apartments')],[CircleDollarSign,'finance',t('wa.nav.finance')],[CircleUserRound,'profile',t('wa.nav.profile')]] as const;

  async function loadProfile(){
    window.Telegram?.WebApp?.ready?.();
    window.Telegram?.WebApp?.expand?.();
    let token=getToken();
    if(token&&tokenHasExpired(token)){
      expireSession();
      setChecking(false);
      return;
    }
    if(!token && await loginWithTelegram())token=getToken();
    if(!token){setChecking(false);return}
    try{
      const payload=JSON.parse(atob(token.split('.')[1]));
      const user=await request(`/users/${payload.sub}`);
      setProfile(user);
    }catch{expireSession();setProfile(null)}
    setChecking(false);
  }
  useEffect(()=>{
    const handleExpired=()=>{setProfile(null);setSessionExpired(true);setChecking(false)};
    window.addEventListener(AUTH_EXPIRED_EVENT,handleExpired);
    return()=>window.removeEventListener(AUTH_EXPIRED_EVENT,handleExpired);
  },[]);
  useEffect(()=>{void Promise.resolve().then(loadProfile)},[]);
  useEffect(()=>{if(profile)request('/notifications').then(setNotifications).catch(()=>setNotifications([]))},[profile]);

  if(checking)return <div className="webapp"/>;
  if(sessionExpired)return <SessionExpiredScreen/>;
  if(!profile)return <AuthScreen onSuccess={()=>{setChecking(true);loadProfile()}}/>;

  return <div className="webapp"><header className="top"><div className="logo"><LogoMark className="logo-mark"/><span><b>PRIME</b><small>CAPITAL</small></span></div><button aria-label={t('wa.notifications.title')} onClick={()=>setShowNotifications(x=>!x)}><Bell/>{notifications.length?<em/>:null}</button></header>
  {showNotifications?<NotificationsPanel items={notifications} onClose={()=>setShowNotifications(false)}/>:null}
  <main>
    {tab==='home'?<HomeScreen balances={myBalances(profile,balances)} properties={properties} banners={banners} onInvest={()=>setModal('invest')} onWithdraw={()=>setModal('withdraw')} onSupport={()=>setModal('support')} onVideos={()=>setModal('videos')}/>:null}
    {tab==='apartments'?<ApartmentsScreen properties={properties}/>:null}
    {tab==='finance'?<FinanceScreen/>:null}
    {tab==='profile'?<ProfileScreen profile={profile} onSupport={()=>setModal('support')} onVideos={()=>setModal('videos')} onPromotion={()=>setModal('promotion')} onLogout={()=>{clearToken();setProfile(null)}}/>:null}
  </main><nav className="bottom-nav">{navItems.map(([Icon,id,label])=><button className={tab===id?'active':''} onClick={()=>setTab(id)} key={id}><Icon/><span>{label}</span></button>)}</nav>
  {modal==='invest'?<MoneyModal title={t('wa.money.investTitle')} action="investments" onClose={()=>setModal(null)}/>:null}
  {modal==='withdraw'?<MoneyModal title={t('wa.money.withdrawTitle')} action="withdrawals" onClose={()=>setModal(null)}/>:null}
  {modal==='support'?<SupportModal onClose={()=>setModal(null)}/>:null}
  {modal==='videos'?<VideosModal items={videos} onClose={()=>setModal(null)}/>:null}
  {modal==='promotion'?<PromotionModal onClose={()=>setModal(null)}/>:null}
  </div>
}

function SessionExpiredScreen(){
  function returnToBot(){
    const telegram=window.Telegram?.WebApp;
    if(telegram?.openTelegramLink){
      telegram.openTelegramLink(BOT_START_URL);
      window.setTimeout(()=>telegram.close?.(),150);
      return;
    }
    window.location.assign(BOT_START_URL);
  }
  return <div className="auth-screen"><section className="session-expired-card" role="alert">
    <div className="session-expired-icon">↻</div>
    <h1>Seans muddati tugadi</h1>
    <p>Xavfsizlik uchun WebApp seansi yangilanadi. Prime Capital botiga qaytib, <b>/start</b> tugmasini bosing.</p>
    <button className="primary" type="button" onClick={returnToBot}>Botga qaytish</button>
  </section></div>
}

function NotificationsPanel({items,onClose}:{items:ContentItem[];onClose:()=>void}){
  const { t } = useLang();
  const [selected,setSelected]=useState<ContentItem|null>(null);
  return <div className="notif-overlay" onClick={onClose}><div className="notif-panel" onClick={(e)=>e.stopPropagation()}>
    <div className="modal-head"><h2>{t('wa.notifications.title')}</h2><button onClick={onClose}><X size={18}/></button></div>
    {items.length?items.map(item=><article className="notif-row" onClick={()=>setSelected(item)} key={item.id}><strong>{item.title}</strong>{item.description?<p>{item.description}</p>:null}</article>):<div className="empty-state">{t('wa.notifications.empty')}</div>}
  </div>
  {selected?<NotificationDetailModal item={selected} onClose={()=>setSelected(null)}/>:null}
  </div>
}
function NotificationDetailModal({item,onClose}:{item:ContentItem;onClose:()=>void}){
  return <div className="modal-overlay" onClick={onClose}><div className="modal-card notif-detail" onClick={(e)=>e.stopPropagation()}>
    <div className="modal-head"><h2>{item.title}</h2><button onClick={onClose}><X size={18}/></button></div>
    {item.imageUrl?<img className="notif-detail-media" src={item.imageUrl} alt={item.title}/>:null}
    {item.videoUrl?<video className="notif-detail-media" src={item.videoUrl} controls/>:null}
    {item.description?<p className="notif-detail-text">{item.description}</p>:null}
    {item.buttons?.length?<div className="notif-detail-buttons">{item.buttons.map((b,i)=><a key={i} className="notif-detail-button" href={b.url} target="_blank" rel="noreferrer">{b.label}</a>)}</div>:null}
  </div></div>
}

function VideosModal({items,onClose}:{items:ContentItem[];onClose:()=>void}){
  const { t } = useLang();
  return <div className="modal-overlay" onClick={onClose}><div className="modal-card" onClick={(e)=>e.stopPropagation()}>
    <div className="modal-head"><h2>{t('wa.videos.title')}</h2><button onClick={onClose}><X size={18}/></button></div>
    <div className="video-list">{items.length?items.map(item=><a className="video-row" href={item.url} target="_blank" rel="noreferrer" key={item.id}><PlayCircle/><div><strong>{item.title}</strong>{item.description?<span>{item.description}</span>:null}</div></a>):<div className="empty-state">{t('wa.videos.empty')}</div>}</div>
  </div></div>
}

function AuthScreen({onSuccess}:{onSuccess:()=>void}){
  const { t } = useLang();
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
    }catch{setStatus(mode==='login'?t('wa.auth.loginError'):t('wa.auth.registerError'))}
    finally{setLoading(false)}
  }
  return <div className="auth-screen"><div className="auth-card">
    <div className="logo"><LogoMark className="logo-mark"/><span><b>PRIME</b><small>CAPITAL</small></span></div>
    <div className="auth-tabs"><button className={mode==='login'?'active':''} onClick={()=>setMode('login')}>{t('wa.auth.login')}</button><button className={mode==='register'?'active':''} onClick={()=>setMode('register')}>{t('wa.auth.register')}</button></div>
    <form onSubmit={submit}>
      {mode==='register'?<label>{t('wa.auth.fullName')}<input name="name" required/></label>:null}
      <label>{t('wa.auth.email')}<input name="email" type="email" required/></label>
      {mode==='register'?<label>{t('wa.auth.phone')}<input name="phone" placeholder="+998 90 123 45 67"/></label>:null}
      <label>{t('wa.auth.password')}<input name="password" type="password" required minLength={6}/></label>
      <button className="primary" disabled={loading}>{loading?t('wa.auth.submitting'):mode==='login'?t('wa.auth.login'):t('wa.auth.register')}</button>
      {status?<small className="auth-error">{status}</small>:null}
    </form>
  </div></div>
}

function HomeScreen({balances,properties,banners,onInvest,onWithdraw,onSupport,onVideos}:{balances:Balance[];properties:PropertyListing[];banners:ContentItem[];onInvest:()=>void;onWithdraw:()=>void;onSupport:()=>void;onVideos:()=>void}){
  const { t } = useLang();
  const quickItems = [[PlusCircle,t('wa.quick.invest'),onInvest],[PlayCircle,t('wa.quick.videos'),onVideos],[Headphones,t('wa.quick.support'),onSupport],[WalletCards,t('wa.quick.withdrawFull'),onWithdraw]] as const;
  const hero=banners[0];
  return <>
 <section className="hero"><img src={hero?.imageUrl||'/residence.png'} alt={hero?.title||t('wa.hero.default.title')}/><div><h1>{hero?.title||t('wa.hero.default.title')}</h1><p>{hero?.description||t('wa.hero.default.subtitle')}</p><a href={hero?.url||'#'}><button>{t('wa.hero.viewProjects')} <span>→</span></button></a></div></section>
 {banners.length>1?<section className="banner-rail">{banners.slice(1).map(b=><a className="banner-card" href={b.url||'#'} key={b.id}>{b.imageUrl?<img src={b.imageUrl} alt={b.title}/>:null}<div><strong>{b.title}</strong>{b.description?<span>{b.description}</span>:null}</div></a>)}</section>:null}
 <section className="balances">{balances.slice(0,2).map((balance,index)=><article key={balance.id}><div className={`account-icon ${index?'cyan':''}`}>{index?<Landmark/>:<Building2/>}</div><div><h2>{balance.name}</h2><span>{t('wa.balances.accountNumber')}</span></div><strong>{usd(balance.amount)}</strong><p>{t('wa.balances.monthlyChange')} <b className={balance.monthlyChange<0?'negative':''}>{balance.monthlyChange>0?'+':''}{balance.monthlyChange}% {balance.monthlyChange>0?'↗':'↘'}</b></p></article>)}</section>
 <section className="quick">{quickItems.map(([Icon,label,onClick])=><button key={label} onClick={onClick}><span><Icon/></span>{label}</button>)}</section><Chart/>
 <section className="property-section"><div className="section-title"><h2>{t('wa.home.newBuildings')}</h2><button>{t('wa.home.viewAll')} →</button></div><div className="property-rail">{properties.slice(0,3).map((item)=><article key={item.id}><div className="property-image"><img src="/residence.png" alt=""/><b>{t('wa.home.newBadge')}</b></div><h3>{item.title}</h3><p><MapPin/> {item.location}</p><strong>{usd(item.price)}</strong></article>)}</div></section></>}
function Chart(){
  const { t } = useLang();
  return <section className="chart-card"><div className="section-title"><h2>{t('wa.chart.title')}</h2><select aria-label={t('wa.chart.title')}><option>{t('wa.chart.period.6m')}</option><option>{t('wa.chart.period.1y')}</option></select></div><div className="chart-legend"><i/> PHP Invest <i/> Prime Capital</div><svg viewBox="0 0 700 250" role="img" aria-label={t('wa.chart.title')}><g className="lines"><line x1="30" y1="45" x2="680" y2="45"/><line x1="30" y1="105" x2="680" y2="105"/><line x1="30" y1="165" x2="680" y2="165"/><line x1="30" y1="225" x2="680" y2="225"/></g><polyline className="turquoise" points="30,120 150,100 270,85 390,95 510,70 680,42"/><polyline className="blue" points="30,190 150,178 270,165 390,140 510,110 680,75"/></svg></section>}
function ApartmentsScreen({properties}:{properties:PropertyListing[]}){
  const { t } = useLang();
  return <section className="page"><h1>{t('wa.apartments.title')}</h1><p>{t('wa.apartments.subtitle')}</p><div className="apartment-list">{properties.map(item=><article key={item.id}><img src="/residence.png" alt=""/><div><span>{item.type==='new-build'?t('wa.apartments.newBuild'):t('wa.apartments.secondary')}</span><h2>{item.title}</h2><p><MapPin/> {item.location}</p><strong>{usd(item.price)}</strong></div></article>)}</div></section>}

function FinanceScreen(){
  const { t } = useLang();
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
  return <section className="page finance-page"><h1>{t('wa.nav.finance')}</h1><p>{t('wa.finance.subtitle')}</p>
    <div className="finance-total"><span>{t('wa.finance.currentBalance')}</span><strong>{money(total)} so‘m</strong><button onClick={()=>setShowForm(x=>!x)}>{showForm?t('wa.finance.cancel'):t('wa.finance.addExpense')}</button></div>
    {showForm?<form className="finance-form" onSubmit={submit}>
      <select name="type" defaultValue="expense"><option value="income">{t('wa.finance.income')}</option><option value="expense">{t('wa.finance.expense')}</option></select>
      <input name="category" placeholder={t('wa.finance.category')} required/>
      <input name="amount" type="number" placeholder={t('wa.finance.amount')} required min={1}/>
      <input name="note" placeholder={t('wa.finance.note')}/>
      <button className="primary" type="submit">{t('wa.finance.save')}</button>
    </form>:null}
    {loading?<div className="empty-state">{t('wa.finance.loading')}</div>:entries.length?entries.map((item)=><div className="entry" key={item.id}><i className={item.type}/><div><b>{item.category}</b><span>{item.type==='income'?t('wa.finance.income'):t('wa.finance.expense')}</span></div><strong className={item.type}>{item.type==='income'?'+':'-'}{money(item.amount)}</strong></div>):<div className="empty-state">{t('wa.finance.empty')}</div>}
  </section>}

function ProfileScreen({profile,onSupport,onVideos,onPromotion,onLogout}:{profile:Profile;onSupport:()=>void;onVideos:()=>void;onPromotion:()=>void;onLogout:()=>void}){
  const { t } = useLang();
  const balances:Balance[]=[{id:'prime-capital',name:'Prime Capital',amount:profile.primeCapital,monthlyChange:0,updatedAt:new Date().toISOString()},{id:'php-invest',name:'PHP Invest',amount:profile.phpInvest,monthlyChange:0,updatedAt:new Date().toISOString()}];
  const items:[string,(()=>void)?][]=[[t('wa.profile.myInfo')],[t('wa.support.title'),onSupport],[t('wa.profile.myAssets')],[`${t('wa.profile.phpInvestBalance')}: ${usd(profile.phpInvest)}`],[`${t('wa.profile.primeCapitalBalance')}: ${usd(profile.primeCapital)}`],[t('wa.videos.title'),onVideos],['Investitsiya haqida xabar berish',onPromotion]];
  return <section className="page profile-page"><div className="profile-head">{profile.photoUrl?<img className="profile-photo" src={profile.photoUrl} alt={profile.name}/>:<CircleUserRound/>}<div><h1>{profile.name}</h1><p>{profile.email}</p></div></div>
    <div className="profile-lang-row"><span>{t('wa.profile.language')}</span><LanguageSwitcher className="lang-switcher"/></div>
    {items.map(([label,onClick])=><button key={label} onClick={onClick}>{label}<span>›</span></button>)}
    <button className="logout" onClick={onLogout}>{t('nav.logout')}</button>
    <small>{t('wa.profile.totalBalance')}: {usd(balances.reduce((s,b)=>s+b.amount,0))}</small></section>}

function MoneyModal({title,action,onClose}:{title:string;action:'investments'|'withdrawals';onClose:()=>void}){
  const { t } = useLang();
  const [status,setStatus]=useState('');
  const [done,setDone]=useState(false);
  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    const form=e.currentTarget,f=new FormData(form);
    setStatus(t('wa.money.sending'));
    try{
      await request(`/${action}`,{method:'POST',body:JSON.stringify({product:f.get('product'),amount:Number(f.get('amount')),note:f.get('note')})});
      setDone(true);setStatus(t('wa.money.success'));
    }catch{setStatus(t('wa.money.error'))}
  }
  return <div className="modal-overlay" onClick={onClose}><div className="modal-card" onClick={(e)=>e.stopPropagation()}>
    <div className="modal-head"><h2>{title}</h2><button onClick={onClose}><X size={18}/></button></div>
    {done?<p className="modal-success">{status}</p>:<form onSubmit={submit}>
      <label>{t('wa.money.direction')}<select name="product" defaultValue="prime-capital"><option value="prime-capital">Prime Capital</option><option value="php-invest">PHP Invest</option></select></label>
      <label>{t('wa.money.title')} ($)<input name="amount" type="number" required min={1}/></label>
      <label>{t('wa.money.note')}<input name="note"/></label>
      <button className="primary" type="submit">{t('wa.money.send')}</button>
      {status?<small>{status}</small>:null}
    </form>}
  </div></div>
}

function compressImage(file:File):Promise<string>{return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onerror=reject;reader.onload=()=>{const image=new Image();image.onerror=reject;image.onload=()=>{const canvas=document.createElement('canvas');const scale=Math.min(1,1600/Math.max(image.width,image.height));canvas.width=Math.round(image.width*scale);canvas.height=Math.round(image.height*scale);canvas.getContext('2d')?.drawImage(image,0,0,canvas.width,canvas.height);let quality=0.82;const encode=()=>{const data=canvas.toDataURL('image/jpeg',quality);if(data.length<=1.5e6||quality<=0.45)return resolve(data);quality-=0.08;encode()};encode()};image.src=String(reader.result)};reader.readAsDataURL(file)})}
type SelectedPromotionImage={file:File;previewUrl:string};
function PromotionModal({onClose}:{onClose:()=>void}){
  const [status,setStatus]=useState('');
  const [done,setDone]=useState(false);
  const [images,setImages]=useState<SelectedPromotionImage[]>([]);
  const imageRef=useRef<SelectedPromotionImage[]>([]);
  const galleryInputRef=useRef<HTMLInputElement>(null);
  const cameraInputRef=useRef<HTMLInputElement>(null);
  useEffect(()=>{imageRef.current=images},[images]);
  useEffect(()=>()=>{imageRef.current.forEach(image=>URL.revokeObjectURL(image.previewUrl))},[]);

  function addImages(event:ChangeEvent<HTMLInputElement>){
    const files=Array.from(event.target.files??[]);
    event.target.value='';
    const available=5-images.length;
    if(!files.length)return;
    const valid=files.filter(file=>file.type.startsWith('image/')&&file.size<=12*1024*1024).slice(0,available);
    if(!valid.length){setStatus('JPG yoki PNG formatdagi, 12 MB gacha bo‘lgan rasmni tanlang');return;}
    if(valid.length<files.length)setStatus(available?`Faqat ${available} ta rasm qo‘shildi (jami 5 ta mumkin)`:'5 ta rasm tanlangan');
    else setStatus('');
    setImages(current=>[...current,...valid.map(file=>({file,previewUrl:URL.createObjectURL(file)}))]);
  }
  function removeImage(previewUrl:string){
    setImages(current=>{
      const removed=current.find(image=>image.previewUrl===previewUrl);
      if(removed)URL.revokeObjectURL(removed.previewUrl);
      return current.filter(image=>image.previewUrl!==previewUrl);
    });
  }
  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    const f=new FormData(e.currentTarget);
    if(!images.length){setStatus('Tasdiqlovchi rasmni qo‘shing');return;}
    const phpInvestAmount=Number(f.get('phpInvestAmount')||0), primeCapitalAmount=Number(f.get('primeCapitalAmount')||0);
    if(phpInvestAmount<=0&&primeCapitalAmount<=0){setStatus('PHP Invest yoki Prime Capital summasini kiriting');return;}
    setStatus('Rasmlar tayyorlanmoqda…');
    const compressedImages=await Promise.all(images.map(image=>compressImage(image.file)));
    const description=String(f.get('description')??'').trim();
    try{
      await request('/promotion-reports',{method:'POST',body:JSON.stringify({phpInvestAmount,primeCapitalAmount,description:description||undefined,images:compressedImages})});
      setDone(true);
      setStatus('Xabaringiz yuborildi. Admin tekshirganidan so‘ng balansingiz to‘ldiriladi.');
    }catch(err){setStatus(err instanceof Error?err.message:'Xatolik yuz berdi')}
  }
  return <div className="modal-overlay" onClick={onClose}><div className="modal-card promotion-modal" onClick={e=>e.stopPropagation()}>
    <div className="modal-head"><div><h2>Investitsiya haqida xabar berish</h2><p>Tasdiqlash uchun rasm qo‘shing.</p></div><button aria-label="Yopish" onClick={onClose}><X size={18}/></button></div>
    {done?<p className="modal-success">{status}</p>:<form onSubmit={submit}>
      <div className="promotion-amounts"><label>PHP Invest ($)<input name="phpInvestAmount" type="number" min="0" step="0.01" placeholder="0"/></label><label>Prime Capital ($)<input name="primeCapitalAmount" type="number" min="0" step="0.01" placeholder="0"/></label></div>
      <label>Izoh <span className="field-optional">(ixtiyoriy)</span><textarea name="description" rows={3} placeholder="Qisqacha izoh yozing..."/></label>
      <div className="promotion-attachments"><div><strong>Rasmlar</strong><span>1–5 ta rasm. Katta rasm avtomatik kichraytiriladi.</span></div><div className="promotion-attachment-actions"><button type="button" onClick={()=>cameraInputRef.current?.click()}><Camera size={18}/> Kameradan</button><button type="button" className="gallery-button" onClick={()=>galleryInputRef.current?.click()}><ImagePlus size={18}/> Rasm qo‘shish</button></div></div>
      <input ref={cameraInputRef} className="sr-only" type="file" accept="image/*" capture="environment" onChange={addImages}/><input ref={galleryInputRef} className="sr-only" type="file" accept="image/*" multiple onChange={addImages}/>
      {images.length?<div className="promotion-preview-grid">{images.map(image=><figure key={image.previewUrl}><img src={image.previewUrl} alt="Tanlangan rasm"/><button type="button" aria-label="Rasmni olib tashlash" onClick={()=>removeImage(image.previewUrl)}><X size={16}/></button></figure>)}</div>:<div className="promotion-empty-preview"><ImagePlus size={22}/><span>Hali rasm tanlanmagan</span></div>}
      <button className="primary" type="submit">Yuborish</button>{status?<small className="promotion-status">{status}</small>:null}
    </form>}
  </div></div>
}

function SupportModal({onClose}:{onClose:()=>void}){
  const { t } = useLang();
  const [status,setStatus]=useState('');
  const [done,setDone]=useState(false);
  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    const form=e.currentTarget,f=new FormData(form);
    setStatus(t('wa.money.sending'));
    try{
      await request('/support',{method:'POST',body:JSON.stringify({subject:f.get('subject'),message:f.get('message')})});
      setDone(true);setStatus(t('wa.support.success'));
    }catch{setStatus(t('wa.support.error'))}
  }
  return <div className="modal-overlay" onClick={onClose}><div className="modal-card" onClick={(e)=>e.stopPropagation()}>
    <div className="modal-head"><h2>{t('wa.support.title')}</h2><button onClick={onClose}><X size={18}/></button></div>
    {done?<p className="modal-success">{status}</p>:<form onSubmit={submit}>
      <label>{t('wa.support.subject')}<input name="subject" required/></label>
      <label>{t('wa.support.message')}<textarea name="message" rows={4} required/></label>
      <button className="primary" type="submit">{t('wa.support.send')}</button>
      {status?<small>{status}</small>:null}
    </form>}
  </div></div>
}
