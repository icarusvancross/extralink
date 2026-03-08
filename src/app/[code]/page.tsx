"use client";
import { useState, useEffect, useRef, memo } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '../lib/supabase'; 

// --- مكونات الإعلانات المعزولة والمحسنة (أحجام ضخمة) ---

const AdBanner300 = memo(({ id }: { id: string }) => (
  <div className="my-12 flex flex-col items-center justify-center w-full">
    <p className="text-[8px] text-slate-300 font-black uppercase mb-3 tracking-[0.5em]">Sponsored Advertisement</p>
    <div className="rounded-[3rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-[10px] border-white bg-white min-h-[270px] min-w-[320px] flex items-center justify-center transition-transform hover:scale-[1.02]">
      <iframe src="/ad300.html" width="300" height="250" frameBorder="0" scrolling="no" title={`banner-${id}`}></iframe>
    </div>
  </div>
));
AdBanner300.displayName = "AdBanner300";

const AdNative = memo(({ id }: { id: string }) => (
  <div className="my-12 w-full max-w-md px-4">
    <p className="text-[8px] text-slate-300 font-black uppercase mb-3 text-center tracking-[0.5em]">Recommended Content</p>
    <div className="rounded-[3rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.05)] border-4 border-slate-100 bg-white min-h-[260px] flex items-center justify-center">
      <iframe src={`/ad-native.html?v=${id}`} className="w-full h-[250px]" frameBorder="0" scrolling="no" title={`native-${id}`}></iframe>
    </div>
  </div>
));
AdNative.displayName = "AdNative";

