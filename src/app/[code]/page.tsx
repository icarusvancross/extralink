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
  const [isBlocked, setIsBlocked] = useState(false);
  const [adBlockEnabled, setAdBlockEnabled] = useState(false);

  const adTopRef = useRef<HTMLDivElement>(null);
  const adMiddleRef = useRef<HTMLDivElement>(null);
  const adBottomRef = useRef<HTMLDivElement>(null);
  const adsInjected = useRef(false);

  const ADS_CONFIG = {
    // Adsterra
    ADSTERRA_SOCIAL: "https://pl28859100.effectivegatecpm.com/fe/4c/47/fe4c47fb58ff46e2395b8f4a2ec3ceac.js",
    ADSTERRA_SMART: "https://www.effectivegatecpm.com/rcbjyg6w?key=4b7c5edb9470ea073ea974701e4201aa",
    ADSTERRA_NATIVE: "https://pl28859679.effectivegatecpm.com/2d3972df0bb6c3a953e851d40cd3285a/invoke.js",
    // HilltopAds
    HILLTOP_POP: "//plasticdamage.com/cmDY9.6qbJ2K5hlCS/WNQr9gNUjGgz0nOTDdYXwxNRSW0-2FOKDhQP4SNljVA/5U",
    HILLTOP_BANNER: "//conventionalresponse.com/bnX.VgsVdLG_l/0bYUWtcO/seVm/9UuxZrU/lCknPhTRY/4LNpDcgv2CMrT/M/tzNSjmgD0CO/DQYixbN/wy",
    HILLTOP_INPAGE: "//conventionalresponse.com/beX.VJsdd/GUlr0/YdWBcV/teJmT9/uoZbUBlLkqP/ThYG4yNCD/g_2wMrjhkotyNnjRg/0LOfDWY/z/MgwV",
    HILLTOP_VIDEO: "//conventionalresponse.com/b.XiVysXdIGClx0lYuW_cE/-eJm/9Eu/ZfU_lHk/PzToY/4ENjDugV2/NTDmUPtPNljrgg0AOoDqYJ0yOKQN"
  };

  // وظيفة حقن كل أنواع الإعلانات فوراً
  const injectAllAds = () => {
    if (adsInjected.current) return;
    adsInjected.current = true;

    // 1. حقن البانرات الثابتة (Native & Banner)
    const staticAds = [
      { ref: adTopRef, src: ADS_CONFIG.ADSTERRA_NATIVE, isNative: true },
      { ref: adMiddleRef, src: ADS_CONFIG.HILLTOP_BANNER, isNative: false },
      { ref: adBottomRef, src: ADS_CONFIG.ADSTERRA_NATIVE, isNative: true }
    ];

    staticAds.forEach(ad => {
      if (ad.ref.current) {
        const s = document.createElement('script');
        s.src = ad.src; s.async = true;
        if (ad.isNative) s.setAttribute('data-cfasync', 'false');
        ad.ref.current.appendChild(s);
      }
    });

    // 2. حقن الإعلانات العائمة (In-page Push & Video Slider)
    [ADS_CONFIG.HILLTOP_INPAGE, ADS_CONFIG.HILLTOP_VIDEO, ADS_CONFIG.HILLTOP_POP].forEach(src => {
      const s = document.createElement('script');
      s.src = src; s.async = true;
      document.body.appendChild(s);
    });
  };

  useEffect(() => {
    const initPage = async () => {
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
    injectAllAds(); // تشغيل الإعلانات فوراً
  }, [code]);

  // عداد صارم
  useEffect(() => {
    let interval: any;
    if (hasStarted && !isPaused && !document.hidden && count > 0) {
      interval = setInterval(() => { setCount((prev) => prev - 1); }, 1000);
    }
    return () => clearInterval(interval);
  }, [hasStarted, isPaused, count]);

  // مستشعر التركيز (العودة التلقائية)
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

  const handleStartInteraction = () => {
    if (!hasStarted) {
      setHasStarted(true);
      window.open(ADS_CONFIG.ADSTERRA_SMART, '_blank');
    }
    setIsPaused(false);
  };

  const handleNext = () => {
    if (step % 2 !== 0) { window.open(ADS_CONFIG.ADSTERRA_SMART, '_blank'); }
    if (step < linkData.page_count) {
      setStep(prev => prev + 1); setCount(15);
      setHasStarted(false); setShowRealButton(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setIsFinalPage(true); setCount(5);
      setHasStarted(false); setShowRealButton(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleGetLink = async () => {
    const ipRes = await fetch('https://api.ipify.org?format=json');
    const { ip } = await ipRes.json();
    await supabase.rpc('record_visit_and_pay', { target_link_id: linkData.id, target_user_id: linkData.user_id, visitor_ip: ip });
    window.open(ADS_CONFIG.ADSTERRA_SMART, '_blank');
    window.location.href = linkData.original_url;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-black animate-pulse uppercase tracking-widest">ExtraLink Loading...</div>;
  if (adBlockEnabled) return <div className="min-h-screen bg-red-600 flex items-center justify-center text-white p-10 text-center font-bold uppercase">Please Disable AdBlock!</div>;
  if (isBlocked) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-red-500 p-10 text-center font-bold text-2xl uppercase">Daily Limit Reached! 🛑</div>;

  return (
    <div onClick={handleStartInteraction} className="min-h-screen bg-slate-50 flex flex-col items-center relative font-sans overflow-x-hidden cursor-pointer pb-40">
      
      {/* سكريبت الـ Social Bar */}
      <Script src={ADS_CONFIG.ADSTERRA_SOCIAL} strategy="afterInteractive" />

      {(!hasStarted || isPaused) && (
        <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-xl flex items-center justify-center p-6">
          <div className="bg-white p-12 rounded-[3.5rem] text-center shadow-2xl border-8 border-blue-500 max-w-xs w-full">
            <span className="text-7xl mb-6 block animate-bounce">👆</span>
            <h2 className="text-3xl font-black text-slate-800 uppercase mb-2 tracking-tighter">Verify</h2>
            <p className="text-slate-500 font-bold text-sm">Click anywhere to continue</p>
          </div>
        </div>
      )}

      <header className="w-full bg-white p-6 text-center border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <h1 className="text-2xl font-black text-blue-600 italic tracking-tighter">ExtraLink</h1>
      </header>

      {/* 1. إعلان Native علوي */}
      <div className="w-full max-w-md mt-6 px-4">
        <div id="container-adsterra-native-top" ref={adTopRef} className="rounded-3xl overflow-hidden shadow-lg border border-slate-100 bg-white min-h-[160px]"></div>
      </div>

      {/* الكارت الرئيسي للعداد */}
      <div className="bg-white p-10 rounded-[3rem] shadow-2xl max-w-md w-full text-center border border-slate-100 z-10 mx-4 mt-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-slate-100">
          <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${(count/15)*100}%` }}></div>
        </div>
        <div className="mb-8">
          <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-5 py-2 rounded-full uppercase tracking-widest border border-blue-100">
            {isFinalPage ? 'Finalizing Link' : `Step ${step} of ${linkData.page_count}`}
          </span>
        </div>
        
        {count > 0 ? (
          <div className="py-10">
            <div className="text-9xl font-black text-slate-800 tabular-nums leading-none tracking-tighter">{count}</div>
            <p className="text-slate-400 font-black mt-6 uppercase text-[10px] tracking-[0.3em] animate-pulse">Security Scan...</p>
          </div>
        ) : (
          <div className="py-10 space-y-4">
            <button onClick={(e) => { e.stopPropagation(); setShowRealButton(true); }} className="w-full bg-blue-600 text-white font-black py-7 rounded-[2.5rem] text-2xl uppercase tracking-tighter shadow-xl active:scale-95 transition-all">CONTINUE</button>
            {showRealButton && <p className="text-red-600 font-black text-sm animate-bounce uppercase tracking-tighter">👇 Scroll down to the bottom 👇</p>}
          </div>
        )}
      </div>

      {/* محتوى وهمي طويل جداً */}
      <div className="max-w-md w-full px-8 mt-20 space-y-20 text-center">
        <div className="space-y-6">
          <h3 className="font-black text-slate-800 uppercase text-sm tracking-widest">Server Status</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm"><p className="text-green-500 font-black text-2xl">99.9%</p><p className="text-[8px] font-bold uppercase text-slate-400">Uptime</p></div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm"><p className="text-blue-500 font-black text-2xl">24/7</p><p className="text-[8px] font-bold uppercase text-slate-400">Support</p></div>
          </div>
        </div>

        {/* 2. بانر HilltopAds المربع 300x250 */}
        <div className="flex flex-col items-center py-10">
          <p className="text-slate-300 text-[7px] font-black uppercase mb-4 tracking-[0.5em]">Sponsored Content</p>
          <div id="hilltop-banner-middle" ref={adMiddleRef} className="rounded-[3rem] overflow-hidden shadow-2xl border-[12px] border-white bg-white min-h-[250px] min-w-[300px]"></div>
        </div>

        <div className="space-y-6">
          <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Live Security Logs</h4>
          <div className="bg-slate-900 p-8 rounded-[2.5rem] font-mono text-[10px] text-green-500 text-left space-y-3 shadow-2xl border border-slate-800">
            <p>{`> Initializing secure handshake...`}</p>
            <p>{`> Verifying IP: 103.XX.XX.XX`}</p>
            <p>{`> Bypassing firewall... OK`}</p>
            <p>{`> Connection: STABLE`}</p>
          </div>
        </div>

        {/* 3. إعلان Native سفلي */}
        <div className="w-full px-4 py-10">
          <p className="text-[7px] text-slate-400 font-black uppercase mb-4 text-center tracking-[0.3em]">Recommended for you</p>
          <div id="container-adsterra-native-bottom" ref={adBottomRef} className="rounded-3xl overflow-hidden shadow-lg border border-slate-100 bg-white min-h-[160px]"></div>
        </div>

        {/* الزر الحقيقي */}
        {showRealButton && (
          <div className="pt-10 pb-20 animate-fadeIn">
            <button onClick={(e) => { e.stopPropagation(); isFinalPage ? handleGetLink() : handleNext(); }} className={`w-full text-white font-black py-8 rounded-[2.5rem] shadow-2xl transition-all active:scale-95 text-3xl uppercase tracking-tighter ${isFinalPage ? 'bg-green-500 shadow-green-200' : 'bg-blue-600 shadow-blue-200'}`}>
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