"use client";
import { useState, useEffect, memo } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '../lib/supabase'; 
import Script from 'next/script';

// 1. عزل مكون الإعلان خارج المكون الرئيسي لضمان عدم التحديث المستمر
const AdSlot = memo(({ id }: { id: string }) => {
  return (
    <div className="my-10 flex flex-col items-center justify-center w-full min-h-[280px]">
      <p className="text-[7px] text-slate-300 font-black uppercase mb-2 tracking-[0.5em]">Advertisement</p>
      <div className="rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white bg-white min-h-[250px] min-w-[300px] flex items-center justify-center">
        <iframe 
          src="/ad300.html" 
          width="300" 
          height="250" 
          frameBorder="0" 
          scrolling="no" 
          title={`ad-${id}`}
        ></iframe>
      </div>
    </div>
  );
});

AdSlot.displayName = "AdSlot";

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
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const initData = async () => {
      try {
        const ipRes = await fetch('https://api.ipify.org?format=json');
        const { ip } = await ipRes.json();
        const { data: blocked } = await supabase.rpc('check_ip_limit', { visitor_ip: ip });
        if (blocked) setIsBlocked(true);

        const { data } = await supabase.from('links').select('*').eq('short_code', code).single();
        if (!data) window.location.href = "/";
        else { setLinkData(data); setLoading(false); }
      } catch (e) { setLoading(false); }
    };
    initData();
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

  if (!isMounted || loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-blue-500 font-bold animate-pulse uppercase tracking-[0.3em]">Secure Connection...</div>;
  if (isBlocked) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-red-500 p-10 text-center font-black">DAILY LIMIT REACHED! 🛑</div>;

  const handleStart = () => {
    setHasStarted(true);
    setIsPaused(false);
  };

  const handleNextStep = async () => {
    if (isFinalPage) {
      const ipRes = await fetch('https://api.ipify.org?format=json');
      const { ip } = await ipRes.json();
      await supabase.rpc('record_visit_and_pay', { target_link_id: linkData.id, target_user_id: linkData.user_id, visitor_ip: ip });
      window.location.href = linkData.original_url;
    } else {
      if (step < linkData.page_count) {
        setStep(prev => prev + 1); setCount(15); setHasStarted(false); setShowRealButton(false);
        window.scrollTo(0, 0);
      } else {
        setIsFinalPage(true); setCount(5); setHasStarted(false); setShowRealButton(false);
        window.scrollTo(0, 0);
      }
    }
  };

  return (
    <div onClick={handleStart} className="min-h-screen bg-slate-50 flex flex-col items-center font-sans cursor-pointer pb-80 relative overflow-x-hidden">
      
      {(!hasStarted || isPaused) && (
        <div className="fixed inset-0 z-[100] bg-slate-900/95 flex items-center justify-center p-6 backdrop-blur-xl">
          <div className="bg-white p-12 rounded-[3.5rem] text-center shadow-2xl border-8 border-blue-500 max-w-xs w-full text-slate-900 animate-pulse">
            <span className="text-7xl mb-6 block">👆</span>
            <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">Verify</h2>
            <p className="font-bold text-sm text-slate-500 italic">Click anywhere to continue</p>
          </div>
        </div>
      )}

      <header className="w-full bg-white p-6 text-center border-b border-slate-200 sticky top-0 z-40 shadow-sm font-black text-blue-600 italic text-2xl tracking-tighter">
        ExtraLink
      </header>

      {/* 1. إعلان القمة - يظهر فوراً */}
      <AdSlot id="top" />

      {/* كارت العداد */}
      <div className="bg-white p-10 rounded-[3rem] shadow-2xl max-w-md w-full text-center border border-slate-100 z-10 mx-4 mt-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-slate-100">
          <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${(count/15)*100}%` }}></div>
        </div>
        <div className="mb-8">
          <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-6 py-2 rounded-full uppercase border border-blue-100 italic">
            {isFinalPage ? 'Final Step' : `Step ${step} of ${linkData.page_count}`}
          </span>
        </div>
        <div className="py-10 text-9xl font-black text-slate-800 tabular-nums leading-none tracking-tighter">{count}</div>
        
        {count === 0 && (
          <div className="py-6 space-y-4">
            <button 
              onClick={(e) => { e.stopPropagation(); setShowRealButton(true); }}
              className="w-full bg-blue-600 text-white font-black py-7 rounded-[2rem] text-2xl uppercase shadow-xl transition-all active:scale-95"
            >
              CONTINUE
            </button>
            {showRealButton && (
              <p className="text-red-600 font-black text-xs animate-bounce uppercase tracking-widest pt-2">
                👇 Scroll to the bottom to find the button 👇
              </p>
            )}
          </div>
        )}
      </div>

      {/* 2. إعلان تحت العداد - يظهر فوراً */}
      <AdSlot id="below-card" />

      {/* محتوى الصفحة الطويل جداً */}
      <div className="max-w-md w-full px-8 mt-20 space-y-24 text-center text-slate-400">
        
        <div className="space-y-4">
          <h3 className="font-black text-slate-800 uppercase text-xs tracking-[0.3em]">Cloud Security Protection</h3>
          <p className="text-[11px] leading-relaxed font-medium italic">"ExtraLink uses advanced AES-256 cloud encryption to verify and protect every link generated on our secure platform."</p>
        </div>

        {/* 3. إعلان منتصف الصفحة - يظهر فوراً */}
        <AdSlot id="middle" />

        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between px-10 text-slate-900">
            <div className="text-left"><p className="text-slate-400 text-[8px] font-black uppercase mb-1">Status</p><p className="text-green-500 font-black text-xl italic uppercase">Verified</p></div>
            <span className="text-3xl">✓</span>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between px-10 text-slate-900">
            <div className="text-left"><p className="text-slate-400 text-[8px] font-black uppercase mb-1">Network</p><p className="text-blue-500 font-black text-xl italic uppercase">Encrypted</p></div>
            <span className="text-3xl">🔒</span>
          </div>
        </div>

        {/* 4. إعلان قبل الزر الحقيقي - يظهر فوراً */}
        <AdSlot id="above-button" />

        {/* الزر الحقيقي (يظهر في القاع بعد ضغط Continue) */}
        {showRealButton && (
          <div className="pt-10 animate-fadeIn">
            <button 
              onClick={(e) => { e.stopPropagation(); handleNextStep(); }} 
              className={`w-full text-white font-black py-9 rounded-[2.5rem] shadow-2xl transition-all active:scale-95 text-3xl uppercase tracking-tighter ${isFinalPage ? 'bg-emerald-500 shadow-emerald-200' : 'bg-blue-600 shadow-blue-200'}`}
            >
              {isFinalPage ? 'Get Link 🚀' : 'Next Page →'}
            </button>
          </div>
        )}

        {/* 5. إعلان القاع الأخير - يظهر فوراً */}
        <AdSlot id="bottom" />
      </div>

      <footer className="mt-40 opacity-20 grayscale font-black text-[7px] tracking-[0.6em] text-center px-10 pb-10 uppercase">
        ExtraLink Secure Protocol v4.2.1-STABLE
      </footer>
    </div>
  );
}