// --- المكون الرئيسي للموقع ---

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

  useEffect(() => {
    setIsMounted(true);
    const initPage = async () => {
      try {
        const bait = document.createElement('div');
        bait.className = 'pub_300x250 text-ads ad-placeholder';
        bait.style.cssText = 'width:1px;height:1px;position:absolute;left:-1000px;';
        document.body.appendChild(bait);
        if (window.getComputedStyle(bait).display === 'none' || bait.offsetHeight === 0) {
          setIsAdBlockerActive(true);
        }
        bait.remove();

        const ipRes = await fetch('https://api.ipify.org?format=json');
        const { ip } = await ipRes.json();
        const { data: blocked } = await supabase.rpc('check_ip_limit', { visitor_ip: ip });
        if (blocked) setIsBlocked(true);

        const { data } = await supabase.from('links').select('*').eq('short_code', code).single();
        if (!data) window.location.href = "/";
        else { setLinkData(data); setLoading(false); }
      } catch (e) { setLoading(false); }
    };
    initPage();
  }, [code]);

  useEffect(() => {
    let interval: any;
    if (isMounted && hasStarted && !isPaused && !document.hidden && !isAdBlockerActive && count > 0) {
      interval = setInterval(() => setCount(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isMounted, hasStarted, isPaused, count, isAdBlockerActive]);

  useEffect(() => {
    const handleFocus = () => setIsPaused(false);
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  if (!isMounted) return null;

  if (isAdBlockerActive) return (
    <div className="min-h-screen bg-red-600 flex flex-col items-center justify-center p-6 text-center text-white">
      <h1 className="text-4xl font-black mb-8 uppercase tracking-tighter italic underline decoration-white decoration-4 underline-offset-8">AdBlock Detected! 🛡️</h1>
      <p className="max-w-md text-xl mb-10 font-bold leading-relaxed">Wait! We detected a script blocker. To access your secure link, please disable AdBlock and reload the page.</p>
      <button onClick={() => window.location.reload()} className="bg-white text-red-600 px-16 py-6 rounded-full font-black text-2xl shadow-[0_20px_50px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95 transition-all uppercase">I Disabled it, REFRESH 🔄</button>
    </div>
  );

  if (loading || !linkData) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-blue-500 p-10">
      <div className="w-20 h-20 border-[6px] border-blue-500 border-t-transparent rounded-full animate-spin mb-6"></div>
      <p className="font-black animate-pulse uppercase tracking-[0.4em] text-sm italic">ExtraLink Secure Protocol v4.2</p>
    </div>
  );

  if (isBlocked) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-10 text-center text-white">
      <span className="text-8xl mb-8">🛑</span>
      <h1 className="text-4xl font-black text-red-500 uppercase mb-4 tracking-tighter">Limit Reached</h1>
      <p className="text-slate-400 max-w-sm text-lg font-medium leading-relaxed">Our protocol limits access to 3 links per 24 hours to ensure fair server usage for everyone.</p>
    </div>
  );

  const handleStart = () => {
    setHasStarted(true);
    setIsPaused(false);
  };

  const handleNextStep = async () => {
    if (isFinalPage) {
      const ipRes = await fetch('https://api.ipify.org?format=json');
      const { ip } = await ipRes.json();
      await supabase.rpc('record_visit_and_pay', { target_link_id: linkData.id, target_user_id: linkData.user_id, visitor_ip: ip });
      window.location.href = linkData.original_url;
    } else {
      if (step < linkData.page_count) {
        setStep(prev => prev + 1); setCount(15); setHasStarted(false); setShowRealButton(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setIsFinalPage(true); setCount(5); setHasStarted(false); setShowRealButton(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  return (
    <div onClick={handleStart} className="min-h-screen bg-slate-50 flex flex-col items-center font-sans cursor-pointer pb-96 relative overflow-x-hidden">
      
      {(!hasStarted || isPaused) && (
        <div className="fixed inset-0 z-[100] bg-slate-900/95 flex items-center justify-center p-6 backdrop-blur-2xl">
          <div className="bg-white p-12 rounded-[4rem] text-center shadow-[0_30px_100px_rgba(0,0,0,0.3)] border-[12px] border-blue-600 animate-pulse max-w-xs w-full text-slate-900">
            <span className="text-8xl mb-6 block drop-shadow-xl">👆</span>
            <h2 className="text-4xl font-black uppercase tracking-tighter mb-2">VERIFY</h2>
            <p className="font-bold text-slate-500 text-lg">Click to unlock link</p>
          </div>
        </div>
      )}

      <header className="w-full bg-white p-8 text-center border-b border-slate-200 sticky top-0 z-40 shadow-md">
        <h1 className="text-3xl font-black text-blue-600 italic tracking-tighter uppercase">ExtraLink</h1>
      </header>

      {/* 1. الإعلان الأول: Native العلوي (كبير) */}
      <AdNative id="top-native" />

      {/* كارت العداد */}
      <div className="bg-white p-12 rounded-[4rem] shadow-[0_40px_80px_rgba(8,112,184,0.15)] max-w-md w-full text-center border border-slate-100 z-10 mx-4 mt-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-3 bg-slate-50">
          <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${(count/15)*100}%` }}></div>
        </div>
        <div className="mb-10 pt-4">
          <span className="bg-blue-600 text-white text-xs font-black px-6 py-2 rounded-full uppercase tracking-widest shadow-lg shadow-blue-200">
            {isFinalPage ? 'Final Step' : `Step ${step} of ${linkData.page_count}`}
          </span>
        </div>
        <div className="py-12 text-[10rem] font-black text-slate-800 tabular-nums leading-none tracking-tighter drop-shadow-sm">{count}</div>
        
        {count === 0 && (
          <div className="py-8 space-y-8">
            <button onClick={(e) => { e.stopPropagation(); setShowRealButton(true); }} className="w-full bg-blue-600 text-white font-black py-8 rounded-[2.5rem] text-3xl uppercase shadow-[0_20px_40px_rgba(37,99,235,0.3)] active:scale-95 transition-all">CONTINUE</button>
            {showRealButton && <p className="text-red-600 font-black text-sm animate-bounce uppercase tracking-widest pt-2">👇 Scroll down to the bottom 👇</p>}
          </div>
        )}
      </div>

      {/* 2. الإعلان الثاني: Banner تحت العداد */}
      <AdBanner300 id="below-timer" />

      {/* محتوى الصفحة الطويل */}
      <div className="max-w-md w-full px-8 mt-24 space-y-32 text-center text-slate-400">
        
        <div className="space-y-6">
          <h3 className="font-black text-slate-900 uppercase text-sm tracking-[0.4em]">Cloud Security Check</h3>
          <p className="text-xs leading-relaxed font-bold italic opacity-70">"ExtraLink AES-256 cloud encryption is currently scanning your connection to ensure the destination URL is protected from malicious bot traffic and automated scrapers."</p>
        </div>

        {/* 3. الإعلان الثالث: Native وسط الصفحة */}
        <AdNative id="middle-native" />

        <div className="grid grid-cols-1 gap-8">
          <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl flex items-center justify-between px-12 text-slate-900">
            <div className="text-left"><p className="text-slate-400 text-[9px] font-black uppercase mb-1 tracking-widest">Protocol Status</p><p className="text-green-500 font-black text-2xl italic uppercase tracking-tighter leading-none">Verified ✓</p></div>
            <span className="text-5xl">🛡️</span>
          </div>
          <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl flex items-center justify-between px-12 text-slate-900">
            <div className="text-left"><p className="text-slate-400 text-[9px] font-black uppercase mb-1 tracking-widest">Network Load</p><p className="text-blue-500 font-black text-2xl italic uppercase tracking-tighter leading-none">Encrypted</p></div>
            <span className="text-5xl">🔒</span>
          </div>
        </div>

        {/* 4. الإعلان الرابع: Banner قبل الزر */}
        <AdBanner300 id="above-button" />

        {showRealButton && (
          <div className="pt-10 animate-fadeIn">
            <button onClick={(e) => { e.stopPropagation(); handleNextStep(); }} className={`w-full text-white font-black py-10 rounded-[3rem] shadow-[0_25px_60px_rgba(0,0,0,0.15)] transition-all active:scale-95 text-4xl uppercase tracking-tighter ${isFinalPage ? 'bg-emerald-500 shadow-emerald-200' : 'bg-blue-600 shadow-blue-200'}`}>
              {isFinalPage ? 'Get Link 🚀' : 'Next Page →'}
            </button>
          </div>
        )}

        {/* 5. الإعلان الخامس: Native في القاع */}
        <AdNative id="bottom-native" />
      </div>

      <footer className="mt-60 opacity-20 grayscale font-black text-[9px] tracking-[0.8em] text-center px-10 pb-20 uppercase">
        ExtraLink Protocol v4.2.0-STABLE-SECURE
      </footer>
    </div>
  );
}