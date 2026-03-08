"use client";
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '../lib/supabase'; 

export default function WaitingPage() {
  const { code } = useParams();
  const [isMounted, setIsMounted] = useState(false); // صمام أمان التحميل
  const [linkData, setLinkData] = useState<any>(null);
  const [step, setStep] = useState(1);
  const [isFinalPage, setIsFinalPage] = useState(false);
  const [count, setCount] = useState(15);
  const [isPaused, setIsPaused] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [showRealButton, setShowRealButton] = useState(false);
  const [loading, setLoading] = useState(true);

  // الرابط الاحتياطي للبوب اب
  const SMARTLINK = "https://www.effectivegatecpm.com/rcbjyg6w?key=4b7c5edb9470ea073ea974701e4201aa";

  useEffect(() => {
    setIsMounted(true); // الصفحة أصبحت "حية" في المتصفح
    const fetchLink = async () => {
      try {
        const { data } = await supabase.from('links').select('*').eq('short_code', code).single();
        if (!data) window.location.href = "/";
        else { setLinkData(data); setLoading(false); }
      } catch (e) { setLoading(false); }
    };
    fetchLink();
  }, [code]);

  useEffect(() => {
    let interval: any;
    if (isMounted && hasStarted && !isPaused && !document.hidden && count > 0) {
      interval = setInterval(() => setCount(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isMounted, hasStarted, isPaused, count]);

  // استئناف العداد عند العودة
  useEffect(() => {
    const onFocus = () => setIsPaused(false);
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  if (!isMounted) return null; // منع الانهيار قبل التحميل الكامل

  const handleStart = () => {
    if (!hasStarted) {
      setHasStarted(true);
      try { window.open(SMARTLINK, '_blank'); } catch(e) {}
    }
    setIsPaused(false);
  };

  const handleNext = () => {
    try { window.open(SMARTLINK, '_blank'); } catch(e) {}
    if (step < linkData?.page_count) {
      setStep(prev => prev + 1); setCount(15); setHasStarted(false); setShowRealButton(false);
      window.scrollTo(0, 0);
    } else {
      setIsFinalPage(true); setCount(5); setHasStarted(false); setShowRealButton(false);
      window.scrollTo(0, 0);
    }
  };

  const handleGetLink = async () => {
    try {
      const ipRes = await fetch('https://api.ipify.org?format=json');
      const { ip } = await ipRes.json();
      await supabase.rpc('record_visit_and_pay', { target_link_id: linkData.id, target_user_id: linkData.user_id, visitor_ip: ip });
      window.open(SMARTLINK, '_blank');
      window.location.href = linkData.original_url;
    } catch (e) { window.location.href = linkData?.original_url; }
  };

  // مكون الإعلان "المحصن" (Shielded Ad Box)
  const AdBox = ({ id }: { id: string }) => (
    <div className="my-10 flex flex-col items-center justify-center w-full">
      <div className="rounded-[2.5rem] overflow-hidden shadow-xl border-4 border-white bg-slate-100 min-h-[250px] min-w-[300px] relative">
        <iframe 
          src={`/ads/test-banner.html?v=${id}`} 
          width="300" 
          height="250" 
          scrolling="no" 
          frameBorder="0"
          title={`ad-${id}`}
          sandbox="allow-scripts allow-same-origin allow-popups" // حماية نووية تمنع الانهيار
          loading="lazy"
        ></iframe>
      </div>
    </div>
  );

  if (loading || !linkData) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-blue-500 font-bold animate-pulse">EXTRALINK | SECURE CONNECTION...</div>;

  return (
    <div onClick={handleStart} className="min-h-screen bg-slate-50 flex flex-col items-center relative font-sans overflow-x-hidden cursor-pointer pb-60">
      
      {(!hasStarted || isPaused) && (
        <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white p-10 rounded-[3rem] text-center shadow-2xl border-4 border-blue-600 animate-pulse max-w-xs w-full">
            <span className="text-7xl mb-4 block">👆</span>
            <h2 className="text-2xl font-black text-slate-800 uppercase">Click to Verify</h2>
            <p className="text-slate-500 font-bold text-sm">To continue to your link</p>
          </div>
        </div>
      )}

      <header className="w-full bg-white p-6 text-center border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <h1 className="text-2xl font-black text-blue-600 italic">ExtraLink</h1>
      </header>

      <AdBox id="1" />

      <div className="bg-white p-10 rounded-[3rem] shadow-2xl max-w-md w-full text-center border border-slate-100 z-10 mx-4 mt-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-slate-100">
          <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${(count/15)*100}%` }}></div>
        </div>
        <div className="mb-8">
          <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-5 py-2 rounded-full uppercase tracking-widest border border-blue-100">
            {isFinalPage ? 'FINAL STEP' : `STEP ${step} OF ${linkData.page_count}`}
          </span>
        </div>
        <div className="py-10 text-9xl font-black text-slate-800 tabular-nums leading-none tracking-tighter">{count}</div>
        
        {count === 0 && (
          <div className="py-6">
            <button onClick={(e) => { e.stopPropagation(); setShowRealButton(true); }} className="w-full bg-blue-600 text-white font-black py-7 rounded-[2rem] text-2xl uppercase shadow-xl transition-all">CONTINUE</button>
            {showRealButton && <p className="text-red-600 font-black text-xs animate-bounce mt-4 uppercase">👇 Scroll down to the bottom 👇</p>}
          </div>
        )}
      </div>

      <AdBox id="2" />

      <div className="max-w-md w-full px-8 mt-10 space-y-12 text-center text-slate-400">
        <div className="bg-slate-900 p-8 rounded-[2.5rem] font-mono text-[10px] text-green-500 text-left shadow-2xl">
          <p>{`> Connection: SECURE`}</p>
          <p>{`> Protocol: AES-256`}</p>
        </div>

        <AdBox id="3" />

        {showRealButton && (
          <div className="pt-10 pb-20">
            <button onClick={(e) => { e.stopPropagation(); isFinalPage ? handleGetLink() : handleNext(); }} className={`w-full text-white font-black py-8 rounded-[2.5rem] shadow-2xl transition-all text-3xl uppercase ${isFinalPage ? 'bg-green-500' : 'bg-blue-600'}`}>
              {isFinalPage ? 'Get Link 🚀' : 'Next Page →'}
            </button>
          </div>
        )}

        <AdBox id="4" />
      </div>

      <footer className="mt-20 opacity-20 grayscale font-black text-[8px] tracking-[0.5em] text-center px-10 pb-10">
        EXTRALINK v4.2.0-STABLE
      </footer>
    </div>
  );
}