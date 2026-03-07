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
  const adBottomRef = useRef<HTMLDivElement>(null);

  const ADS = {
    SOCIAL: "https://pl28859100.effectivegatecpm.com/fe/4c/47/fe4c47fb58ff46e2395b8f4a2ec3ceac.js",
    POPUNDER: "https://pl28859246.effectivegatecpm.com/d5/32/ef/d532efcecc92896fd5072b4cf8dbbac3.js",
    NATIVE: "https://pl28859679.effectivegatecpm.com/2d3972df0bb6c3a953e851d40cd3285a/invoke.js",
    BANNER_ID: "595231c2d8c14bc458ea69e3fcc8d37e",
    SMARTLINK: "https://www.effectivegatecpm.com/rcbjyg6w?key=4b7c5edb9470ea073ea974701e4201aa"
  };

  // حقن إعلانات Adsterra بقوة
  useEffect(() => {
    const inject = () => {
      if (adTopRef.current) {
        const s = document.createElement('script'); s.src = ADS.NATIVE; s.async = true;
        adTopRef.current.appendChild(s);
      }
      if (adMiddleRef.current) {
        const conf = document.createElement('script');
        conf.innerHTML = `atOptions = { 'key' : '${ADS.BANNER_ID}', 'format' : 'iframe', 'height' : 250, 'width' : 300, 'params' : {} };`;
        const scr = document.createElement('script'); scr.src = `https://www.highperformanceformat.com/${ADS.BANNER_ID}/invoke.js`;
        adMiddleRef.current.appendChild(conf); adMiddleRef.current.appendChild(scr);
      }
      if (adBottomRef.current) {
        const s = document.createElement('script'); s.src = ADS.NATIVE; s.async = true;
        adBottomRef.current.appendChild(s);
      }
    };
    setTimeout(inject, 500);
  }, []);

  useEffect(() => {
    let interval: any;
    if (hasStarted && !isPaused && count > 0) {
      interval = setInterval(() => setCount(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [hasStarted, isPaused, count]);

  return (
    <div onClick={() => { if(!hasStarted) { setHasStarted(true); window.open(ADS.SMARTLINK, '_blank'); } setIsPaused(false); }} className="min-h-screen bg-orange-50/30 flex flex-col items-center pb-40 cursor-pointer">
      
      {/* سكريبتات Adsterra العائمة */}
      <Script src={ADS.SOCIAL} strategy="afterInteractive" />
      <Script src={ADS.POPUNDER} strategy="afterInteractive" />

      {(!hasStarted || isPaused) && (
        <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-white p-10 rounded-[3rem] text-center shadow-2xl border-8 border-orange-500 animate-pulse">
            <span className="text-6xl mb-4 block">👆</span>
            <h2 className="text-2xl font-black text-slate-800 uppercase">Adsterra Verification</h2>
            <p className="text-slate-500 font-bold">Click anywhere to start</p>
          </div>
        </div>
      )}

      <header className="w-full bg-white p-6 text-center border-b border-orange-100 sticky top-0 z-40 shadow-sm">
        <h1 className="text-2xl font-black text-orange-600 italic tracking-tighter">ExtraLink | Adsterra Mode</h1>
      </header>

      {/* إعلان Native علوي */}
      <div className="w-full max-w-md mt-6 px-4 min-h-[160px]" ref={adTopRef}></div>

      {/* كارت العداد */}
      <div className="bg-white p-10 rounded-[3rem] shadow-2xl max-w-md w-full text-center border border-orange-100 z-10 mx-4 mt-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-orange-100">
          <div className="h-full bg-orange-500 transition-all duration-1000" style={{ width: `${(count/15)*100}%` }}></div>
        </div>
        <p className="text-orange-600 text-[10px] font-black uppercase mb-4 tracking-widest">Step {step} of {totalSteps}</p>
        
        {count > 0 ? (
          <div className="py-10">
            <div className="text-9xl font-black text-slate-800 tabular-nums leading-none">{count}</div>
            <p className="text-slate-400 font-black mt-6 uppercase text-[10px] tracking-[0.3em] animate-pulse">Scanning Adsterra Servers...</p>
          </div>
        ) : (
          <div className="py-10 space-y-4">
            <button onClick={(e) => { e.stopPropagation(); setShowRealButton(true); }} className="w-full bg-orange-600 text-white font-black py-7 rounded-[2.5rem] text-2xl uppercase shadow-xl active:scale-95">CONTINUE</button>
            {showRealButton && <p className="text-red-600 font-black text-sm animate-bounce uppercase">👇 Scroll down for Next Page 👇</p>}
          </div>
        )}
      </div>

      {/* محتوى طويل + بانر منتصف */}
      <div className="max-w-md w-full px-8 mt-20 space-y-20 text-center">
        <div className="flex flex-col items-center py-10" ref={adMiddleRef}></div>
        
        <div className="bg-slate-900 p-8 rounded-[2.5rem] font-mono text-[10px] text-orange-400 text-left space-y-3 shadow-2xl">
          <p>{`> Adsterra Handshake: OK`}</p>
          <p>{`> Encrypting Data...`}</p>
          <p>{`> Status: SECURE`}</p>
        </div>

        {/* إعلان Native سفلي */}
        <div className="w-full min-h-[160px]" ref={adBottomRef}></div>

        {/* الزر الحقيقي */}
        {showRealButton && (
          <div className="pt-10 pb-20">
            <button onClick={(e) => { e.stopPropagation(); onNext(); }} className="w-full bg-orange-600 text-white font-black py-8 rounded-[2.5rem] shadow-2xl text-3xl uppercase">Next Page →</button>
          </div>
        )}
      </div>
    </div>
  );
}