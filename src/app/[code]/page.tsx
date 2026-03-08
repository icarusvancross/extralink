"use client";
import { useState, useEffect, memo } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '../lib/supabase'; 
import Script from 'next/script';

// --- مكونات الإعلانات المعزولة (الأحجام القديمة المستقرة) ---

const AdBanner300 = memo(({ id }: { id: string }) => (
  <div className="my-6 flex flex-col items-center justify-center w-full">
    <p className="text-[7px] text-slate-300 font-black uppercase mb-2 tracking-[0.4em]">Advertisement</p>
    <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-100 bg-white min-h-[250px] min-w-[300px] flex items-center justify-center">
      <iframe src="/ad300.html" width="300" height="250" frameBorder="0" scrolling="no" title={id}></iframe>
    </div>
  </div>
));

const AdNative = memo(({ id }: { id: string }) => (
  <div className="my-6 w-full max-w-md px-4">
    <p className="text-[7px] text-slate-300 font-black uppercase mb-2 text-center tracking-[0.4em]">Recommended</p>
    <div className="rounded-2xl overflow-hidden shadow-sm border border-slate-50 bg-white min-h-[160px] flex items-center justify-center">
      <iframe src={`/ad-native.html?v=${id}`} className="w-full h-[180px]" frameBorder="0" scrolling="no"></iframe>
    </div>
  </div>
));

