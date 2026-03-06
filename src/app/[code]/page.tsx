"use client";
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '../lib/supabase'; 

export default function WaitingPage() {
  const { code } = useParams();
  const [linkData, setLinkData] = useState<any>(null);
  const [step, setStep] = useState(1);
  const [isFinalPage, setIsFinalPage] = useState(false);
  const [count, setCount] = useState(15);
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);
  const [adBlockEnabled, setAdBlockEnabled] = useState(false); // كاشف الـ AdBlock
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. فحص الـ AdBlock والـ VPN والبيانات
  useEffect(() => {
    const initPage = async () => {
      // فحص AdBlock بسيط
      const testAd = document.createElement('div');
      testAd.innerHTML = '&nbsp;';
      testAd.className = 'adsbox';
      document.body.appendChild(testAd);
      if (testAd.offsetHeight === 0) setAdBlockEnabled(true);
      testAd.remove();

      try {
        const ipRes = await fetch('https://api.ipify.org?format=json');
        const { ip } = await ipRes.json();

        // فحص الـ VPN (بسيط عبر فحص الـ Timezone أو الـ IP)
        // ملاحظة: للفحص المتقدم نحتاج API مدفوع، لكن حالياً سنعتمد على حماية الـ IP من Supabase
        const { data: blocked } = await supabase.rpc('check_ip_limit', { visitor_ip: ip });
        if (blocked) {
          setIsBlocked(true);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.from('links').select('*').eq('short_code', code).single();
        if (error || !data) { window.location.href = "/"; } 
        else { setLinkData(data); setLoading(false); }
      } catch (err) { setLoading(false); }
    };
    initPage();
  }, [code]);

  useEffect(() => {
    if (!loading && !isBlocked && !adBlockEnabled && linkData && count > 0 && !isPaused && !document.hidden) {
      timerRef.current = setTimeout(() => setCount(prev => prev - 1), 1000);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [count, isPaused, loading, isBlocked, adBlockEnabled, linkData]);

  const handleNext = () => {
    const adUrl = step % 2 !== 0 ? 'https://www.adsterra.com' : 'https://www.hilltopads.com';
    window.open(adUrl, '_blank');
    setIsPaused(true);
    if (step < linkData.page_count) { setStep(prev => prev + 1); setCount(15); } 
    else { setIsFinalPage(true); setCount(5); }
  };

  const handleGetLink = async () => {
    const ipRes = await fetch('https://api.ipify.org?format=json');
    const { ip } = await ipRes.json();
    await supabase.rpc('record_visit_and_pay', { 
      target_link_id: linkData.id, 
      target_user_id: linkData.user_id, 
      visitor_ip: ip 
    });
    window.open('https://www.popads.net', '_blank');
    window.location.href = linkData.original_url;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-black animate-pulse">LOADING...</div>;

  // واجهة منع الـ AdBlock
  if (adBlockEnabled) return (
    <div className="min-h-screen bg-red-600 flex flex-col items-center justify-center p-6 text-center text-white">
      <span className="text-6xl mb-6">🛡️</span>
      <h1 className="text-3xl font-black mb-4">AdBlock Detected!</h1>
      <p className="max-w-md font-bold">Please disable your AdBlocker to access the link. Our service is free because of these ads.</p>
      <button onClick={() => window.location.reload()} className="mt-8 bg-white text-red-600 px-8 py-3 rounded-full font-black">I DISABLED IT, RELOAD 🔄</button>
    </div>
  );

  if (isBlocked) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      <span className="text-6xl mb-6">🛑</span>
      <h1 className="text-3xl font-black text-red-500 mb-4 uppercase">Daily Limit Reached</h1>
      <p className="text-slate-400 max-w-md">You can only access 3 links every 24 hours. Come back later!</p>
    </div>
  );

  const ResumeOverlay = () => (
    <div onClick={() => setIsPaused(false)} className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center cursor-pointer">
      <div className="bg-white p-8 rounded-3xl text-center shadow-2xl animate-bounce">
        <span className="text-4xl mb-4 block">👆</span>
        <h2 className="text-xl font-black text-slate-800">Timer Paused</h2>
        <p className="text-slate-500 text-sm">Click anywhere to resume</p>
      </div>
    </div>
  );

  if (isFinalPage) {
    return (
      <div onClick={() => setIsPaused(false)} className="min-h-screen bg-emerald-50 flex flex-col items-center justify-center p-4 relative">
        {isPaused && <ResumeOverlay />}
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl max-w-md w-full text-center border border-emerald-100">
          <h1 className="text-2xl font-black text-emerald-700 mb-6">Ready! ✅</h1>
          {count > 0 ? <div className="text-6xl font-black text-emerald-500 mb-4">{count}s</div> : 
          <button onClick={handleGetLink} className="w-full bg-emerald-500 text-white font-black py-5 rounded-2xl shadow-lg">GET LINK 🚀</button>}
        </div>
      </div>
    );
  }

  return (
    <div onClick={() => setIsPaused(false)} className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative">
      {isPaused && <ResumeOverlay />}
      <div className="bg-white p-8 rounded-[2rem] shadow-xl max-w-md w-full text-center border border-slate-100">
        <h1 className="text-3xl font-black text-blue-600 mb-8 italic tracking-tighter">ExtraLink</h1>
        <div className="mb-6">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Step {step} of {linkData.page_count}</span>
        </div>
        {count > 0 ? <div className="text-7xl font-black text-slate-800 mb-4">{count}s</div> : 
        <button onClick={handleNext} className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl">NEXT PAGE →</button>}
      </div>
    </div>
  );
}