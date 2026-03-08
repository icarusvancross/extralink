"use client";
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '../lib/supabase'; 
import Script from 'next/script';

export default function WaitingPage() {
  const { code } = useParams();
  const [isMounted, setIsMounted] = useState(false);
  const [linkData, setLinkData] = useState<any>(null);
  const [step, setStep] = useState(1);
  const [isFinalPage, setIsFinalPage] = useState(false);
  const [count, setCount] = useState(15);
  const [isPaused, setIsPaused] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [showRealButton, setShowRealButton] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [isAdBlockerActive, setIsAdBlockerActive] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  // 🛑 روابط HilltopAds و PopAds النهائية
  const ADS = {
    POPUNDER: "https://plasticdamage.com/cmDY9.6qbJ2K5hlCS/WNQr9gNUjGgz0nOTDdYXwxNRSW0-2FOKDhQP4SNljVA/5U",
    INPAGE_PUSH: "https://conventionalresponse.com/beX.VJsdd/GUlr0/YdWBcV/teJmT9/uoZbUBlLkqP/ThYG4yNCD/g_2wMrjhkotyNnjRg/0LOfDWY/z/MgwV",
    VIDEO_SLIDER: "https://conventionalresponse.com/b.XiVysXdIGClx0lYuW_cE/-eJm/9Eu/ZfU_lHk/PzToY/4ENjDugV2/NTDmUPtPNljrgg0AOoDqYJ0yOKQN",
    FINAL_POP_LINK: "https://www.effectivegatecpm.com/rcbjyg6w?key=4b7c5edb9470ea073ea974701e4201aa"
  };

  useEffect(() => {
    setIsMounted(true);
    const initSecurity = async () => {
      try {
        // 1. فحص مانع الإعلانات بذكاء (Bait Element)
        const bait = document.createElement('div');
        bait.className = 'pub_300x250 text-ads ad-placeholder';
        bait.style.cssText = 'width:1px;height:1px;position:absolute;left:-1000px;';
        document.body.appendChild(bait);
        if (window.getComputedStyle(bait).display === 'none' || bait.offsetHeight === 0) {
          setIsAdBlockerActive(true);
        }
        bait.remove();

        // 2. جلب IP وفحص الحظر اليومي (3 زيارات)
        const ipRes = await fetch('https://api.ipify.org?format=json');
        const { ip } = await ipRes.json();
        const { data: blocked } = await supabase.rpc('check_ip_limit', { visitor_ip: ip });
        if (blocked) setIsBlocked(true);

        // 3. جلب بيانات الرابط من Supabase
        const { data } = await supabase.from('links').select('*').eq('short_code', code).single();
        if (!data) window.location.href = "/";
        else { setLinkData(data); setLoading(false); }
      } catch (e) { setLoading(false); }
    };
    initSecurity();
  }, [code]);

  // محرك العداد (يتوقف عند الخروج)
  useEffect(() => {
    let interval: any;
    if (isMounted && hasStarted && !isPaused && !document.hidden && !isAdBlockerActive && count > 0) {
      interval = setInterval(() => setCount((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isMounted, hasStarted, isPaused, count, isAdBlockerActive]);

  // مستشعر التركيز لاستئناف العداد تلقائياً
  useEffect(() => {
    const handleFocus = () => setIsPaused(false);
    const handleBlur = () => setIsPaused(true);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);
    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  if (!isMounted) return null;

  // واجهة منع الـ AdBlock
  if (isAdBlockerActive) return (
    <div className="min-h-screen bg-red-600 flex flex-col items-center justify-center p-6 text-center text-white">
      <span className="text-8xl mb-6">🛡️</span>
      <h1 className="text-4xl font-black mb-4 uppercase tracking-tighter italic">AdBlock Detected!</h1>
      <p className="max-w-md text-lg mb-8 opacity-90 font-medium">Please disable your AdBlocker to continue. Our service is free because of these advertisements.</p>
      <button onClick={() => window.location.reload()} className="bg-white text-red-600 px-12 py-4 rounded-full font-black text-xl shadow-2xl hover:scale-105 transition-all">I DISABLED IT, RELOAD 🔄</button>
    </div>
  );

  if (loading || !linkData) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-blue-500 p-10">
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="font-black animate-pulse uppercase tracking-[0.3em] text-sm">Initializing Secure Protocol...</p>
    </div>
  );

  if (isBlocked) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-10 text-center text-white">
      <span className="text-7xl mb-6">🛑</span>
      <h1 className="text-3xl font-black text-red-500 uppercase mb-4 tracking-tighter">Daily Limit Reached</h1>
      <p className="text-slate-400 max-w-sm">You have reached the maximum of 3 links per day. Please return after 24 hours.</p>
    </div>
  );

  const handleStart = () => {
    if (!hasStarted) {
      setHasStarted(true);
      window.open(ADS.POPUNDER, '_blank');
    }
    setIsPaused(false);
  };

  // مكون الصندوق الإعلاني (Iframe) لضمان الاستقرار
  const AdSlot = ({ id }: { id: string }) => (
    <div className="my-10 flex flex-col items-center justify-center w-full">
      <p className="text-[7px] text-slate-300 font-black uppercase mb-2 tracking-[0.5em]">Advertisement</p>
      <div className="rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white bg-white min-h-[250px] min-w-[300px]">
        <iframe src="/ad300.html" width="300" height="250" frameBorder="0" scrolling="no" title={id}></iframe>
      </div>
    </div>
  );

  // واجهة الصفحة النهائية (Ready Step)
  if (isFinalPage) {
    return (
      <div onClick={handleStart} className="min-h-screen bg-emerald-50 flex flex-col items-center justify-center p-6 relative cursor-pointer">
        {(!hasStarted || isPaused) && (
          <div className="fixed inset-0 z-[100] bg-slate-900/90 flex items-center justify-center p-6 backdrop-blur-sm">
            <div className="bg-white p-12 rounded-[3.5rem] text-center shadow-2xl border-8 border-emerald-500 animate-pulse text-slate-900">
              <span className="text-7xl mb-6 block">👆</span>
              <h2 className="text-3xl font-black uppercase tracking-tighter">FINAL STEP</h2>
              <p className="font-bold text-slate-500">Click anywhere to generate link</p>
            </div>
          </div>
        )}
        <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl max-w-md w-full text-center border border-emerald-100">
          <h1 className="text-4xl font-black text-emerald-700 mb-6 uppercase italic tracking-tighter">Ready! ✅</h1>
          {count > 0 ? (
            <div className="text-9xl font-black text-emerald-500 tabular-nums tracking-tighter">{count}</div>
          ) : (
            <button 
              onClick={async (e) => {
                e.stopPropagation();
                const ipRes = await fetch('https://api.ipify.org?format=json');
                const { ip } = await ipRes.json();
                await supabase.rpc('record_visit_and_pay', { target_link_id: linkData.id, target_user_id: linkData.user_id, visitor_ip: ip });
                window.open(ADS.FINAL_POP_LINK, '_blank');
                window.location.href = linkData.original_url;
              }}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-8 rounded-[2.5rem] text-3xl shadow-xl transition-all active:scale-95"
            >
              GET LINK 🚀
            </button>
          )}
        </div>
      </div>
    );
  }

  // الواجهة الرئيسية (صفحات الانتظار)
  return (
    <div onClick={handleStart} className="min-h-screen bg-slate-50 flex flex-col items-center font-sans cursor-pointer pb-80 relative overflow-x-hidden">
      
      {/* سكريبتات HilltopAds العائمة */}
      <Script src={ADS.INPAGE_PUSH} strategy="lazyOnload" />
      <Script src={ADS.VIDEO_SLIDER} strategy="lazyOnload" />

      {(!hasStarted || isPaused) && (
        <div className="fixed inset-0 z-[100] bg-slate-900/95 flex items-center justify-center p-6 backdrop-blur-xl">
          <div className="bg-white p-12 rounded-[3.5rem] text-center shadow-2xl border-8 border-blue-600 animate-pulse text-slate-900 max-w-xs w-full">
            <span className="text-7xl mb-6 block">👆</span>
            <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">Verify</h2>
            <p className="font-bold text-sm text-slate-500">Click anywhere to continue</p>
          </div>
        </div>
      )}

      <header className="w-full bg-white p-6 text-center border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <h1 className="text-2xl font-black text-blue-600 italic tracking-tighter uppercase">ExtraLink</h1>
      </header>

      {/* 1. الإعلان الأول (في القمة) */}
      <AdSlot id="ad-top" />

      <div className="bg-white p-10 rounded-[3.5rem] shadow-2xl max-w-md w-full text-center border border-slate-100 z-10 mx-4 mt-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-slate-100">
          <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${(count/15)*100}%` }}></div>
        </div>
        <div className="mb-8">
          <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-5 py-2 rounded-full uppercase tracking-widest border border-blue-100 italic">
            Step {step} of {linkData.page_count}
          </span>
        </div>
        
        <div className="py-10 text-9xl font-black text-slate-800 tabular-nums leading-none tracking-tighter">
          {count}
        </div>
        
        {count === 0 && (
          <div className="py-6 space-y-6">
            <button 
              onClick={(e) => { e.stopPropagation(); setShowRealButton(true); }}
              className="w-full bg-blue-600 text-white font-black py-8 rounded-[2.5rem] text-3xl uppercase shadow-xl transition-all active:scale-95"
            >
              CONTINUE
            </button>
            {showRealButton && (
              <p className="text-red-600 font-black text-xs animate-bounce uppercase tracking-widest">
                👇 Scroll to the bottom to find the button 👇
              </p>
            )}
          </div>
        )}
      </div>

      {/* 2. الإعلان الثاني (تحت العداد) */}
      <AdSlot id="ad-below-card" />

      {/* أقسام المعلومات لتطويل الصفحة */}
      <div className="max-w-md w-full px-8 mt-20 space-y-24 text-center text-slate-400">
        
        <div className="space-y-4">
          <h3 className="font-black text-slate-800 uppercase text-xs tracking-[0.4em]">Cloud Encryption Active</h3>
          <p className="text-[11px] leading-relaxed font-medium italic">"ExtraLink uses advanced AES-256 cloud technology to verify every link and protect our global users."</p>
        </div>

        {/* 3. الإعلان الثالث (وسط الصفحة) */}
        <AdSlot id="ad-middle" />

        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between px-10">
            <div className="text-left">
              <p className="text-slate-400 text-[8px] font-black uppercase tracking-widest mb-1">Server Status</p>
              <p className="text-green-500 font-black text-xl italic uppercase">Verified</p>
            </div>
            <span className="text-3xl text-green-500">✓</span>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between px-10">
            <div className="text-left">
              <p className="text-slate-400 text-[8px] font-black uppercase tracking-widest mb-1">Global Traffic</p>
              <p className="text-blue-500 font-black text-xl italic uppercase">Secure</p>
            </div>
            <span className="text-3xl text-blue-500">🔒</span>
          </div>
        </div>

        {/* 4. الإعلان الرابع (فوق الزر الحقيقي) */}
        <AdSlot id="ad-above-button" />

        {/* الزر الحقيقي */}
        {showRealButton && (
          <div className="pt-10 animate-fadeIn">
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                window.open(ADS.POPUNDER, '_blank');
                setStep(prev => prev + 1); setCount(15); setHasStarted(false); setShowRealButton(false);
                window.scrollTo(0, 0);
              }} 
              className="w-full bg-blue-600 text-white font-black py-9 rounded-[2.5rem] shadow-2xl transition-all active:scale-95 text-3xl uppercase tracking-tighter shadow-blue-200"
            >
              Next Page →
            </button>
          </div>
        )}

        {/* 5. الإعلان الخامس (في القاع) */}
        <AdSlot id="ad-bottom" />
      </div>

      <footer className="mt-40 opacity-20 grayscale font-black text-[8px] tracking-[0.6em] text-center px-10 pb-10 uppercase">
        ExtraLink Secure Protocol v4.2.1-STABLE
      </footer>
    </div>
  );
}