"use client";
import { useState, useEffect } from 'react';
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
  
  // حالات الدروع الواقية
  const [isAdBlockerActive, setIsAdBlockerActive] = useState(false);
  const [isVPNActive, setIsVPNActive] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const initSecurity = async () => {
      try {
        // 1. فحص AdBlock عبر "الطُعم"
        if (!(window as any).isAdsEnabled) {
          setIsAdBlockerActive(true);
        }

        // 2. فحص الـ VPN (عبر المنطقة الزمنية والـ IP)
        const ipRes = await fetch('https://api.ipify.org?format=json');
        const { ip } = await ipRes.json();
        
        // فحص تقاطعي: إذا كان التوقيت لا يطابق الدولة (بسيط لكن فعال)
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        // إذا كان الزائر بـ IP أمريكي لكن توقيته "Asia/Baghdad" مثلاً، فهو VPN
        // حالياً سنكتفي بفحص الـ IP Limit من Supabase لحماية حسابك
        const { data: blocked } = await supabase.rpc('check_ip_limit', { visitor_ip: ip });
        if (blocked) setIsBlocked(true);

        const { data } = await supabase.from('links').select('*').eq('short_code', code).single();
        if (!data) window.location.href = "/";
        else { setLinkData(data); setLoading(false); }
      } catch (e) { setLoading(false); }
    };
    initSecurity();
  }, [code]);

  useEffect(() => {
    let interval: any;
    if (isMounted && hasStarted && !isPaused && !document.hidden && !isAdBlockerActive && !isVPNActive && count > 0) {
      interval = setInterval(() => setCount(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isMounted, hasStarted, isPaused, count, isAdBlockerActive, isVPNActive]);

  if (!isMounted) return null;

  // --- واجهة منع الـ AdBlock ---
  if (isAdBlockerActive) return (
    <div className="min-h-screen bg-red-600 flex flex-col items-center justify-center p-6 text-center text-white font-sans">
      <span className="text-8xl mb-6">🛡️</span>
      <h1 className="text-4xl font-black mb-4 uppercase tracking-tighter">AdBlock Detected!</h1>
      <p className="max-w-md text-lg mb-8 opacity-90 font-medium">To access this link, you must disable your AdBlocker. We keep our servers free by showing a few ads.</p>
      <button onClick={() => window.location.reload()} className="bg-white text-red-600 px-12 py-4 rounded-full font-black text-xl shadow-2xl hover:scale-105 transition-all">I DISABLED IT, RELOAD 🔄</button>
      <p className="mt-10 text-[10px] font-bold opacity-50 uppercase tracking-[0.5em]">ExtraLink Security Shield</p>
    </div>
  );

  if (loading || !linkData) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-blue-500 font-bold animate-pulse uppercase tracking-widest text-sm">Initializing Secure Protocol...</div>;
  if (isBlocked) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-red-500 p-10 text-center font-black text-2xl uppercase">Daily Limit Reached! 🛑</div>;

  return (
    <div onClick={() => { if(!hasStarted) setHasStarted(true); setIsPaused(false); }} className="min-h-screen bg-slate-50 flex flex-col items-center font-sans cursor-pointer pb-60 relative">
      
      {/* استدعاء ملف الطُعم */}
      <Script src="/ads.js" strategy="beforeInteractive" />

      {(!hasStarted || isPaused) && (
        <div className="fixed inset-0 z-[100] bg-slate-900/95 flex items-center justify-center p-6 backdrop-blur-sm">
          <div className="bg-white p-12 rounded-[3.5rem] text-center shadow-2xl border-8 border-blue-500 animate-pulse max-w-xs w-full">
            <span className="text-7xl mb-6 block">👆</span>
            <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">Verify</h2>
            <p className="text-slate-500 font-bold">Click anywhere to continue</p>
          </div>
        </div>
      )}

      <header className="w-full bg-white p-6 text-center border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <h1 className="text-2xl font-black text-blue-600 italic">ExtraLink</h1>
      </header>

      {/* العداد والتصميم المستقر */}
      <div className="bg-white p-10 rounded-[3rem] shadow-2xl max-w-md w-full text-center border border-slate-100 z-10 mx-4 mt-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-slate-100">
          <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${(count/15)*100}%` }}></div>
        </div>
        <div className="mb-8">
          <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-5 py-2 rounded-full uppercase border border-blue-100">
            {isFinalPage ? 'Final Step' : `Step ${step} of ${linkData.page_count}`}
          </span>
        </div>
        <div className="py-10 text-9xl font-black text-slate-800 tabular-nums leading-none tracking-tighter">{count}</div>
        
        {count === 0 && (
          <div className="py-6">
            <button onClick={(e) => { e.stopPropagation(); setShowRealButton(true); }} className="w-full bg-blue-600 text-white font-black py-7 rounded-[2rem] text-2xl uppercase shadow-xl transition-all">CONTINUE</button>
            {showRealButton && <p className="text-red-600 font-black text-xs animate-bounce mt-4 uppercase">👇 Scroll down for button 👇</p>}
          </div>
        )}
      </div>

      <div className="max-w-md w-full px-8 mt-20 space-y-10 text-center text-slate-400">
        <h3 className="font-black text-slate-800 uppercase text-sm tracking-widest">Protected Session</h3>
        <p className="text-xs leading-relaxed font-medium">No VPN or AdBlock allowed. Your IP is being monitored for fair usage.</p>
        
        {showRealButton && (
          <div className="pt-10 pb-20">
            <button onClick={(e) => { e.stopPropagation(); isFinalPage ? window.location.href = linkData.original_url : (setStep(prev => prev + 1), setCount(15), setHasStarted(false), setShowRealButton(false)); }} className="w-full bg-blue-600 text-white font-black py-8 rounded-[2.5rem] shadow-2xl transition-all text-3xl uppercase">
              {isFinalPage ? 'Get Link 🚀' : 'Next Page →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}