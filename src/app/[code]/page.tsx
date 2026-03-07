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
  const [isTransitioning, setIsTransitioning] = useState(false); // شاشة التحميل بين الصفحات
  const [loading, setLoading] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);
  const [adBlockEnabled, setAdBlockEnabled] = useState(false);

  const adAreaRef = useRef<HTMLDivElement>(null);

  const ADS_CONFIG = {
    ADSTERRA_SMART: "https://www.effectivegatecpm.com/rcbjyg6w?key=4b7c5edb9470ea073ea974701e4201aa",
    ADSTERRA_SOCIAL: "https://pl28859100.effectivegatecpm.com/fe/4c/47/fe4c47fb58ff46e2395b8f4a2ec3ceac.js",
    ADSTERRA_NATIVE: "https://pl28859679.effectivegatecpm.com/2d3972df0bb6c3a953e851d40cd3285a/invoke.js",
    ADSTERRA_BANNER_ID: "595231c2d8c14bc458ea69e3fcc8d37e",
    HILLTOP_POP: "//plasticdamage.com/cmDY9.6qbJ2K5hlCS/WNQr9gNUjGgz0nOTDdYXwxNRSW0-2FOKDhQP4SNljVA/5U",
    HILLTOP_BANNER: "//conventionalresponse.com/bnX.VgsVdLG_l/0bYUWtcO/seVm/9UuxZrU/lCknPhTRY/4LNpDcgv2CMrT/M/tzNSjmgD0CO/DQYixbN/wy",
    HILLTOP_INPAGE: "//conventionalresponse.com/beX.VJsdd/GUlr0/YdWBcV/teJmT9/uoZbUBlLkqP/ThYG4yNCD/g_2wMrjhkotyNnjRg/0LOfDWY/z/MgwV",
    HILLTOP_VIDEO: "//conventionalresponse.com/b.XiVysXdIGClx0lYuW_cE/-eJm/9Eu/ZfU_lHk/PzToY/4ENjDugV2/NTDmUPtPNljrgg0AOoDqYJ0yOKQN"
  };

  // وظيفة حقن الإعلانات بناءً على رقم الصفحة
  const injectAdsByStep = (currentStep: number) => {
    if (!adAreaRef.current) return;
    adAreaRef.current.innerHTML = ""; // تنظيف المنطقة تماماً

    if (currentStep % 2 !== 0) {
      // --- مملكة ADSTERRA (1, 3, 5) ---
      const native = document.createElement('script');
      native.src = ADS_CONFIG.ADSTERRA_NATIVE;
      native.async = true; native.setAttribute('data-cfasync', 'false');
      
      const bannerConf = document.createElement('script');
      bannerConf.innerHTML = `atOptions = { 'key' : '${ADS_CONFIG.ADSTERRA_BANNER_ID}', 'format' : 'iframe', 'height' : 250, 'width' : 300, 'params' : {} };`;
      const bannerScr = document.createElement('script');
      bannerScr.src = `https://www.highperformanceformat.com/${ADS_CONFIG.ADSTERRA_BANNER_ID}/invoke.js`;

      adAreaRef.current.appendChild(native);
      adAreaRef.current.appendChild(bannerConf);
      adAreaRef.current.appendChild(bannerScr);
    } else {
      // --- مملكة HILLTOPADS (2, 4, 6) ---
      const banner = document.createElement('script');
      banner.src = ADS_CONFIG.HILLTOP_BANNER;
      banner.async = true;

      const inpage = document.createElement('script');
      inpage.src = ADS_CONFIG.HILLTOP_INPAGE;
      inpage.async = true;

      const video = document.createElement('script');
      video.src = ADS_CONFIG.HILLTOP_VIDEO;
      video.async = true;

      adAreaRef.current.appendChild(banner);
      adAreaRef.current.appendChild(inpage);
      adAreaRef.current.appendChild(video);
    }
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
  }, [code]);

  // إعادة حقن الإعلانات عند كل تغيير في الصفحة (Step)
  useEffect(() => {
    if (!isTransitioning && hasStarted) {
      injectAdsByStep(step);
    }
  }, [step, isTransitioning, hasStarted]);

  useEffect(() => {
    let interval: any;
    if (hasStarted && !isPaused && !isTransitioning && !document.hidden && count > 0) {
      interval = setInterval(() => { setCount((prev) => prev - 1); }, 1000);
    }
    return () => clearInterval(interval);
  }, [hasStarted, isPaused, isTransitioning, count]);

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
    // فتح Popunder في كل صفحة
    window.open(step % 2 !== 0 ? ADS_CONFIG.ADSTERRA_SMART : ADS_CONFIG.ADSTERRA_SMART, '_blank');
    
    setIsTransitioning(true); // تشغيل شاشة التحميل
    
    setTimeout(() => {
      if (step < linkData.page_count) {
        setStep(prev => prev + 1);
        setCount(15);
      } else {
        setIsFinalPage(true);
        setCount(5);
      }
      setHasStarted(false);
      setShowRealButton(false);
      setIsTransitioning(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1000); // انتظار ثانية واحدة للتبديل
  };

  const handleGetLink = async () => {
    const ipRes = await fetch('https://api.ipify.org?format=json');
    const { ip } = await ipRes.json();
    await supabase.rpc('record_visit_and_pay', { target_link_id: linkData.id, target_user_id: linkData.user_id, visitor_ip: ip });
    window.open(ADS_CONFIG.ADSTERRA_SMART, '_blank');
    window.location.href = linkData.original_url;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-blue-500 font-black animate-pulse">INITIALIZING SECURE CONNECTION...</div>;
  if (isTransitioning) return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-black animate-bounce uppercase tracking-widest">Syncing Ad Servers...</div>;
  if (adBlockEnabled) return <div className="min-h-screen bg-red-600 flex items-center justify-center text-white p-10 text-center font-bold uppercase">Please Disable AdBlock!</div>;
  if (isBlocked) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-red-500 p-10 text-center font-bold text-2xl uppercase">Daily Limit Reached! 🛑</div>;

  return (
    <div onClick={handleStartInteraction} className="min-h-screen bg-slate-50 flex flex-col items-center relative font-sans overflow-x-hidden cursor-pointer pb-40">
      
      {/* سكريبتات عائمة تتبدل حسب الصفحة */}
      {step % 2 !== 0 ? (
        <Script src={ADS_CONFIG.ADSTERRA_SOCIAL} strategy="afterInteractive" key={`ad-social-${step}`} />
      ) : (
        <Script src={ADS_CONFIG.HILLTOP_POP} strategy="afterInteractive" key={`ad-pop-${step}`} />
      )}

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

      {/* منطقة حقن الإعلانات الديناميكية (تتبدل كلياً في كل صفحة) */}
      <div className="w-full max-w-md mt-6 px-4 space-y-10" ref={adAreaRef} key={`ad-container-${step}`}>
        {/* هنا سيتم زرع إعلانات الشركة الحالية بقوة */}
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
          <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Live Security Logs</h4>
          <div className="bg-slate-900 p-8 rounded-[2.5rem] font-mono text-[10px] text-green-500 text-left space-y-3 shadow-2xl border border-slate-800">
            <p>{`> Initializing secure handshake...`}</p>
            <p>{`> Verifying IP: 103.XX.XX.XX`}</p>
            <p>{`> Bypassing firewall... OK`}</p>
            <p>{`> Connection: STABLE`}</p>
          </div>
        </div>

        {/* الزر الحقيقي (يظهر فقط في الأسفل بعد ضغط Continue) */}
        {showRealButton && (
          <div className="pt-10 pb-20 animate-fadeIn">
            <button onClick={(e) => { e.stopPropagation(); isFinalPage ? handleGetLink() : handleNext(); }} className={`w-full text-white font-black py-8 rounded-[2.5rem] shadow-2xl transition-all active:scale-95 text-3xl uppercase tracking-tighter ${isFinalPage ? 'bg-green-500 shadow-green-200' : 'bg-blue-600 shadow-blue-200'}`}>
              {isFinalPage ? 'Get Link Now 🚀' : 'Next Page →'}
            </button>
          </div>
        )}

        <div className="bg-blue-600 p-10 rounded-[3rem] text-white text-left shadow-2xl relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <h4 className="font-black uppercase text-sm mb-4 tracking-tighter">Why ExtraLink?</h4>
          <p className="text-xs leading-relaxed opacity-90 font-medium">We provide the most secure environment for file sharing. Our servers are distributed globally to ensure the fastest response times.</p>
        </div>
      </div>

      <footer className="mt-20 opacity-20 grayscale font-black text-[8px] tracking-[0.5em] text-center px-10 pb-10">
        EXTRALINK SECURE PROTOCOL v4.2.0-STABLE
      </footer>
    </div>
  );
}