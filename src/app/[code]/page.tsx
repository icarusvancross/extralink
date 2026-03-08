"use client";
import { useState, useEffect, memo, useRef } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '../lib/supabase'; 
import Script from 'next/script';

// --- مكونات الإعلانات المعزولة (لضمان الظهور الفوري والثبات 100%) ---

const AdBanner300 = memo(({ id }: { id: string }) => (
  <div className="my-8 flex flex-col items-center justify-center w-full min-h-[280px]">
    <p className="text-[7px] text-slate-300 font-black uppercase mb-2 tracking-[0.4em]">Advertisement</p>
    <div className="rounded-2xl overflow-hidden shadow-xl border-4 border-white bg-white min-h-[250px] min-w-[300px] flex items-center justify-center">
      <iframe src="/ad300.html" width="300" height="250" frameBorder="0" scrolling="no" title={id}></iframe>
    </div>
  </div>
));
AdBanner300.displayName = "AdBanner300";

const AdNative = memo(({ id }: { id: string }) => (
  <div className="my-8 w-full max-w-md px-4 min-h-[200px]">
    <p className="text-[7px] text-slate-300 font-black uppercase mb-2 text-center tracking-[0.4em]">Recommended</p>
    <div className="rounded-2xl overflow-hidden shadow-sm border border-slate-50 bg-white min-h-[180px] flex items-center justify-center">
      <iframe src={`/ad-native.html?v=${id}`} className="w-full h-[180px]" frameBorder="0" scrolling="no"></iframe>
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

  const SMARTLINK = "https://www.effectivegatecpm.com/rcbjyg6w?key=4b7c5edb9470ea073ea974701e4201aa";

  // 1. نظام الحماية والتحقق الأولي
  useEffect(() => {
    setIsMounted(true);
    const initSecurity = async () => {
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
    initSecurity();
  }, [code]);

  // 2. محرك العداد (يتوقف عند الخروج)
  useEffect(() => {
    let interval: any;
    if (isMounted && hasStarted && !isPaused && !document.hidden && !isAdBlockerActive && count > 0) {
      interval = setInterval(() => setCount(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isMounted, hasStarted, isPaused, count, isAdBlockerActive]);

  // 3. استئناف العداد تلقائياً عند العودة
  useEffect(() => {
    const handleFocus = () => setIsPaused(false);
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  if (!isMounted) return null;

  if (isAdBlockerActive) return (
    <div className="min-h-screen bg-red-600 flex flex-col items-center justify-center p-6 text-center text-white font-sans">
      <h1 className="text-4xl font-black mb-4">AdBlock Detected!</h1>
      <p className="max-w-md mb-8 font-bold">Please disable AdBlock to access your secure link.</p>
      <button onClick={() => window.location.reload()} className="bg-white text-red-600 px-12 py-4 rounded-full font-black text-xl">RELOAD 🔄</button>
    </div>
  );

  if (loading || !linkData) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-blue-500 font-bold animate-pulse uppercase tracking-[0.3em] text-center p-10">ExtraLink Secure Protocol...</div>;
  if (isBlocked) return <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-10 text-center font-black text-white uppercase"><span className="text-6xl mb-6">🛑</span><h1 className="text-3xl text-red-500">Daily Limit Reached</h1></div>;

  const handleStartInteraction = () => {
    if (!hasStarted) {
      setHasStarted(true);
      window.open(SMARTLINK, '_blank'); 
    }
    setIsPaused(false);
  };

  const handleNextStep = async () => {
    if (isFinalPage) {
      const ipRes = await fetch('https://api.ipify.org?format=json');
      const { ip } = await ipRes.json();
      await supabase.rpc('record_visit_and_pay', { target_link_id: linkData.id, target_user_id: linkData.user_id, visitor_ip: ip });
      window.open(SMARTLINK, '_blank'); 
      window.location.href = linkData.original_url;
    } else {
      // قاعدة التناوب 1-3-5 للـ Pop-under
      if (step % 2 !== 0) {
        window.open(SMARTLINK, '_blank');
      }

      // المنطق الرياضي الصحيح للانتقال
      if (step < linkData.page_count) {
        setStep(prev => prev + 1);
        setCount(15);
        setHasStarted(false);
        setShowRealButton(false);
        window.scrollTo(0, 0);
      } else {
        setIsFinalPage(true);
        setCount(5);
        setHasStarted(false);
        setShowRealButton(false);
        window.scrollTo(0, 0);
      }
    }
  };

  // --- واجهة الصفحة النهائية (الخضراء) ---
  if (isFinalPage) {
    return (
      <div onClick={handleStartInteraction} className="min-h-screen bg-emerald-50 flex flex-col items-center justify-center p-6 relative cursor-pointer font-sans">
        {(!hasStarted || isPaused) && (
          <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-6 text-center text-white">
            <div className="animate-bounce"><span className="text-6xl mb-4 block">👆</span><h2 className="text-3xl font-black uppercase">Final Step</h2><p className="font-bold">Click to generate link</p></div>
          </div>
        )}
        <div className="bg-white p-10 rounded-[3rem] shadow-2xl max-w-md w-full text-center border border-emerald-100">
          <h1 className="text-3xl font-black text-emerald-700 mb-6 uppercase italic">Ready! ✅</h1>
          {count > 0 ? <div className="text-[8rem] font-black text-emerald-500 tabular-nums leading-none tracking-tighter">{count}</div> : 
          <button onClick={handleNextStep} className="w-full bg-emerald-500 text-white font-black py-7 rounded-[2rem] text-2xl shadow-xl active:scale-95 transition-all">GET LINK 🚀</button>}
        </div>
      </div>
    );
  }

  // --- واجهة صفحات الانتظار (الزرقاء) ---
  return (
    <div onClick={handleStartInteraction} className="min-h-screen bg-slate-50 flex flex-col items-center font-sans cursor-pointer pb-[100vh] relative overflow-x-hidden">
      
      {/* سكريبتات Adsterra العائمة */}
      <Script src="https://pl28859100.effectivegatecpm.com/fe/4c/47/fe4c47fb58ff46e2395b8f4a2ec3ceac.js" strategy="lazyOnload" />
      <Script src="https://pl28859246.effectivegatecpm.com/d5/32/ef/d532efcecc92896fd5072b4cf8dbbac3.js" strategy="lazyOnload" />

      {(!hasStarted || isPaused) && (
        <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-xl flex items-center justify-center p-6 text-center text-white">
          <div className="bg-white p-12 rounded-[3.5rem] text-slate-800 shadow-2xl border-8 border-blue-500 max-w-xs w-full animate-pulse">
            <span className="text-7xl mb-6 block">👆</span>
            <h2 className="text-3xl font-black uppercase tracking-tighter">Verify</h2>
            <p className="text-slate-500 font-bold text-sm">Click anywhere to continue</p>
          </div>
        </div>
      )}

      <header className="w-full bg-white p-6 text-center border-b border-slate-200 sticky top-0 z-40 shadow-sm font-black text-blue-600 italic text-2xl tracking-tighter uppercase">ExtraLink</header>

      {/* 1. إعلان Native علوي */}
      <AdNative id="top" />

      {/* كارت العداد */}
      <div className="bg-white p-10 rounded-[3rem] shadow-2xl max-w-md w-full text-center border border-slate-100 z-10 mx-4 mt-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-slate-100"><div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${(count/15)*100}%` }}></div></div>
        <div className="mb-8">
          <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-5 py-2 rounded-full uppercase border border-blue-100 italic">
            Step {step} of {linkData.page_count}
          </span>
        </div>
        <div className="py-10 text-[8rem] font-black text-slate-800 tabular-nums leading-none tracking-tighter">{count}</div>
        
        {count === 0 && (
          <div className="py-6">
            <button onClick={(e) => { e.stopPropagation(); setShowRealButton(true); }} className="w-full bg-blue-600 text-white font-black py-7 rounded-[2rem] text-2xl uppercase shadow-xl active:scale-95 transition-all">CONTINUE</button>
            {showRealButton && <p className="text-red-600 font-black text-xs animate-bounce mt-4 uppercase tracking-widest italic tracking-tighter">👇 Scroll down to the bottom 👇</p>}
          </div>
        )}
      </div>

      {/* 2. إعلان مربع تحت العداد */}
      <AdBanner300 id="mid1" />

      {/* محتوى طويل لإجبار السكرول */}
      <div className="max-w-md w-full px-8 mt-10 space-y-32 text-center text-slate-400">
        <div className="space-y-4">
          <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest italic underline decoration-blue-500 decoration-2">Secure Cloud Encryption</h3>
          <p className="text-[11px] leading-relaxed font-medium opacity-70">"Protecting your destination link with AES-256 cloud-based protocol. Secure, Fast, and Reliable."</p>
        </div>

        {/* 3. إعلان Native منتصف الصفحة */}
        <AdNative id="mid2" />

        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between px-10 text-slate-900">
            <div className="text-left"><p className="text-slate-400 text-[8px] font-black uppercase mb-1">Status</p><p className="text-green-500 font-black text-xl italic leading-none uppercase">Verified</p></div>
            <span className="text-3xl">✓</span>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between px-10 text-slate-900">
            <div className="text-left"><p className="text-slate-400 text-[8px] font-black uppercase mb-1">Protection</p><p className="text-blue-500 font-black text-xl italic leading-none uppercase">Active</p></div>
            <span className="text-3xl">🛡️</span>
          </div>
        </div>

        {/* 4. إعلان مربع فوق الزر الحقيقي */}
        <AdBanner300 id="mid3" />

        {/* الزر الحقيقي */}
        {showRealButton && (
          <div className="pt-10 animate-fadeIn scale-110">
            <button onClick={(e) => { e.stopPropagation(); handleNextStep(); }} className="w-full bg-blue-600 text-white font-black py-9 rounded-[2.5rem] shadow-2xl transition-all active:scale-95 text-4xl uppercase tracking-tighter">
              Next Page →
            </button>
          </div>
        )}

        {/* 5. إعلان Native القاع */}
        <AdNative id="bottom" />
      </div>

      <footer className="mt-60 opacity-20 grayscale font-black text-[7px] tracking-[0.6em] text-center px-10 pb-10 uppercase">
        ExtraLink Protocol v4.2.1-STABLE-SECURE
      </footer>
    </div>
  );
}