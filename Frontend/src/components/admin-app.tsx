'use client';
import { FormEvent, useEffect, useState } from 'react';
import { Banknote, Bell, BookOpen, Building2, CircleUserRound, Gauge, Headphones, Image, LogOut, Plus, Search, Settings, ShieldCheck, UsersRound, WalletCards } from 'lucide-react';
import type { DashboardSummary, PropertyListing } from '@prime/contracts';
import { BalanceChart } from './chart'; import { BalanceEditor } from './balance-editor'; import { PropertyTable } from './property-table';
const API='/api';
const TOKEN_KEY='prime_admin_token';
type Section='dashboard'|'balances'|'properties'|'banners'|'videos'|'notifications'|'requests'|'support'|'users'|'settings';
type Item=Record<string,unknown>&{id:string;title?:string;description?:string;name?:string;phone?:string;phpInvest?:number;primeCapital?:number;url?:string};
type AdminUser={id:string;name:string;email:string};
const menu:[Section,string,typeof Gauge][]=[['dashboard','Dashboard',Gauge],['balances','Balanslar',WalletCards],['properties','Kvartiralar',Building2],['banners','Bannerlar',Image],['videos','Video darslar',BookOpen],['notifications','Bildirishnomalar',Bell],['requests','So‘rovlar',Banknote],['support','Support',Headphones],['users','Foydalanuvchilar',UsersRound],['settings','Sozlamalar',Settings]];
const money=(n:number)=>new Intl.NumberFormat('uz-UZ',{maximumFractionDigits:2}).format(n);
function getToken(){return typeof window==='undefined'?null:localStorage.getItem(TOKEN_KEY)}
function setToken(token:string){localStorage.setItem(TOKEN_KEY,token)}
function clearToken(){localStorage.removeItem(TOKEN_KEY)}
async function request(path:string,options?:RequestInit){
  const token=getToken();
  const res=await fetch(`${API}${path}`,{...options,headers:{'content-type':'application/json',...(token?{authorization:`Bearer ${token}`}:{}) ,...(options?.headers??{})}});
  if(res.status===401){clearToken();window.location.reload();throw new Error('Sessiya tugadi')}
  if(!res.ok)throw new Error(await res.text());
  return res.json();
}
export function AdminApp({dashboard}:{dashboard:DashboardSummary}){
  const [section,setSection]=useState<Section>('dashboard');
  const [mounted,setMounted]=useState(false);
  const [user,setUser]=useState<AdminUser|null>(null);
  const [checking,setChecking]=useState(true);
  useEffect(()=>{
    setMounted(true);
    const token=getToken();
    if(!token){setChecking(false);return}
    try{const payload=JSON.parse(atob(token.split('.')[1]));if(payload.role!=='admin')throw new Error();setUser({id:payload.sub,name:'Admin',email:payload.email})}catch{clearToken()}
    setChecking(false);
  },[]);
  if(!mounted||checking)return <div className="app-shell"/>;
  if(!user)return <Login onSuccess={(u)=>setUser(u)}/>;
  return <div className="app-shell"><aside className="sidebar"><div className="brand"><div className="brand-mark"><i/><i/><i/></div><div><strong>PRIME</strong><span>CAPITAL</span></div></div><nav>{menu.map(([id,label,Icon])=><button key={id} onClick={()=>setSection(id)} className={section===id?'active':''}><Icon size={20}/><span>{label}</span></button>)}</nav><div className="admin-mini"><CircleUserRound size={38}/><div><strong>{user.name}</strong><span>Super Admin</span></div></div></aside><main><header><div><h1>{menu.find(i=>i[0]===section)?.[1]}</h1><p>Prime Capital platformasini boshqaring</p></div><div className="header-tools"><label><Search size={18}/><input placeholder="Qidirish..."/></label><button className="notification"><Bell size={20}/><span>1</span></button><div className="avatar">AD</div><strong>{user.email}</strong></div></header><div className="content">{section==='dashboard'?<Dashboard data={dashboard}/>:null}{section==='balances'?<Balances data={dashboard}/>:null}{section==='properties'?<PropertiesManager/>:null}{section==='banners'?<ContentManager type="banners" title="Bannerlar" image/>:null}{section==='videos'?<ContentManager type="videos" title="Video darslar"/>:null}{section==='notifications'?<Notifications/>:null}{section==='requests'?<Requests/>:null}{section==='support'?<Support/>:null}{section==='users'?<Users/>:null}{section==='settings'?<SettingsPanel onLogout={()=>{clearToken();setUser(null)}}/>:null}</div></main></div>
}
function Login({onSuccess}:{onSuccess:(user:AdminUser)=>void}){
  const [status,setStatus]=useState('');
  const [loading,setLoading]=useState(false);
  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    const form=e.currentTarget,f=new FormData(form);
    setLoading(true);setStatus('');
    try{
      const res=await fetch(`${API}/auth/login`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:f.get('email'),password:f.get('password')})});
      if(!res.ok)throw new Error();
      const data=await res.json();
      if(data.user.role!=='admin')throw new Error('not-admin');
      setToken(data.accessToken);
      onSuccess({id:data.user.id,name:data.user.name,email:data.user.email});
    }catch{setStatus('Email yoki parol noto‘g‘ri, yoki admin huquqi yo‘q')}
    finally{setLoading(false)}
  }
  return <div className="login-screen"><form className="login-card" onSubmit={submit}>
    <div className="brand"><div className="brand-mark"><i/><i/><i/></div><div><strong>PRIME</strong><span>CAPITAL</span></div></div>
    <h1><ShieldCheck size={22}/> Admin panelga kirish</h1>
    <label>Email<input name="email" type="email" required autoFocus/></label>
    <label>Parol<input name="password" type="password" required minLength={6}/></label>
    <button className="primary" disabled={loading}>{loading?'Tekshirilmoqda...':'Kirish'}</button>
    {status?<small className="save-error">{status}</small>:null}
  </form></div>
}
function Dashboard({data}:{data:DashboardSummary}){const cards=[['Jami foydalanuvchilar',data.users.toLocaleString('uz-UZ'),'+8.4%'],['Prime Capital',money(data.balances[0].amount),`${data.balances[0].monthlyChange}%`],['PHP Invest',money(data.balances[1].amount),`${data.balances[1].monthlyChange}%`],['Faol e’lonlar',String(data.activeListings),'+12.1%']];return <><section className="stats">{cards.map(([l,v,c],i)=><article key={l}><div className={`stat-icon c${i}`}>{i+1}</div><div><span>{l}</span><strong>{v}</strong><small>{c} <em>o‘tgan oyga nisbatan</em></small></div></article>)}</section><div className="dashboard-grid"><BalanceChart/><BalanceEditor initialBalances={data.balances}/><PropertyTable items={data.recentProperties}/><section className="panel activity"><h2>So‘nggi faoliyat</h2><div className="empty-state">Boshqaruv amallari shu yerda ko‘rinadi.</div></section></div></>}
function Balances({data}:{data:DashboardSummary}){const [product,setProduct]=useState('prime-capital'),[percent,setPercent]=useState(10),[status,setStatus]=useState('');async function apply(e:FormEvent){e.preventDefault();setStatus('Yuborilmoqda...');try{const r=await request('/users/apply-percent',{method:'POST',body:JSON.stringify({product,percent})});setStatus(`${r.affectedUsers} foydalanuvchiga ${percent}% qo‘llandi`)}catch{setStatus('Xatolik yuz berdi')}}return <div className="admin-grid"><BalanceEditor initialBalances={data.balances}/><section className="panel form-panel"><h2>Balanslarga foiz qo‘shish</h2><p>Barcha foydalanuvchilarning tanlangan balansiga foiz qo‘llanadi.</p><form onSubmit={apply}><label>Yo‘nalish<select value={product} onChange={e=>setProduct(e.target.value)}><option value="prime-capital">Prime Capital</option><option value="php-invest">PHP Invest</option></select></label><label>Foiz<input type="number" step="0.1" value={percent} onChange={e=>setPercent(+e.target.value)}/></label><button className="primary">Foizni qo‘llash</button><small>{status}</small></form></section></div>}
function ContentManager({type,title,image=false}:{type:'banners'|'videos';title:string;image?:boolean}){const [list,setList]=useState<Item[]>([]),[status,setStatus]=useState('');useEffect(()=>{request(`/${type}`).then(setList).catch(()=>setList([]))},[type]);async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();const form=e.currentTarget,f=new FormData(form),body={title:f.get('title'),description:f.get('description'),url:f.get('url'),imageUrl:f.get('imageUrl'),status:'active'};try{const created=await request(`/${type}`,{method:'POST',body:JSON.stringify(body)});setList(x=>[created,...x]);form.reset();setStatus('Saqlandi')}catch{setStatus('Saqlashda xatolik')}}async function remove(id:string){await request(`/${type}/${id}`,{method:'DELETE'});setList(x=>x.filter(i=>i.id!==id))}return <div className="admin-grid"><section className="panel form-panel"><h2>Yangi {title.toLowerCase()} qo‘shish</h2><form onSubmit={submit}><label>Sarlavha<input name="title" required/></label><label>Tavsif<textarea name="description" rows={4}/></label>{image?<label>Rasm URL<input name="imageUrl" type="url" placeholder="https://..."/></label>:null}<label>{image?'Yo‘naltirish URL':'YouTube URL'}<input name="url" type="url" required placeholder="https://youtube.com/..."/></label><button className="primary"><Plus size={17}/> Qo‘shish</button><small>{status}</small></form></section><section className="panel list-panel"><h2>{title} ro‘yxati</h2>{list.map(i=><article className="content-row" key={i.id}><div><strong>{i.title}</strong><p>{i.description as string}</p><a href={i.url as string} target="_blank">{i.url as string}</a></div><button onClick={()=>remove(i.id)}>O‘chirish</button></article>)}{!list.length?<div className="empty-state">Hozircha ma’lumot yo‘q.</div>:null}</section></div>}
function PropertiesManager(){
  const [list,setList]=useState<PropertyListing[]>([]),[status,setStatus]=useState('');
  useEffect(()=>{request('/properties').then(setList).catch(()=>setList([]))},[]);
  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    const form=e.currentTarget,f=new FormData(form);
    const body={title:f.get('title'),type:f.get('type'),location:f.get('location'),price:Number(f.get('price')),rooms:Number(f.get('rooms')),area:Number(f.get('area')),status:'active'};
    try{const created=await request('/properties',{method:'POST',body:JSON.stringify(body)});setList(x=>[created,...x]);form.reset();setStatus('Saqlandi — webappda darhol ko‘rinadi')}catch{setStatus('Saqlashda xatolik')}
  }
  async function remove(id:string){await request(`/properties/${id}`,{method:'DELETE'});setList(x=>x.filter(i=>i.id!==id))}
  async function changeStatus(id:string,value:string){const updated=await request(`/properties/${id}`,{method:'PATCH',body:JSON.stringify({status:value})});setList(x=>x.map(i=>i.id===id?updated:i))}
  return <div className="admin-grid"><section className="panel form-panel"><h2>Yangi kvartira e’loni</h2><form onSubmit={submit}>
    <label>Sarlavha<input name="title" required/></label>
    <label>Turi<select name="type" defaultValue="new-build"><option value="new-build">Novostroyka</option><option value="resale">Ikkilamchi</option></select></label>
    <label>Manzil<input name="location" required/></label>
    <label>Narxi (so‘m)<input name="price" type="number" required min={1}/></label>
    <label>Xonalar soni<input name="rooms" type="number" required min={1}/></label>
    <label>Maydoni (m²)<input name="area" type="number" required min={1}/></label>
    <button className="primary"><Plus size={17}/> Qo‘shish</button><small>{status}</small>
  </form></section>
  <section className="panel list-panel"><h2>Kvartiralar ro‘yxati</h2>{list.map(item=><article className="content-row" key={item.id}><div><strong>{item.title}</strong><p>{item.location} · {money(item.price)} so‘m · {item.rooms} xona</p><select value={item.status} onChange={(e)=>changeStatus(item.id,e.target.value)}><option value="active">Faol</option><option value="pending">Kutilmoqda</option><option value="inactive">Nofaol</option></select></div><button onClick={()=>remove(item.id)}>O‘chirish</button></article>)}{!list.length?<div className="empty-state">Hozircha kvartira yo‘q.</div>:null}</section></div>
}
function Requests(){
  const [tab,setTab]=useState<'investments'|'withdrawals'>('investments');
  const [list,setList]=useState<Item[]>([]);
  useEffect(()=>{request(`/${tab}`).then(setList).catch(()=>setList([]))},[tab]);
  async function decide(id:string,decision:'approved'|'rejected'){const updated=await request(`/${tab}/${id}/status`,{method:'PATCH',body:JSON.stringify({status:decision})});setList(x=>x.map(i=>i.id===id?updated:i))}
  return <section className="panel list-panel wide-form"><div className="panel-head"><h2>Investitsiya va pul yechish so‘rovlari</h2><select value={tab} onChange={(e)=>setTab(e.target.value as 'investments'|'withdrawals')}><option value="investments">Investitsiyalar</option><option value="withdrawals">Pul yechishlar</option></select></div>
    {list.map(item=><article className="content-row" key={item.id}><div><strong>{money(Number(item.amount??0))} so‘m</strong><p>{String(item.product)} · {String(item.userId)} {item.note?`· ${item.note}`:''}</p><span className={`status ${item.status}`}>{item.status==='pending'?'Kutilmoqda':item.status==='approved'?'Tasdiqlandi':'Rad etildi'}</span></div>{item.status==='pending'?<div className="request-actions"><button onClick={()=>decide(item.id,'approved')}>Tasdiqlash</button><button onClick={()=>decide(item.id,'rejected')}>Rad etish</button></div>:null}</article>)}
    {!list.length?<div className="empty-state">Hozircha so‘rov yo‘q.</div>:null}
  </section>
}
function Support(){
  const [list,setList]=useState<Item[]>([]);
  useEffect(()=>{request('/support').then(setList).catch(()=>setList([]))},[]);
  async function resolve(id:string){const updated=await request(`/support/${id}/status`,{method:'PATCH',body:JSON.stringify({status:'resolved'})});setList(x=>x.map(i=>i.id===id?updated:i))}
  return <section className="panel list-panel wide-form"><h2>Support so‘rovlari</h2>
    {list.map(item=><article className="content-row" key={item.id}><div><strong>{String(item.subject)}</strong><p>{String(item.message)}</p><span className={`status ${item.status}`}>{item.status==='resolved'?'Yechildi':'Kutilmoqda'}</span></div>{item.status!=='resolved'?<button onClick={()=>resolve(item.id)}>Yechildi deb belgilash</button>:null}</article>)}
    {!list.length?<div className="empty-state">Hozircha murojaat yo‘q.</div>:null}
  </section>
}
function Notifications(){const [status,setStatus]=useState('');async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();const form=e.currentTarget,f=new FormData(form);setStatus('Yuborilmoqda...');try{const body={title:f.get('title'),message:f.get('message')},r=await request('/telegram/broadcast',{method:'POST',body:JSON.stringify(body)});await request('/notifications',{method:'POST',body:JSON.stringify({title:body.title,description:body.message,status:'active'})});setStatus(`${r.sent}/${r.total} foydalanuvchiga yuborildi`);form.reset()}catch{setStatus('Yuborishda xatolik')}}return <section className="panel form-panel wide-form"><h2>Foydalanuvchilarga bildirishnoma yuborish</h2><p>Xabar bot orqali ro‘yxatdan o‘tgan barcha Telegram foydalanuvchilariga yuboriladi.</p><form onSubmit={submit}><label>Sarlavha<input name="title" required/></label><label>Xabar<textarea name="message" rows={7} required/></label><button className="primary"><Bell size={17}/> Hammaga yuborish</button><small>{status}</small></form></section>}
function Users(){const [users,setUsers]=useState<Item[]>([]),[status,setStatus]=useState('');useEffect(()=>{request('/users').then(setUsers)},[]);async function save(u:Item){try{const updated=await request(`/users/${u.id}/balances`,{method:'PATCH',body:JSON.stringify({phpInvest:Number(u.phpInvest??0),primeCapital:Number(u.primeCapital??0)})});setUsers(x=>x.map(i=>i.id===u.id?updated:i));setStatus(`${u.name} balansi saqlandi`)}catch{setStatus('Xatolik')}}function change(id:string,key:'phpInvest'|'primeCapital',value:number){setUsers(x=>x.map(u=>u.id===id?{...u,[key]:value}:u))}return <section className="panel users-panel"><div className="panel-head"><div><h2>Foydalanuvchi balanslari</h2><p>PHP Invest va Prime Capital mablag‘larini individual boshqaring.</p></div><small>{status}</small></div><div className="table-wrap"><table><thead><tr><th>F.I.O</th><th>Telefon</th><th>PHP Invest ($)</th><th>Prime Capital ($)</th><th></th></tr></thead><tbody>{users.filter(u=>u.id!=='admin').map(u=><tr key={u.id}><td><b>{u.name}</b></td><td>{u.phone}</td><td><input type="number" value={u.phpInvest??0} onChange={e=>change(u.id,'phpInvest',+e.target.value)}/></td><td><input type="number" value={u.primeCapital??0} onChange={e=>change(u.id,'primeCapital',+e.target.value)}/></td><td><button className="table-save" onClick={()=>save(u)}>Saqlash</button></td></tr>)}</tbody></table></div></section>}
function SettingsPanel({onLogout}:{onLogout:()=>void}){const [status,setStatus]=useState('');async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();const form=e.currentTarget,f=new FormData(form);if(f.get('newPassword')!==f.get('confirm'))return setStatus('Yangi parollar mos emas');try{await request('/settings/credentials',{method:'POST',body:JSON.stringify({email:f.get('email'),currentPassword:f.get('currentPassword'),newPassword:f.get('newPassword')})});setStatus('Login va parol yangilandi. Qayta kiring.');form.reset();setTimeout(onLogout,1200)}catch{setStatus('Joriy parol noto‘g‘ri yoki server xatosi')}}return <section className="panel form-panel wide-form"><h2>Admin login va parolini o‘zgartirish</h2><form onSubmit={submit}><label>Yangi login (email)<input name="email" type="email" required/></label><label>Joriy parol<input name="currentPassword" type="password" required minLength={6}/></label><label>Yangi parol<input name="newPassword" type="password" required minLength={6}/></label><label>Yangi parolni takrorlang<input name="confirm" type="password" required minLength={6}/></label><button className="primary"><Settings size={17}/> Saqlash</button><small>{status}</small></form><button className="logout-admin" onClick={onLogout}><LogOut size={17}/> Tizimdan chiqish</button></section>}
