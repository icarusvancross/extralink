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
  const [loading, setLoading] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);
  const [adBlockEnabled, setAdBlockEnabled] = useState(false);

  const banner300Ref = useRef<HTMLDivElement>(null);
  const nativeRef = useRef<HTMLDivElement>(null);

  const ADS_CONFIG = {
    SOCIAL_BAR: "https://pl28859100.effectivegatecpm.com/fe/4c/47/fe4c47fb58ff46e2395b8f4a2ec3ceac.js",
    POPUNDER: "https://pl28859246.effectivegatecpm.com/d5/32/ef/d532efcecc92896fd5072b4cf8dbbac3.js",
    SMARTLINK: "https://www.effectivegatecpm.com/rcbjyg6w?key=4b7c5edb9470ea073ea974701e4201aa",
    NATIVE_ID: "2d3972df0bb6c3a953e851d40cd3285a",
    BANNER_300_ID: "595231c2d8c14bc458ea69e3fcc8d37e"
  };

  // وظيفة حقن الإعلانات فوراً عند تحميل الصفحة
  const injectAdsImmediately = () => {
    // 1. حقن البانر المربع 300x250
    if (banner300Ref.current && !banner300Ref.current.innerHTML) {
      const conf = document.createElement('script');
      conf.innerHTML = `atOptions = { 'key' : '${ADS_CONFIG.BANNER_300_ID}', 'format' : 'iframe', 'height' : 250, 'width' : 300, 'params' : {} };`;
      const scr = document.createElement('script');
      scr.src = `https://www.highperformanceformat.com/${ADS_CONFIG.BANNER_300_ID}/invoke.js`;
      banner300Ref.current.appendChild(conf);
      banner300Ref.current.appendChild(scr);
    }

    // 2. حقن الـ Native Banner
    if (nativeRef.current && !nativeRef.current.innerHTML) {
      const scr = document.createElement('script');
      scr.src = `https://pl28859679.effectivegatecpm.com/${ADS_CONFIG.NATIVE_ID}/invoke.js`;
      scr.async = true;
      scr.setAttribute('data-cfasync', 'false');
      nativeRef.current.appendChild(scr);
    }
  };

  useEffect(() => {
    const initPage = async () => {
      // فحص AdBlock
      const testAd = document.createElement('div');
      testAd.innerHTML = '&nbsp;'; testAd.className = 'adsbox';
      document.body.appendChild(testAd);
      if (testAd.offsetHeight === 0) setAdBlockEnabled(true);
      testAd.remove();

      try {
        const ipRes = await fetch('https://api.ipify.org?format=json');
        const { ip } = await ipRes.json();
        const { data: blocked } = await supabase.rpc('check_ip_limit', { visitor_ip: ip });
        if (blocked) { setIsBlocked(true); setLoading(false); return; }
        const { data, error } = await supabase.from('links').select('*').eq('short_code', code).single();
        if (error || !data) { window.location.href = "/"; } 
        else { setLinkData(data); setLoading(false); }
      } catch (err) { setLoading(false); }
    };
    
    initPage();
    // تحميل الإعلانات فوراً بمجرد جاهزية الصفحة
    injectAdsImmediately();
  }, [code]);

  // عداد صارم يتوقف عند الخروج
  useEffect(() => {
    let interval: any;
    if (hasStarted && !isPaused && !document.hidden && count > 0) {
      interval = setInterval(() => {
        setCount((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [hasStarted, isPaused, count]);

  // مراقبة التبويبات
  useEffect(() => {
    const handleVisibility = () => { if (document.hidden) setIsPaused(true); };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  const handleStartInteraction = () => {
    if (!hasStarted) {
      setHasStarted(true);
      window.open(ADS_CONFIG.SMARTLINK, '_blank'); // فتح أول Popunder عند أول لمسة
    }
    setIsPaused(false);
  };

  const handleNext = () => {
    if (step % 2 !== 0) { window.open(ADS_CONFIG.SMARTLINK, '_blank'); }
    setIsPaused(true);
    if (step < linkData.page_count) { setStep(prev => prev + 1); setCount(15); } 
    else { setIsFinalPage(true); setCount(5); }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGetLink = async () => {
    const ipRes = await fetch('https://api.ipify.org?format=json');
    const { ip } = await ipRes.json();
    await supabase.rpc('record_visit_and_pay', { target_link_id: linkData.id, target_user_id: linkData.user_id, visitor_ip: ip });
    window.open(ADS_CONFIG.SMARTLINK, '_blank');
    window.location.href = linkData.original_url;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-black animate-pulse uppercase tracking-widest">ExtraLink Loading...</div>;
  if (adBlockEnabled) return <div className="min-h-screen bg-red-600 flex items-center justify-center text-white p-10 text-center font-bold">PLEASE DISABLE ADBLOCK!</div>;
  if (isBlocked) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-red-500 p-10 text-center font-bold text-2xl uppercase">Daily Limit Reached! 🛑</div>;

  return (
    <div onClick={handleStartInteraction} className="min-h-screen bg-slate-50 flex flex-col items-center relative font-sans overflow-x-hidden cursor-pointer pb-20">
      
      {/* سكريبتات Adsterra التلقائية (Social Bar & Popunder) */}
      <Script src={ADS_CONFIG.SOCIAL_BAR} strategy="afterInteractive" />
      <Script src={ADS_CONFIG.POPUNDER} strategy="afterInteractive" />

      {(!hasStarted || isPaused) && (
        <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-lg flex items-center justify-center p-6">
          <div className="bg-white p-10 rounded-[3rem] text-center shadow-2xl border-4 border-blue-500 max-w-xs w-full">
            <span className="text-6xl mb-4 block animate-bounce">👆</span>
            <h2 className="text-2xl font-black text-slate-800 uppercase mb-2">Verify Identity</h2>
            <p className="text-slate-500 text-sm font-bold">Click anywhere to start the security check</p>
          </div>
        </div>
      )}

      <header className="w-full bg-white p-6 text-center border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <h1 className="text-2xl font-black text-blue-600 italic tracking-tighter">ExtraLink</h1>
      </header>

      {/* 1. إعلان Native علوي (يظهر فوراً) */}
      <div className="w-full max-w-md mt-8 px-4 min-h-[150px]">
        <div id="container-2d3972df0bb6c3a953e851d40cd3285a" ref={nativeRef} className="rounded-3xl overflow-hidden shadow-sm border border-slate-100">
           {/* سيتم حقن الإعلان هنا فوراً */}
        </div>
      </div>

      {/* الكارت الرئيسي للعداد */}
      <div className="bg-white p-10 rounded-[3rem] shadow-2xl max-w-md w-full text-center border border-slate-100 z-10 mx-4 mt-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-slate-100">
          <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${(count/15)*100}%` }}></div>
        </div>

        <div className="mb-8">
          <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-5 py-2 rounded-full uppercase tracking-widest border border-blue-100">
            {isFinalPage ? 'Finalizing Link' : `Step ${step} of ${linkData.page_count}`}
          </span>
        </div>

        {count > 0 ? (
          <div className="py-10">
            <div className="text-9xl font-black text-slate-800 tabular-nums leading-none tracking-tighter">
              {count}
            </div>
            <p className="text-slate-400 font-black mt-6 uppercase text-[10px] tracking-[0.3em] animate-pulse">
              {document.hidden ? "Timer Paused" : "Security Scan..."}
            </p>
          </div>
        ) : (
          <button 
            onClick={(e) => { e.stopPropagation(); isFinalPage ? handleGetLink() : handleNext(); }} 
            className={`w-full text-white font-black py-7 rounded-[2.5rem] shadow-2xl transition-all active:scale-95 text-2xl uppercase tracking-tighter ${isFinalPage ? 'bg-green-500 shadow-green-200' : 'bg-blue-600 shadow-blue-200'}`}
          >
            {isFinalPage ? 'Get Link Now 🚀' : 'Continue →'}
          </button>
        )}
      </div>

      {/* محتوى وهمي طويل جداً لإجبار الزائر على السكرول */}
      <div className="max-w-md w-full px-8 mt-20 space-y-12 text-center">
        <div className="space-y-4">
          <h3 className="font-black text-slate-800 uppercase text-sm tracking-widest">Cloud Encryption Active</h3>
          <p className="text-xs text-slate-400 leading-relaxed font-medium">Your connection is being routed through our secure servers. This process ensures that the destination link is safe from malware and automated bots.</p>
        </div>

        {/* 2. بانر مربع 300x250 في منتصف الصفحة (يظهر فوراً) */}
        <div className="flex flex-col items-center">
          <p className="text-slate-300 text-[8px] font-black uppercase mb-4 tracking-[0.5em]">Sponsored Content</p>
          <div className="rounded-[2.5rem] overflow-hidden shadow-xl border-8 border-white" ref={banner300Ref}>
             {/* سيتم حقن البانر هنا فوراً */}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase">Status</span>
            <span className="text-green-500 font-black text-xs uppercase">Verified ✓</span>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase">Encryption</span>
            <span className="text-blue-500 font-black text-xs uppercase">AES-256 Bit</span>
          </div>
        </div>

        <p className="text-[10px] text-slate-300 leading-loose">
          By using ExtraLink, you agree to our terms of service. We use advanced algorithms to detect fraudulent activity. Any attempt to bypass this security check will result in a permanent IP ban.
        </p>
      </div>

      <footer className="mt-32 opacity-20 grayscale font-black text-[8px] tracking-[0.5em] text-center px-10 pb-10">
        EXTRALINK SECURE PROTOCOL v4.2.0-STABLE
      </footer>
    </div>
  );
}