// --- المكون الرئيسي ---

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

  const SMARTLINK = "https://www.effectivegatecpm.com/rcbjyg6w?key=4b7c5edb9470ea073ea974701e4201aa";

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
      <h1 className="text-4xl font-black mb-4">AdBlock Detected!</h1>
      <p className="max-w-md mb-8 font-bold">Please disable AdBlock to access your secure link.</p>
      <button onClick={() => window.location.reload()} className="bg-white text-red-600 px-12 py-4 rounded-full font-black text-xl shadow-2xl">RELOAD 🔄</button>
    </div>
  );

  if (loading || !linkData) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-blue-500 font-bold animate-pulse uppercase tracking-[0.3em]">Secure Connection...</div>;
  if (isBlocked) return <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-10 text-center font-black text-white"><span className="text-6xl mb-6">🛑</span><h1 className="text-3xl text-red-500 uppercase">Limit Reached</h1></div>;

  const handleStartInteraction = () => {
    if (!hasStarted) {
      setHasStarted(true);
      window.open(SMARTLINK, '_blank'); // اللمسة الأولى تفتح سمارت لينك
    }
    setIsPaused(false);
  };

  const handleNextStep = async () => {
    if (isFinalPage) {
      const ipRes = await fetch('https://api.ipify.org?format=json');
      const { ip } = await ipRes.json();
      await supabase.rpc('record_visit_and_pay', { target_link_id: linkData.id, target_user_id: linkData.user_id, visitor_ip: ip });
      window.open(SMARTLINK, '_blank'); // الضربة القاضية
      window.location.href = linkData.original_url;
    } else {
      // قاعدة 1 3 5 (تفتح Pop-under في الصفحات الفردية)
      if (step % 2 !== 0) {
        window.open(SMARTLINK, '_blank');
      }
      
      if (step < linkData.page_count) {
        setStep(prev => prev + 1); setCount(15); setHasStarted(false); setShowRealButton(false);
        window.scrollTo(0, 0);
      } else {
        setIsFinalPage(true); setCount(5); setHasStarted(false); setShowRealButton(false);
        window.scrollTo(0, 0);
      }
    }
  };

  return (
    <div onClick={handleStartInteraction} className="min-h-screen bg-slate-50 flex flex-col items-center font-sans cursor-pointer pb-80 relative overflow-x-hidden">
      
      {/* 🚀 إعلانات Social Bar & Popunder الأساسية من Adsterra */}
      <Script src="https://pl28859100.effectivegatecpm.com/fe/4c/47/fe4c47fb58ff46e2395b8f4a2ec3ceac.js" strategy="lazyOnload" />
      <Script src="https://pl28859246.effectivegatecpm.com/d5/32/ef/d532efcecc92896fd5072b4cf8dbbac3.js" strategy="lazyOnload" />

      {(!hasStarted || isPaused) && (
        <div className="fixed inset-0 z-[100] bg-slate-900/95 flex items-center justify-center p-6 backdrop-blur-xl text-white text-center">
          <div className="animate-pulse">
            <span className="text-7xl mb-6 block">👆</span>
            <h2 className="text-3xl font-black uppercase tracking-tighter">{isPaused ? "RESUME" : "VERIFY"}</h2>
            <p className="font-bold text-sm text-slate-400">Click anywhere to continue</p>
          </div>
        </div>
      )}

      <header className="w-full bg-white p-6 text-center border-b border-slate-200 sticky top-0 z-40 shadow-sm font-black text-blue-600 italic text-2xl">ExtraLink</header>

      {/* 1. إعلان Native علوي */}
      <AdNative id="top" />

      {/* كارت العداد */}
      <div className="bg-white p-10 rounded-[3rem] shadow-2xl max-w-md w-full text-center border border-slate-100 z-10 mx-4 mt-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-slate-100"><div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${(count/15)*100}%` }}></div></div>
        <div className="mb-8">
          <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-5 py-2 rounded-full uppercase border border-blue-100 italic">
            {isFinalPage ? 'Final Step' : `Step ${step} of ${linkData.page_count}`}
          </span>
        </div>
        <div className="py-10 text-[6rem] font-black text-slate-800 tabular-nums leading-none tracking-tighter">{count}</div>
        
        {count === 0 && (
          <div className="py-6 space-y-4">
            <button onClick={(e) => { e.stopPropagation(); setShowRealButton(true); }} className="w-full bg-blue-600 text-white font-black py-7 rounded-[2rem] text-2xl uppercase shadow-xl transition-all hover:scale-105 active:scale-95">CONTINUE</button>
            {showRealButton && <p className="text-red-600 font-black text-xs animate-bounce mt-4 uppercase tracking-widest italic">👇 Scroll down to the bottom 👇</p>}
          </div>
        )}
      </div>

      {/* 2. إعلان مربع تحت العداد */}
      <AdBanner300 id="mid1" />

      <div className="max-w-md w-full px-8 mt-10 space-y-24 text-center text-slate-400">
        <div className="space-y-4">
          <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest italic">Secure Cloud Encryption</h3>
          <p className="text-[11px] leading-relaxed font-medium opacity-70">Verifying link authenticity for your safety. ExtraLink uses global AES-256 bit encryption protocol.</p>
        </div>

        {/* 3. إعلان Native منتصف الصفحة */}
        <AdNative id="mid2" />

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm"><p className="text-green-500 font-black text-xl italic leading-none uppercase">99.9%</p><p className="text-[7px] font-bold uppercase mt-2">Uptime</p></div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm"><p className="text-blue-500 font-black text-xl italic leading-none uppercase">Secure</p><p className="text-[7px] font-bold uppercase mt-2">Status</p></div>
        </div>

        {/* 4. إعلان مربع فوق الزر */}
        <AdBanner300 id="mid3" />

        {/* الزر الحقيقي */}
        {showRealButton && (
          <div className="pt-10 animate-fadeIn">
            <button onClick={(e) => { e.stopPropagation(); handleNextStep(); }} className={`w-full text-white font-black py-8 rounded-[2.5rem] shadow-2xl transition-all active:scale-95 text-3xl uppercase tracking-tighter ${isFinalPage ? 'bg-emerald-500 shadow-emerald-200' : 'bg-blue-600 shadow-blue-200'}`}>
              {isFinalPage ? 'Get Link 🚀' : 'Next Page →'}
            </button>
          </div>
        )}

        {/* 5. إعلان Native القاع */}
        <AdNative id="bottom" />
      </div>

      <footer className="mt-40 opacity-20 grayscale font-black text-[7px] tracking-[0.6em] text-center px-10 pb-10 uppercase">
        ExtraLink Protocol v4.2.1-STABLE-SECURE
      </footer>
    </div>
  );
}