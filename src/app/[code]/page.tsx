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
  const [hasStarted, setHasStarted] = useState(false);
  const [showRealButton, setShowRealButton] = useState(false);
  const [loading, setLoading] = useState(true);

  // 🛑 روابط HilltopAds (السمارت لينك فقط للبوب اب)
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
    if (hasStarted && count > 0 && !document.hidden) {
      interval = setInterval(() => setCount(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [hasStarted, count]);

  const handleStart = () => {
    if (!hasStarted) {
      setHasStarted(true);
      window.open(SMARTLINK, '_blank');
    }
  };

  const handleNext = () => {
    window.open(SMARTLINK, '_blank');
    if (step < linkData.page_count) {
      setStep(prev => prev + 1); setCount(15); setHasStarted(false); setShowRealButton(false);
    } else {
      setIsFinalPage(true); setCount(5); setHasStarted(false); setShowRealButton(false);
    }
    window.scrollTo(0,0);
  };

  const handleGetLink = async () => {
    const ipRes = await fetch('https://api.ipify.org?format=json');
    const { ip } = await ipRes.json();
    await supabase.rpc('record_visit_and_pay', { target_link_id: linkData.id, target_user_id: linkData.user_id, visitor_ip: ip });
    window.open(SMARTLINK, '_blank');
    window.location.href = linkData.original_url;
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading...</div>;

  return (
    <div onClick={handleStart} className="min-h-screen bg-slate-50 flex flex-col items-center font-sans cursor-pointer pb-40">
      
      {/* 1. إعلان Popunder (Hilltop) - حقن آمن */}
      <div dangerouslySetInnerHTML={{ __html: `
        <script>(function(vuyhd){ var d = document, s = d.createElement('script'), l = d.scripts[d.scripts.length - 1]; s.settings = vuyhd || {}; s.src = "\/\/plasticdamage.com\/cmDY9.6qbJ2K5hlCS\/WNQr9gNUjGgz0nOTDdYXwxNRSW0-2FOKDhQP4SNljVA\/5U"; s.async = true; s.referrerPolicy = 'no-referrer-when-downgrade'; l.parentNode.insertBefore(s, l); })({})</script>
      `}} />

      {(!hasStarted) && (
        <div className="fixed inset-0 z-[100] bg-slate-900/90 flex items-center justify-center p-6">
          <div className="bg-white p-10 rounded-[3rem] text-center shadow-2xl border-4 border-blue-500 animate-pulse">
            <span className="text-6xl mb-4 block">👆</span>
            <h2 className="text-2xl font-black text-slate-800 uppercase">Verify Identity</h2>
            <p className="text-slate-500 font-bold">Click anywhere to continue</p>
          </div>
        </div>
      )}

      <header className="w-full bg-white p-6 text-center border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <h1 className="text-2xl font-black text-blue-600 italic tracking-tighter">ExtraLink</h1>
      </header>

      {/* 2. إعلان In-page Push (Hilltop) - حقن آمن */}
      <div dangerouslySetInnerHTML={{ __html: `
        <script>(function(kcqxs){ var d = document, s = d.createElement('script'), l = d.scripts[d.scripts.length - 1]; s.settings = kcqxs || {}; s.src = "\/\/conventionalresponse.com\/beX.VJsdd\/GUlr0\/YdWBcV\/teJmT9\/uoZbUBlLkqP\/ThYG4yNCD\/g_2wMrjhkotyNnjRg\/0LOfDWY\/z\/MgwV"; s.async = true; s.referrerPolicy = 'no-referrer-when-downgrade'; l.parentNode.insertBefore(s, l); })({})</script>
      `}} />

      <div className="bg-white p-10 rounded-[3rem] shadow-2xl max-w-md w-full text-center border border-slate-100 z-10 mx-4 mt-10 relative overflow-hidden">
        <div className="mb-8">
          <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-5 py-2 rounded-full uppercase tracking-widest border border-blue-100">
            {isFinalPage ? 'Final Step' : `Step ${step} of ${linkData.page_count}`}
          </span>
        </div>
        
        <div className="py-10">
          <div className="text-9xl font-black text-slate-800 tabular-nums leading-none tracking-tighter">{count}</div>
          <p className="text-slate-400 font-black mt-6 uppercase text-[10px] tracking-[0.3em]">Security Scan...</p>
        </div>

        {count === 0 && (
          <button onClick={(e) => { e.stopPropagation(); setShowRealButton(true); }} className="w-full bg-blue-600 text-white font-black py-6 rounded-[2rem] text-2xl uppercase shadow-xl active:scale-95">CONTINUE</button>
        )}
      </div>

      {/* 3. بانر HilltopAds المربع 300x250 - حقن آمن */}
      <div className="mt-20 flex flex-col items-center">
        <p className="text-slate-300 text-[7px] font-black uppercase mb-4 tracking-[0.5em]">Sponsored Content</p>
        <div className="rounded-[3rem] overflow-hidden shadow-2xl border-[12px] border-white bg-white min-h-[250px] min-w-[300px]" 
             dangerouslySetInnerHTML={{ __html: `
          <script>(function(iuwr){ var d = document, s = d.createElement('script'), l = d.scripts[d.scripts.length - 1]; s.settings = iuwr || {}; s.src = "\/\/conventionalresponse.com\/bnX.VgsVdLG_l\/0bYUWtcO\/seVm\/9UuxZrU\/lCknPhTRY\/4LNpDcgv2CMrT\/M\/tzNSjmgD0CO\/DQYixbN\/wy"; s.async = true; s.referrerPolicy = 'no-referrer-when-downgrade'; l.parentNode.insertBefore(s, l); })({})</script>
        `}} />
      </div>

      {/* 4. إعلان Video Slider (Hilltop) - حقن آمن */}
      <div dangerouslySetInnerHTML={{ __html: `
        <script>(function(zse){ var d = document, s = d.createElement('script'), l = d.scripts[d.scripts.length - 1]; s.settings = zse || {}; s.src = "\/\/conventionalresponse.com\/b.XiVysXdIGClx0lYuW_cE\/-eJm\/9Eu\/ZfU_lHk\/PzToY\/4ENjDugV2\/NTDmUPtPNljrgg0AOoDqYJ0yOKQN"; s.async = true; s.referrerPolicy = 'no-referrer-when-downgrade'; l.parentNode.insertBefore(s, l); })({})</script>
      `}} />

      {showRealButton && (
        <div className="pt-20 pb-20 px-6 w-full max-w-md">
          <button onClick={(e) => { e.stopPropagation(); isFinalPage ? handleGetLink() : handleNext(); }} className={`w-full text-white font-black py-8 rounded-[2.5rem] shadow-2xl transition-all active:scale-95 text-3xl uppercase ${isFinalPage ? 'bg-green-500' : 'bg-blue-600'}`}>
            {isFinalPage ? 'Get Link Now 🚀' : 'Next Page →'}
          </button>
        </div>
      )}

      <footer className="mt-20 opacity-20 grayscale font-black text-[8px] tracking-[0.5em] text-center px-10 pb-10">
        EXTRALINK SECURE PROTOCOL v4.2.0-STABLE
      </footer>
    </div>
  );
}