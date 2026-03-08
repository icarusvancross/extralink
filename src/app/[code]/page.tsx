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

  // 1. نظام الحماية والتحقق الأولي
  useEffect(() => {
    setIsMounted(true);
    const initSecurity = async () => {
      try {
        // فحص AdBlock (Bait Method)
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
    initSecurity();
  }, [code]);

  // 2. محرك العداد الصارم
  useEffect(() => {
    let interval: any;
    if (isMounted && hasStarted && !isPaused && !document.hidden && !isAdBlockerActive && count > 0) {
      interval = setInterval(() => {
        setCount((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isMounted, hasStarted, isPaused, count, isAdBlockerActive]);

  // 3. مستشعر التركيز (استئناف تلقائي)
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

  // واجهة منع AdBlock
  if (isAdBlockerActive) return (
    <div className="min-h-screen bg-red-600 flex flex-col items-center justify-center p-6 text-center text-white">
      <span className="text-8xl mb-6 animate-pulse">🛡️</span>
      <h1 className="text-4xl font-black mb-4 uppercase tracking-tighter">AdBlock Detected!</h1>
      <p className="max-w-md text-lg mb-8 font-medium">Please disable your AdBlocker to continue. Our service remains free thanks to advertisements.</p>
      <button onClick={() => window.location.reload()} className="bg-white text-red-600 px-12 py-4 rounded-full font-black text-xl shadow-2xl hover:scale-105 transition-all">RELOAD PAGE 🔄</button>
    </div>
  );

  if (loading || !linkData) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-blue-500 font-bold animate-pulse uppercase tracking-widest text-sm">
      ExtraLink | Secure Protocol Connecting...
    </div>
  );

  if (isBlocked) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-10 text-center font-black">
      <span className="text-6xl mb-6">🛑</span>
      <h1 className="text-3xl text-red-500 uppercase mb-4 tracking-tighter">Daily Limit Reached</h1>
      <p className="text-slate-400 max-w-sm">Maximum 3 links per day. Please return in 24 hours.</p>
    </div>
  );

  const handleStart = () => {
    setHasStarted(true);
    setIsPaused(false);
  };

  // مكون الإعلان الموحد (Iframe)
  const AdSlot = ({ id }: { id: string }) => (
    <div className="my-10 flex flex-col items-center justify-center w-full">
      <p className="text-[7px] text-slate-300 font-black uppercase mb-2 tracking-[0.4em]">Sponsored Content</p>
      <div className="rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white bg-white min-h-[250px] min-w-[300px] flex items-center justify-center">
        <iframe src="/ad300.html" width="300" height="250" frameBorder="0" scrolling="no" title={id}></iframe>
      </div>
    </div>
  );

  return (
    <div onClick={handleStart} className="min-h-screen bg-slate-50 flex flex-col items-center font-sans cursor-pointer pb-80 relative overflow-x-hidden">
      
      <Script src="/ads-check.js" strategy="beforeInteractive" />

      {(!hasStarted || isPaused) && (
        <div className="fixed inset-0 z-[100] bg-slate-900/95 flex items-center justify-center p-6 backdrop-blur-xl">
          <div className="bg-white p-12 rounded-[3.5rem] text-center shadow-2xl border-8 border-blue-500 max-w-xs w-full text-slate-900 animate-pulse">
            <span className="text-7xl mb-6 block">👆</span>
            <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">Verify</h2>
            <p className="font-bold text-sm text-slate-500">Click anywhere to continue</p>
          </div>
        </div>
      )}

      <header className="w-full bg-white p-6 text-center border-b border-slate-200 sticky top-0 z-40 shadow-sm font-black text-blue-600 italic text-2xl tracking-tighter">
        ExtraLink
      </header>

      {/* 1. إعلان علوي */}
      <AdSlot id="top" />

      {/* الكارت الرئيسي للعداد */}
      <div className="bg-white p-10 rounded-[3rem] shadow-2xl max-w-md w-full text-center border border-slate-100 z-10 mx-4 mt-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-slate-100">
          <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${(count/15)*100}%` }}></div>
        </div>
        <div className="mb-8">
          <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-5 py-2 rounded-full uppercase border border-blue-100">
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

      {/* 2. إعلان تحت العداد */}
      <AdSlot id="below-timer" />

      {/* محتوى طويل لإجبار السكرول */}
      <div className="max-w-md w-full px-8 mt-20 space-y-24 text-center text-slate-400">
        
        <div className="space-y-6">
          <h3 className="font-black text-slate-800 uppercase text-xs tracking-[0.3em]">Cloud Security Check</h3>
          <p className="text-[11px] leading-relaxed font-medium italic">"ExtraLink uses military-grade AES-256 encryption to verify and protect every link generated on our platform."</p>
        </div>

        {/* 3. إعلان وسط الصفحة */}
        <AdSlot id="middle" />

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-green-500 font-black text-2xl italic">99.9%</p>
            <p className="text-[8px] font-bold uppercase text-slate-400">Uptime</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-blue-500 font-black text-2xl italic">Secure</p>
            <p className="text-[8px] font-bold uppercase text-slate-400">Protocol</p>
          </div>
        </div>

        <div className="bg-blue-600 p-10 rounded-[3rem] text-white text-left shadow-2xl relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <h4 className="font-black uppercase text-sm mb-4 tracking-tighter underline decoration-2">Why ExtraLink?</h4>
          <p className="text-xs leading-relaxed opacity-90 font-medium">We provide the fastest responses for users globally. Our servers ensure your data is safe and your redirects are instant.</p>
        </div>

        {/* 4. إعلان قبل الزر */}
        <AdSlot id="above-button" />

        {/* الزر الحقيقي */}
        {showRealButton && (
          <div className="pt-10 animate-fadeIn">
            <button 
              onClick={async (e) => { 
                e.stopPropagation(); 
                if (isFinalPage) {
                  const ipRes = await fetch('https://api.ipify.org?format=json');
                  const { ip } = await ipRes.json();
                  await supabase.rpc('record_visit_and_pay', { target_link_id: linkData.id, target_user_id: linkData.user_id, visitor_ip: ip });
                  window.location.href = linkData.original_url;
                } else {
                  setStep(prev => prev + 1); setCount(15); setHasStarted(false); setShowRealButton(false);
                  window.scrollTo(0, 0);
                }
              }} 
              className={`w-full text-white font-black py-8 rounded-[2.5rem] shadow-2xl transition-all active:scale-95 text-3xl uppercase tracking-tighter ${isFinalPage ? 'bg-emerald-500 shadow-emerald-200' : 'bg-blue-600 shadow-blue-200'}`}
            >
              {isFinalPage ? 'Get Link 🚀' : 'Next Page →'}
            </button>
          </div>
        )}

        {/* 5. إعلان في القاع */}
        <AdSlot id="bottom" />
      </div>

      <footer className="mt-40 opacity-20 grayscale font-black text-[8px] tracking-[0.5em] text-center px-10 pb-10 uppercase">
        ExtraLink Secure Protocol v4.2.1-STABLE
      </footer>
    </div>
  );
}