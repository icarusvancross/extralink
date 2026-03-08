"use client";
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '../lib/supabase'; 

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

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsMounted(true);
    const fetchLink = async () => {
      try {
        const { data } = await supabase.from('links').select('*').eq('short_code', code).single();
        if (!data) window.location.href = "/";
        else { setLinkData(data); setLoading(false); }
      } catch (e) { setLoading(false); }
    };
    fetchLink();
  }, [code]);

  // منطق العداد الصارم
  useEffect(() => {
    if (isMounted && hasStarted && !isPaused && !document.hidden && count > 0) {
      timerRef.current = setInterval(() => {
        setCount(prev => prev - 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isMounted, hasStarted, isPaused, count]);

  // مراقبة الخروج والعودة (تنبيه الزائر للاستئناف)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) setIsPaused(true);
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  if (!isMounted) return null;

  const handleStart = () => {
    setHasStarted(true);
    setIsPaused(false);
  };

  const handleNext = () => {
    if (step < linkData?.page_count) {
      setStep(prev => prev + 1);
      setCount(15);
      setHasStarted(false); // يطلب ضغطة لبدء الصفحة التالية
      setShowRealButton(false);
    } else {
      setIsFinalPage(true);
      setCount(5);
      setHasStarted(false);
      setShowRealButton(false);
    }
    window.scrollTo(0, 0);
  };

  const handleGetLink = async () => {
    try {
      const ipRes = await fetch('https://api.ipify.org?format=json');
      const { ip } = await ipRes.json();
      await supabase.rpc('record_visit_and_pay', { 
        target_link_id: linkData.id, 
        target_user_id: linkData.user_id, 
        visitor_ip: ip 
      });
      window.location.href = linkData.original_url;
    } catch (e) { window.location.href = linkData?.original_url; }
  };

  // مكون الإعلان الوحيد (البانر المربع)
  const AdBox = ({ id }: { id: string }) => (
    <div className="my-8 flex flex-col items-center justify-center w-full">
      <div className="rounded-[2.5rem] overflow-hidden shadow-xl border-4 border-white bg-slate-100 min-h-[250px] min-w-[300px]">
        <iframe 
          src={`/ads/test-banner.html?v=${id}`} 
          width="300" height="250" scrolling="no" frameBorder="0"
          sandbox="allow-scripts allow-same-origin"
        ></iframe>
      </div>
    </div>
  );

  if (loading || !linkData) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-blue-500 font-bold animate-pulse uppercase tracking-widest">ExtraLink | Secure Protocol...</div>;

  return (
    <div onClick={handleStart} className="min-h-screen bg-slate-50 flex flex-col items-center font-sans cursor-pointer pb-60 relative">
      
      {/* واجهة "اضغط للبدء" أو "استئناف" */}
      {(!hasStarted || isPaused) && (
        <div className="fixed inset-0 z-[100] bg-slate-900/90 flex items-center justify-center p-6 backdrop-blur-sm">
          <div className="bg-white p-12 rounded-[3.5rem] text-center shadow-2xl border-8 border-blue-500 animate-pulse max-w-xs w-full">
            <span className="text-7xl mb-6 block">👆</span>
            <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">
              {!hasStarted ? "START" : "RESUME"}
            </h2>
            <p className="text-slate-500 font-bold mt-2">Click to continue the countdown</p>
          </div>
        </div>
      )}

      <header className="w-full bg-white p-6 text-center border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <h1 className="text-2xl font-black text-blue-600 italic">ExtraLink</h1>
      </header>

      {/* إعلان علوي */}
      <AdBox id="top" />

      {/* كارت العداد */}
      <div className="bg-white p-10 rounded-[3rem] shadow-2xl max-w-md w-full text-center border border-slate-100 z-10 mx-4 mt-10 relative overflow-hidden">
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
            <button 
              onClick={(e) => { e.stopPropagation(); setShowRealButton(true); }} 
              className="w-full bg-blue-600 text-white font-black py-7 rounded-[2rem] text-2xl uppercase shadow-xl transition-all hover:scale-105 active:scale-95"
            >
              CONTINUE
            </button>
            {showRealButton && (
              <p className="text-red-600 font-black text-xs animate-bounce mt-6 uppercase tracking-tighter">
                👇 Scroll down to find the button 👇
              </p>
            )}
          </div>
        )}
      </div>

      {/* إعلان منتصف */}
      <AdBox id="middle" />

      {/* نصوص عادية لتطويل الصفحة (بدون كلام أخضر) */}
      <div className="max-w-md w-full px-8 mt-10 space-y-10 text-center">
        <div className="space-y-4">
          <h3 className="font-black text-slate-800 uppercase text-sm tracking-widest">About this Service</h3>
          <p className="text-xs text-slate-400 leading-relaxed font-medium">
            ExtraLink is a global secure cloud network. We ensure that every link shared on our platform is scanned for potential threats. Please stay on this page until the verification process is complete.
          </p>
        </div>

        {/* إعلان قبل الزر */}
        <AdBox id="pre-button" />

        {showRealButton && (
          <div className="pt-10 pb-20">
            <button 
              onClick={(e) => { e.stopPropagation(); isFinalPage ? handleGetLink() : handleNext(); }} 
              className={`w-full text-white font-black py-8 rounded-[2.5rem] shadow-2xl transition-all text-3xl uppercase tracking-tighter ${isFinalPage ? 'bg-green-500 shadow-green-200' : 'bg-blue-600 shadow-blue-200'}`}
            >
              {isFinalPage ? 'Get Link 🚀' : 'Next Page →'}
            </button>
          </div>
        )}

        {/* إعلان القاع */}
        <AdBox id="bottom" />
      </div>

      <footer className="mt-20 opacity-20 grayscale font-black text-[8px] tracking-[0.5em] text-center px-10 pb-10 uppercase">
        ExtraLink Protocol v4.2.0 - Secure Encryption
      </footer>
    </div>
  );
}