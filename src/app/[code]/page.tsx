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
  const [hasStarted, setHasStarted] = useState(false); // هل بدأ الزائر التفاعل؟
  const [loading, setLoading] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);
  const [adBlockEnabled, setAdBlockEnabled] = useState(false);
  const [showAds, setShowAds] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const bannerRef = useRef<HTMLDivElement>(null);
  const nativeRef = useRef<HTMLDivElement>(null);

  const ADS_CONFIG = {
    SOCIAL_BAR: "https://pl28859100.effectivegatecpm.com/fe/4c/47/fe4c47fb58ff46e2395b8f4a2ec3ceac.js",
    POPUNDER: "https://pl28859246.effectivegatecpm.com/d5/32/ef/d532efcecc92896fd5072b4cf8dbbac3.js",
    SMARTLINK: "https://www.effectivegatecpm.com/rcbjyg6w?key=4b7c5edb9470ea073ea974701e4201aa",
    NATIVE_SRC: "https://pl28859679.effectivegatecpm.com/2d3972df0bb6c3a953e851d40cd3285a/invoke.js",
    BANNER_300_SRC: "https://www.highperformanceformat.com/595231c2d8c14bc458ea69e3fcc8d37e/invoke.js"
  };

  const injectBanner = () => {
    if (bannerRef.current && !bannerRef.current.innerHTML) {
      const conf = document.createElement('script');
      conf.innerHTML = `atOptions = { 'key' : '595231c2d8c14bc458ea69e3fcc8d37e', 'format' : 'iframe', 'height' : 250, 'width' : 300, 'params' : {} };`;
      const script = document.createElement('script');
      script.src = ADS_CONFIG.BANNER_300_SRC;
      bannerRef.current.appendChild(conf);
      bannerRef.current.appendChild(script);
    }
  };

  const injectNative = () => {
    if (nativeRef.current && !nativeRef.current.innerHTML) {
      const script = document.createElement('script');
      script.src = ADS_CONFIG.NATIVE_SRC;
      script.async = true;
      script.setAttribute('data-cfasync', 'false');
      nativeRef.current.appendChild(script);
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

    setTimeout(() => {
      setShowAds(true);
      injectBanner();
      injectNative();
    }, 1500);
  }, [code]);

  // منطق العداد (لا يعمل إلا إذا كان hasStarted = true)
  useEffect(() => {
    if (!loading && !isBlocked && !adBlockEnabled && linkData && count > 0 && !isPaused && !document.hidden && hasStarted) {
      timerRef.current = setTimeout(() => setCount(prev => prev - 1), 1000);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [count, isPaused, loading, isBlocked, adBlockEnabled, linkData, hasStarted]);

  // وظيفة بدء التفاعل
  const handleStartInteraction = () => {
    if (!hasStarted) {
      setHasStarted(true);
      // فتح أول إعلان Pop-under فوراً عند أول لمسة
      window.open(ADS_CONFIG.SMARTLINK, '_blank');
    }
    setIsPaused(false);
  };

  const handleNext = () => {
    if (step % 2 !== 0) { window.open(ADS_CONFIG.SMARTLINK, '_blank'); }
    setIsPaused(true);
    if (step < linkData.page_count) { setStep(prev => prev + 1); setCount(15); } 
    else { setIsFinalPage(true); setCount(5); }
  };

  const handleGetLink = async () => {
    const ipRes = await fetch('https://api.ipify.org?format=json');
    const { ip } = await ipRes.json();
    await supabase.rpc('record_visit_and_pay', { target_link_id: linkData.id, target_user_id: linkData.user_id, visitor_ip: ip });
    window.open(ADS_CONFIG.SMARTLINK, '_blank');
    window.location.href = linkData.original_url;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-black animate-pulse uppercase tracking-widest">ExtraLink Loading...</div>;
  if (adBlockEnabled) return <div className="min-h-screen bg-red-600 flex items-center justify-center text-white p-10 text-center font-bold">Please Disable AdBlock to continue!</div>;
  if (isBlocked) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-red-500 p-10 text-center font-bold text-2xl uppercase">Daily Limit Reached! 🛑</div>;

  return (
    <div onClick={handleStartInteraction} className="min-h-screen bg-slate-50 flex flex-col items-center p-4 relative font-sans overflow-x-hidden cursor-pointer">
      
      {showAds && (
        <>
          <Script src={ADS_CONFIG.SOCIAL_BAR} strategy="afterInteractive" />
          <Script src={ADS_CONFIG.POPUNDER} strategy="afterInteractive" />
        </>
      )}

      {/* واجهة "اضغط للبدء" أو "استئناف" */}
      {(!hasStarted || isPaused) && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white p-8 rounded-3xl text-center shadow-2xl animate-bounce">
            <span className="text-4xl mb-4 block">👆</span>
            <h2 className="text-xl font-black text-slate-800">
              {!hasStarted ? "Click to Verify" : "Timer Paused"}
            </h2>
            <p className="text-slate-500 text-sm">Touch anywhere to continue</p>
          </div>
        </div>
      )}

      <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl max-w-md w-full text-center border border-slate-100 z-10 my-auto">
        <h1 className="text-3xl font-black text-blue-600 mb-6 italic tracking-tighter">ExtraLink</h1>
        
        <div className="mb-6 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 min-h-[150px]" ref={nativeRef}>
           {!showAds && <p className="text-slate-300 text-[10px] font-bold py-10 uppercase">Ad Loading...</p>}
        </div>

        <div className="mb-4">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
            {isFinalPage ? 'Final Step' : `Step ${step} of ${linkData.page_count}`}
          </span>
        </div>

        {count > 0 ? (
          <div className="text-7xl font-black text-slate-800 mb-6 tabular-nums">
            {count}<span className="text-blue-600 text-2xl">s</span>
          </div>
        ) : (
          <button 
            onClick={(e) => { e.stopPropagation(); isFinalPage ? handleGetLink() : handleNext(); }} 
            className={`w-full text-white font-black py-5 rounded-2xl shadow-xl transition-all active:scale-95 ${isFinalPage ? 'bg-green-500' : 'bg-blue-600'}`}
          >
            {isFinalPage ? 'GET LINK 🚀' : 'NEXT PAGE →'}
          </button>
        )}

        <div className="mt-8 flex justify-center overflow-hidden rounded-2xl min-h-[250px]" ref={bannerRef}>
           {!showAds && <p className="text-slate-300 text-[10px] font-bold py-20 uppercase">Ad Loading...</p>}
        </div>
      </div>

      <div className="mt-10 opacity-20 grayscale font-black text-[9px] tracking-[0.3em] pb-10">
        SECURE ENCRYPTED LINK
      </div>
    </div>
  );
}