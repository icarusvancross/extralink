"use client";
import { useState, useEffect, useRef } from 'react';
import Script from 'next/script';

export default function AdsterraPage({ step, totalSteps, onNext }: any) {
  const [count, setCount] = useState(15);
  const [hasStarted, setHasStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showRealButton, setShowRealButton] = useState(false);
  
  const adTopRef = useRef<HTMLDivElement>(null);
  const adMiddleRef = useRef<HTMLDivElement>(null);

  const ADS = {
    SOCIAL: "https://pl28859100.effectivegatecpm.com/fe/4c/47/fe4c47fb58ff46e2395b8f4a2ec3ceac.js",
    POPUNDER: "https://pl28859246.effectivegatecpm.com/d5/32/ef/d532efcecc92896fd5072b4cf8dbbac3.js",
    NATIVE_ID: "2d3972df0bb6c3a953e851d40cd3285a",
    BANNER_ID: "595231c2d8c14bc458ea69e3fcc8d37e",
    SMARTLINK: "https://www.effectivegatecpm.com/rcbjyg6w?key=4b7c5edb9470ea073ea974701e4201aa"
  };

  useEffect(() => {
    const injectAds = () => {
      try {
        // حقن Native العلوي
        if (adTopRef.current && adTopRef.current.innerHTML === "") {
          const scr = document.createElement('script');
          scr.src = `https://pl28859679.effectivegatecpm.com/${ADS.NATIVE_ID}/invoke.js`;
          scr.async = true;
          adTopRef.current.appendChild(scr);
        }
        // حقن البانر المربع
        if (adMiddleRef.current && adMiddleRef.current.innerHTML === "") {
          const container = document.createElement('div');
          container.id = `adsterra-${ADS.BANNER_ID}`;
          const conf = document.createElement('script');
          conf.innerHTML = `atOptions = { 'key' : '${ADS.BANNER_ID}', 'format' : 'iframe', 'height' : 250, 'width' : 300, 'params' : {} };`;
          const scr = document.createElement('script');
          scr.src = `https://www.highperformanceformat.com/${ADS.BANNER_ID}/invoke.js`;
          adMiddleRef.current.appendChild(conf);
          adMiddleRef.current.appendChild(scr);
        }
      } catch (e) { console.error("Adsterra error caught"); }
    };
    const timer = setTimeout(injectAds, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let interval: any;
    if (hasStarted && !isPaused && count > 0) {
      interval = setInterval(() => setCount(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [hasStarted, isPaused, count]);

  return (
    <div onClick={() => { if(!hasStarted) { setHasStarted(true); window.open(ADS.SMARTLINK, '_blank'); } setIsPaused(false); }} className="min-h-screen bg-slate-50 flex flex-col items-center relative font-sans overflow-x-hidden cursor-pointer pb-40">
      <Script src={ADS.SOCIAL} strategy="afterInteractive" />
      <Script src={ADS.POPUNDER} strategy="afterInteractive" />

      {(!hasStarted || isPaused) && (
        <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-xl flex items-center justify-center p-6">
          <div className="bg-white p-12 rounded-[3.5rem] text-center shadow-2xl border-8 border-blue-500 max-w-xs w-full animate-pulse">
            <span className="text-7xl mb-6 block">👆</span>
            <h2 className="text-3xl font-black text-slate-800 uppercase mb-2">Verify</h2>
            <p className="text-slate-500 font-bold text-sm">Click anywhere to continue</p>
          </div>
        </div>
      )}

      <header className="w-full bg-white p-6 text-center border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <h1 className="text-2xl font-black text-blue-600 italic tracking-tighter">ExtraLink</h1>
      </header>

      {/* Native Ad Container - Fixed Height */}
      <div className="w-full max-w-md mt-6 px-4 min-h-[200px]">
        <div ref={adTopRef} className="rounded-3xl overflow-hidden shadow-lg border border-slate-100 bg-white min-h-[180px]"></div>
      </div>

      <div className="bg-white p-10 rounded-[3rem] shadow-2xl max-w-md w-full text-center border border-slate-100 z-10 mx-4 mt-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-slate-100">
          <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${(count/15)*100}%` }}></div>
        </div>
        <div className="mb-8">
          <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-5 py-2 rounded-full uppercase tracking-widest border border-blue-100">
            Step {step} of {totalSteps}
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

      <div className="max-w-md w-full px-8 mt-20 space-y-20 text-center">
        {/* Banner Ad Container - Fixed Height */}
        <div className="flex flex-col items-center py-10 min-h-[300px]">
          <p className="text-slate-300 text-[7px] font-black uppercase mb-4 tracking-[0.5em]">Sponsored Content</p>
          <div ref={adMiddleRef} className="rounded-[3rem] overflow-hidden shadow-2xl border-[12px] border-white bg-white min-h-[250px] min-w-[300px]"></div>
        </div>

        {showRealButton && (
          <div className="pt-10 pb-20 animate-fadeIn">
            <button onClick={(e) => { e.stopPropagation(); onNext(); }} className="w-full bg-blue-600 text-white font-black py-8 rounded-[2.5rem] shadow-2xl transition-all active:scale-95 text-3xl uppercase tracking-tighter">
              Next Page →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}