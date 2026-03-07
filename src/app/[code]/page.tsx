"use client";
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '../lib/supabase'; 
import Script from 'next/script';

export default function WaitingPage() {
  const { code } = useParams();
  const [linkData, setLinkData] = useState<any>(null);
  const [step, setStep] = useState(1);
  const [isFinalPage, setIsFinalPage] = useState(false);
  const [count, setCount] = useState(15);
  const [isPaused, setIsPaused] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [showRealButton, setShowRealButton] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  const adTopRef = useRef<HTMLDivElement>(null);
  const adMiddleRef = useRef<HTMLDivElement>(null);
  const adBottomRef = useRef<HTMLDivElement>(null);

  // 🛑 إعدادات HilltopAds و PopAds فقط
  const ADS = {
    POPUNDER: "https://plasticdamage.com/cmDY9.6qbJ2K5hlCS/WNQr9gNUjGgz0nOTDdYXwxNRSW0-2FOKDhQP4SNljVA/5U",
    BANNER_300: "https://conventionalresponse.com/bnX.VgsVdLG_l/0bYUWtcO/seVm/9UuxZrU/lCknPhTRY/4LNpDcgv2CMrT/M/tzNSjmgD0CO/DQYixbN/wy",
    INPAGE_PUSH: "https://conventionalresponse.com/beX.VJsdd/GUlr0/YdWBcV/teJmT9/uoZbUBlLkqP/ThYG4yNCD/g_2wMrjhkotyNnjRg/0LOfDWY/z/MgwV",
    VIDEO_SLIDER: "https://conventionalresponse.com/b.XiVysXdIGClx0lYuW_cE/-eJm/9Eu/ZfU_lHk/PzToY/4ENjDugV2/NTDmUPtPNljrgg0AOoDqYJ0yOKQN",
    POPADS_FINAL: "https://www.effectivegatecpm.com/rcbjyg6w?key=4b7c5edb9470ea073ea974701e4201aa" // سمارت لينك للنهاية
  };

  // حقن البانرات في الـ 3 أماكن
  const injectBanners = () => {
    [adTopRef, adMiddleRef, adBottomRef].forEach((ref) => {
      if (ref.current && ref.current.innerHTML === "") {
        const s = document.createElement('script');
        s.src = ADS.BANNER_300; s.async = true;
        ref.current.appendChild(s);
      }
    });
  };

  useEffect(() => {
    setIsMounted(true);
    const init = async () => {
      try {
        const { data } = await supabase.from('links').select('*').eq('short_code', code).single();
        if (!data) window.location.href = "/";
        else { setLinkData(data); setLoading(false); }
      } catch (e) { setLoading(false); }
    };
    init();
  }, [code]);

  useEffect(() => {
    let interval: any;
    if (isMounted && hasStarted && !isPaused && !document.hidden && count > 0) {
      interval = setInterval(() => setCount(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isMounted, hasStarted, isPaused, count]);

  // استئناف تلقائي عند العودة للصفحة
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

  const handleStart = () => {
    if (!hasStarted) {
      setHasStarted(true);
      injectBanners(); // إظهار البانرات الـ 3 فوراً
      window.open(ADS.POPUNDER, '_blank');
    }
    setIsPaused(false);
  };

  const handleNext = () => {
    window.open(ADS.POPUNDER, '_blank');
    if (step < linkData.page_count) {
      setStep(prev => prev + 1); setCount(15);
      setHasStarted(false); setShowRealButton(false);
      window.scrollTo(0,0);
    } else {
      setIsFinalPage(true); setCount(5);
      setHasStarted(false); setShowRealButton(false);
      window.scrollTo(0,0);
    }
  };

  const handleGetLink = async () => {
    const ipRes = await fetch('https://api.ipify.org?format=json');
    const { ip } = await ipRes.json();
    await supabase.rpc('record_visit_and_pay', { target_link_id: linkData.id, target_user_id: linkData.user_id, visitor_ip: ip });
    window.open(ADS.POPADS_FINAL, '_blank');
    window.location.href = linkData.original_url;
  };

  if (!isMounted || loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white font-bold animate-pulse">ExtraLink Loading...</div>;

  return (
    <div onClick={handleStart} className="min-h-screen bg-slate-50 flex flex-col items-center font-sans cursor-pointer pb-40 relative overflow-x-hidden">
      
      {/* سكريبتات HilltopAds العائمة (Push & Video) */}
      <Script src={ADS.INPAGE_PUSH} strategy="lazyOnload" />
      <Script src={ADS.VIDEO_SLIDER} strategy="lazyOnload" />
      <Script src={ADS.POPUNDER} strategy="lazyOnload" />

      {(!hasStarted || isPaused) && (
        <div className="fixed inset-0 z-[100] bg-slate-900/90 flex items-center justify-center p-6 backdrop-blur-sm">
          <div className="bg-white p-10 rounded-[3rem] text-center shadow-2xl border-8 border-blue-500 animate-pulse max-w-xs w-full">
            <span className="text-7xl mb-6 block">👆</span>
            <h2 className="text-3xl font-black text-slate-800 uppercase">Verify</h2>
            <p className="text-slate-500 font-bold">Click to continue</p>
          </div>
        </div>
      )}

      <header className="w-full bg-white p-6 text-center border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <h1 className="text-2xl font-black text-blue-600 italic">ExtraLink</h1>
      </header>

      {/* 1. بانر علوي */}
      <div className="w-full max-w-md mt-6 px-4 flex flex-col items-center">
        <p className="text-[7px] text-slate-400 font-black uppercase mb-2 tracking-widest text-center">Sponsored Content</p>
        <div ref={adTopRef} className="rounded-3xl overflow-hidden shadow-sm border border-slate-100 bg-white min-h-[160px] w-full flex justify-center"></div>
      </div>

      <div className="bg-white p-10 rounded-[3rem] shadow-2xl max-w-md w-full text-center border border-slate-100 z-10 mx-4 mt-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-slate-100">
          <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${(count/15)*100}%` }}></div>
        </div>
        <div className="mb-8">
          <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-5 py-2 rounded-full uppercase tracking-widest border border-blue-100">
            {isFinalPage ? 'Final Step' : `Step ${step} of ${linkData.page_count}`}
          </span>
        </div>
        <div className="py-10 text-9xl font-black text-slate-800 tabular-nums leading-none tracking-tighter">{count}</div>
        {count === 0 && (
          <div className="py-6">
            <button onClick={(e) => { e.stopPropagation(); setShowRealButton(true); }} className="w-full bg-blue-600 text-white font-black py-7 rounded-[2rem] text-2xl uppercase shadow-xl transition-all active:scale-95">CONTINUE</button>
            {showRealButton && <p className="text-red-600 font-black text-xs animate-bounce mt-4 uppercase tracking-tighter italic">👇 Scroll down for Next Page 👇</p>}
          </div>
        )}
      </div>

      <div className="max-w-md w-full px-8 mt-20 space-y-20 text-center">
        {/* 2. بانر منتصف */}
        <div className="flex flex-col items-center">
          <p className="text-slate-300 text-[7px] font-black uppercase mb-4 tracking-[0.5em]">Advertisement</p>
          <div ref={adMiddleRef} className="rounded-[3rem] overflow-hidden shadow-2xl border-[12px] border-white bg-white min-h-[250px] min-w-[300px]"></div>
        </div>

        <div className="space-y-6">
          <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Security Log Scan</h4>
          <div className="bg-slate-900 p-8 rounded-[2.5rem] font-mono text-[10px] text-green-500 text-left space-y-3 shadow-2xl">
            <p>{`> IP Checked: OK`}</p>
            <p>{`> SSL Handshake: VERIFIED`}</p>
            <p>{`> Status: SECURE`}</p>
          </div>
        </div>

        {/* 3. بانر سفلي */}
        <div className="flex flex-col items-center">
          <p className="text-[7px] text-slate-400 font-black uppercase mb-4 text-center tracking-[0.3em]">Recommended for you</p>
          <div ref={adBottomRef} className="rounded-3xl overflow-hidden shadow-lg border border-slate-100 bg-white min-h-[160px] w-full flex justify-center"></div>
        </div>

        {showRealButton && (
          <div className="pt-20 pb-40">
            <button onClick={(e) => { e.stopPropagation(); isFinalPage ? handleGetLink() : handleNext(); }} className={`w-full text-white font-black py-8 rounded-[2.5rem] shadow-2xl transition-all active:scale-95 text-3xl uppercase ${isFinalPage ? 'bg-green-500' : 'bg-blue-600'}`}>
              {isFinalPage ? 'Get Link Now 🚀' : 'Next Page →'}
            </button>
          </div>
        )}
      </div>

      <footer className="mt-20 opacity-20 grayscale font-black text-[8px] tracking-[0.5em] text-center px-10 pb-10">
        EXTRALINK SECURE PROTOCOL v4.2.0-STABLE
      </footer>
    </div>
  );
}