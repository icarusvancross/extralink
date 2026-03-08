"use client";
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '../lib/supabase'; 

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

  // رابط السمارت لينك للـ Popunder فقط
  const SMARTLINK = "https://www.effectivegatecpm.com/rcbjyg6w?key=4b7c5edb9470ea073ea974701e4201aa";

  useEffect(() => {
    const fetchLink = async () => {
      const { data } = await supabase.from('links').select('*').eq('short_code', code).single();
      if (!data) window.location.href = "/";
      else { setLinkData(data); setLoading(false); }
    };
    fetchLink();
  }, [code]);

  useEffect(() => {
    let interval: any;
    if (hasStarted && !isPaused && !document.hidden && count > 0) {
      interval = setInterval(() => setCount(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [hasStarted, isPaused, count]);

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

  const handleStart = () => {
    if (!hasStarted) {
      setHasStarted(true);
      window.open(SMARTLINK, '_blank');
    }
    setIsPaused(false);
  };

  const handleNext = () => {
    window.open(SMARTLINK, '_blank');
    if (step < linkData.page_count) {
      setStep(prev => prev + 1); setCount(15); setHasStarted(false); setShowRealButton(false);
      window.scrollTo(0, 0);
    } else {
      setIsFinalPage(true); setCount(5); setHasStarted(false); setShowRealButton(false);
      window.scrollTo(0, 0);
    }
  };

  const handleGetLink = async () => {
    const ipRes = await fetch('https://api.ipify.org?format=json');
    const { ip } = await ipRes.json();
    await supabase.rpc('record_visit_and_pay', { target_link_id: linkData.id, target_user_id: linkData.user_id, visitor_ip: ip });
    window.open(SMARTLINK, '_blank');
    window.location.href = linkData.original_url;
  };

  // مكون الإعلان المعزول (Iframe)
  const AdBox = ({ id }: { id: string }) => (
    <div className="my-10 flex flex-col items-center justify-center w-full">
      <p className="text-[7px] text-slate-300 font-black uppercase mb-2 tracking-[0.4em]">Advertisement Area</p>
      <div className="rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white bg-white min-h-[250px] min-w-[300px]">
        <iframe 
          src={`/ads/test-banner.html?v=${id}`} 
          width="300" 
          height="250" 
          scrolling="no" 
          frameBorder="0"
        ></iframe>
      </div>
    </div>
  );

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-blue-500 font-bold">LOADING...</div>;

  return (
    <div onClick={handleStart} className="min-h-screen bg-slate-50 flex flex-col items-center relative font-sans overflow-x-hidden cursor-pointer pb-60">
      
      {(!hasStarted || isPaused) && (
        <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white p-12 rounded-[3.5rem] text-center shadow-2xl border-8 border-blue-500 max-w-xs w-full animate-pulse">
            <span className="text-7xl mb-6 block">👆</span>
            <h2 className="text-2xl font-black text-slate-800 uppercase mb-2 tracking-tighter">Click to Continue</h2>
          </div>
        </div>
      )}

      <header className="w-full bg-white p-6 text-center border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <h1 className="text-2xl font-black text-blue-600 italic tracking-tighter">ExtraLink</h1>
      </header>

      {/* 1. الإعلان الأول (في الأعلى) */}
      <AdBox id="top" />

      {/* كارت العداد */}
      <div className="bg-white p-10 rounded-[3rem] shadow-2xl max-w-md w-full text-center border border-slate-100 z-10 mx-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-slate-100">
          <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${(count/15)*100}%` }}></div>
        </div>
        <div className="mb-8">
          <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-5 py-2 rounded-full uppercase tracking-widest border border-blue-100">
            {isFinalPage ? 'Final Step' : `Step ${step} of ${linkData.page_count}`}
          </span>
        </div>
        <div className="py-10 text-9xl font-black text-slate-800 tabular-nums leading-none tracking-tighter">{count}</div>
        
        {count === 0 && (
          <div className="py-6">
            <button onClick={(e) => { e.stopPropagation(); setShowRealButton(true); }} className="w-full bg-blue-600 text-white font-black py-7 rounded-[2.5rem] text-2xl uppercase shadow-xl active:scale-95">CONTINUE</button>
            {showRealButton && <p className="text-red-600 font-black text-xs animate-bounce mt-4 uppercase tracking-tighter">👇 Scroll down for Next Page 👇</p>}
          </div>
        )}
      </div>

      {/* 2. الإعلان الثاني (تحت العداد) */}
      <AdBox id="under-timer" />

      <div className="max-w-md w-full px-8 mt-10 space-y-12 text-center text-slate-400">
        <h3 className="font-black text-slate-800 uppercase text-sm tracking-widest">Cloud Encryption Active</h3>
        <p className="text-xs leading-relaxed font-medium italic">Our military-grade AES-256 protocol ensures that your link is protected from any malicious scrapers or automated systems.</p>
        
        {/* 3. الإعلان الثالث (وسط الصفحة) */}
        <AdBox id="middle" />

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm"><p className="text-green-500 font-black text-2xl">99.9%</p><p className="text-[8px] font-bold uppercase text-slate-400">Uptime</p></div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm"><p className="text-blue-500 font-black text-2xl">Verified</p><p className="text-[8px] font-bold uppercase text-slate-400">Scan</p></div>
        </div>

        {/* 4. الإعلان الرابع (فوق الزر الحقيقي) */}
        <AdBox id="above-button" />

        {showRealButton && (
          <div className="pt-10 pb-20 animate-fadeIn">
            <button onClick={(e) => { e.stopPropagation(); isFinalPage ? handleGetLink() : handleNext(); }} className={`w-full text-white font-black py-8 rounded-[2.5rem] shadow-2xl transition-all active:scale-95 text-3xl uppercase ${isFinalPage ? 'bg-green-500 shadow-green-200' : 'bg-blue-600 shadow-blue-200'}`}>
              {isFinalPage ? 'Get Link 🚀' : 'Next Page →'}
            </button>
          </div>
        )}

        {/* 5. الإعلان الخامس (في القاع) */}
        <AdBox id="bottom" />
      </div>

      <footer className="mt-20 opacity-20 grayscale font-black text-[8px] tracking-[0.5em] text-center px-10 pb-10">
        EXTRALINK SECURE PROTOCOL v4.2.0-STABLE
      </footer>
    </div>
  );
}