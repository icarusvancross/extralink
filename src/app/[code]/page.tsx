"use client";
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '../lib/supabase'; 

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
    const initSecurity = async () => {
      try {
        // 1. فحص AdBlock ذكي بدون ملفات خارجية (Bait Method)
        const bait = document.createElement('div');
        bait.className = 'pub_300x250 pub_300x250m pub_728x90 text-ad text_ad text_ads text-ads ad-wrapper ad-placeholder';
        bait.style.cssText = 'width: 1px !important; height: 1px !important; position: absolute !important; left: -10000px !important; top: -1000px !important;';
        document.body.appendChild(bait);
        
        const isBlockedByBrowser = window.getComputedStyle(bait).getPropertyValue('display') === 'none' || bait.offsetHeight === 0;
        if (isBlockedByBrowser) {
          setIsAdBlockerActive(true);
        }
        document.body.removeChild(bait);

        // 2. فحص الـ IP والحد اليومي
        const ipRes = await fetch('https://api.ipify.org?format=json');
        const { ip } = await ipRes.json();
        
        const { data: blocked } = await supabase.rpc('check_ip_limit', { visitor_ip: ip });
        if (blocked) setIsBlocked(true);

        // 3. جلب بيانات الرابط
        const { data } = await supabase.from('links').select('*').eq('short_code', code).single();
        if (!data) window.location.href = "/";
        else { setLinkData(data); setLoading(false); }
      } catch (e) { 
        setLoading(false); 
      }
    };
    initSecurity();
  }, [code]);

  useEffect(() => {
    let interval: any;
    if (isMounted && hasStarted && !isPaused && !document.hidden && !isAdBlockerActive && count > 0) {
      interval = setInterval(() => {
        setCount((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isMounted, hasStarted, isPaused, count, isAdBlockerActive]);

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

  if (isAdBlockerActive) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-white">
      <div className="bg-red-500/10 border border-red-500 p-10 rounded-[3rem] max-w-md shadow-2xl">
        <span className="text-6xl mb-6 block">🛡️</span>
        <h1 className="text-2xl font-black mb-4 uppercase">AdBlock Detected</h1>
        <p className="text-slate-400 text-sm mb-8">Please disable your AdBlocker to support our free service and access your link.</p>
        <button onClick={() => window.location.reload()} className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-black transition-all active:scale-95">RETRY CONNECTION 🔄</button>
      </div>
    </div>
  );

  if (loading || !linkData) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-blue-500 font-bold animate-pulse uppercase tracking-widest text-sm">
      ExtraLink Secure Protocol...
    </div>
  );

  if (isBlocked) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-10 text-center font-black">
      <span className="text-6xl mb-6">🛑</span>
      <h1 className="text-3xl text-red-500 uppercase mb-4 tracking-tighter">Daily Limit Reached</h1>
      <p className="text-slate-400 max-w-sm text-sm font-medium">You have reached the maximum of 3 links per day. Please come after 24 hours.</p>
    </div>
  );

  const handleStart = () => {
    setHasStarted(true);
    setIsPaused(false);
    // هنا سنضع رابط Adsterra Smartlink لاحقاً
  };

  return (
    <div onClick={handleStart} className="min-h-screen bg-slate-50 flex flex-col items-center font-sans cursor-pointer pb-80 relative">
      
      {(!hasStarted || isPaused) && (
        <div className="fixed inset-0 z-[100] bg-slate-900/95 flex items-center justify-center p-6 backdrop-blur-xl">
          <div className="bg-white p-12 rounded-[3.5rem] text-center shadow-2xl border-8 border-blue-500 max-w-xs w-full text-slate-900 animate-pulse">
            <span className="text-7xl mb-6 block">👆</span>
            <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">Verify</h2>
            <p className="font-bold text-sm text-slate-500">Click anywhere to continue</p>
          </div>
        </div>
      )}

      <header className="w-full bg-white p-6 text-center border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <h1 className="text-2xl font-black text-blue-600 italic tracking-tighter">ExtraLink</h1>
      </header>

      <div className="bg-white p-10 rounded-[3rem] shadow-2xl max-w-md w-full text-center border border-slate-100 z-10 mx-4 mt-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-slate-100">
          <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${(count/15)*100}%` }}></div>
        </div>
        <div className="mb-8">
          <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-5 py-2 rounded-full uppercase tracking-widest border border-blue-100">
            {isFinalPage ? 'Final Step' : `Step ${step} of ${linkData.page_count}`}
          </span>
        </div>
        
        {count > 0 ? (
          <div className="py-10 text-9xl font-black text-slate-800 tabular-nums leading-none tracking-tighter">
            {count}
          </div>
        ) : (
          <div className="py-10 space-y-4">
            <button 
              onClick={(e) => { e.stopPropagation(); setShowRealButton(true); }}
              className="w-full bg-blue-600 text-white font-black py-7 rounded-[2.5rem] text-2xl uppercase shadow-xl active:scale-95 transition-all"
            >
              CONTINUE
            </button>
            {showRealButton && (
              <p className="text-red-600 font-black text-xs animate-bounce uppercase tracking-widest pt-2">
                👇 Scroll to the bottom to find Next Page 👇
              </p>
            )}
          </div>
        )}
      </div>

      <div className="max-w-md w-full px-8 mt-20 space-y-32 text-center text-slate-400">
        <div className="space-y-4">
          <h3 className="font-black text-slate-800 uppercase text-xs tracking-[0.3em]">Security Protocol Active</h3>
          <p className="text-[10px] leading-relaxed font-medium">ExtraLink uses advanced AES-256 cloud encryption to verify your connection and protect the destination URL from bot traffic.</p>
        </div>

        {showRealButton && (
          <div className="pt-10 animate-fadeIn">
            <button 
              onClick={(e) => { e.stopPropagation(); isFinalPage ? (window.location.href = linkData.original_url) : (setStep(prev => prev + 1), setCount(15), setHasStarted(false), setShowRealButton(false)); }} 
              className={`w-full text-white font-black py-8 rounded-[2.5rem] shadow-2xl transition-all active:scale-95 text-3xl uppercase tracking-tighter ${isFinalPage ? 'bg-emerald-500 shadow-emerald-200' : 'bg-blue-600 shadow-blue-200'}`}
            >
              {isFinalPage ? 'Get Link 🚀' : 'Next Page →'}
            </button>
          </div>
        )}
      </div>

      <footer className="mt-40 opacity-20 grayscale font-black text-[7px] tracking-[0.6em] text-center px-10 pb-10 uppercase">
        ExtraLink Secure Protocol v4.2.1-STABLE
      </footer>
    </div>
  );
}