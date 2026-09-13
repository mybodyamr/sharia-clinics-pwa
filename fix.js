/* V3.1 hotfix: automatic skipped-patient handling + QR fallback. */
(function(){
  'use strict';
  const DB_KEY='sharia_clinics_demo_v2';
  function load(){try{return JSON.parse(localStorage.getItem(DB_KEY)||'null')}catch{return null}}
  function save(db){localStorage.setItem(DB_KEY,JSON.stringify(db))}
  function today(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
  function markEarlierLate(code){
    const db=load(); if(!db||!Array.isArray(db.bookings))return [];
    const b=db.bookings.find(x=>x.code===code); if(!b)return [];
    const earlier=db.bookings.filter(x=>x.date===today()&&x.clinicId===b.clinicId&&x.queue<b.queue&&x.status==='waiting');
    if(!earlier.length)return [];
    const now=new Date().toISOString();
    earlier.forEach(x=>{x.status='late';x.lateAt=now;x.lateReason=`لم يكن متواجداً عند وصول الدور #${b.queue}`});
    save(db); return earlier;
  }
  function qrFallback(el,text){
    if(!el||!text)return;
    setTimeout(()=>{
      if(el.querySelector('canvas,img,table'))return;
      const img=document.createElement('img');img.width=190;img.height=190;img.alt='QR التذكرة';img.loading='eager';img.referrerPolicy='no-referrer';
      img.src='https://quickchart.io/qr?size=190&margin=2&text='+encodeURIComponent(text);
      el.appendChild(img);
    },350);
  }
  function findCodeForQR(el){
    const db=load(); if(!db?.bookings?.length)return null;
    if(el.id==='capture-qr'){
      const b=db.bookings.filter(x=>x.date===today()).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt))[0];
      return b?.code||null;
    }
    const id=el.id?.replace(/^qr-/,'');
    return db.bookings.find(x=>x.id===id)?.code||null;
  }
  function boot(){
    if(window.__shariaV31)return; window.__shariaV31=true;
    const oldScan=window.scanCode;
    if(oldScan){
      window.scanCode=function(){
        const raw=(document.getElementById('scan-input')?.value||'').trim();
        if(raw)markEarlierLate(raw);
        return oldScan.apply(this,arguments);
      };
    }
    const observer=new MutationObserver(()=>{
      document.querySelectorAll('.ticket-qr,#capture-qr').forEach(q=>{const code=findCodeForQR(q);if(code)qrFallback(q,code)});
    });
    observer.observe(document.body,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
