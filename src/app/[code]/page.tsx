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

  // 1. جلب بيانات الرابط من قاعدة البيانات
  useEffect(() => {
    const fetchLink = async () => {
      try {
        const { data, error } = await supabase
          .from('links')
          .select('*')
          .eq('short_code', code)
          .single();

        if (error || !data) {
          window.location.href = "/";
        } else {
          setLinkData(data);
          setLoading(false);
        }
      } catch (err) {
        setLoading(false);
      }
    };
    fetchLink();
  }, [code]);

  // 2. نظام العداد الصارم (يتوقف عند الخروج)
  useEffect(() => {
    let interval: any;
    if (hasStarted && !isPaused && !document.hidden && count > 0) {
      interval = setInterval(() => {
        setCount((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [hasStarted, isPaused, count]);

  // 3. مستشعر العودة للموقع (Focus)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) setIsPaused(true);
      else setIsPaused(false);
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  const handleStart = () => {
    setHasStarted(true);
    setIsPaused(false);
  };

  const handleNext = () => {
    if (step < linkData.page_count) {
      setStep(prev => prev + 1);
      setCount(15);
      setHasStarted(false);
      setShowRealButton(false);
      window.scrollTo(0, 0);
    } else {
      setIsFinalPage(true);
      setCount(5);
      setHasStarted(false);
      setShowRealButton(false);
      window.scrollTo(0, 0);
    }
  };

  const handleGetLink = async () => {
    const ipRes = await fetch('https://api.ipify.org?format=json');
    const { ip } = await ipRes.json();
    
    // تسجيل الزيارة ودفع المال للمستثمر (المحرك المالي)
    await supabase.rpc('record_visit_and_pay', { 
      target_link_id: linkData.id, 
      target_user_id: linkData.user_id, 
      visitor_ip: ip 
    });

    window.location.href = linkData.original_url;
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-blue-500 font-black animate-pulse uppercase tracking-widest">
      ExtraLink | Checking Security...
    </div>
  );

  // --- واجهة الصفحة النهائية (الخضراء) ---
  if (isFinalPage) {
    return (
      <div onClick={handleStart} className="min-h-screen bg-emerald-50 flex flex-col items-center justify-center p-6 relative cursor-pointer">
        {!hasStarted && (
          <div className="fixed inset-0 z-[100] bg-slate-900/90 flex items-center justify-center p-6 backdrop-blur-sm">
            <div className="bg-white p-12 rounded-[3.5rem] text-center shadow-2xl border-8 border-emerald-500 animate-pulse">
              <span className="text-7xl mb-4 block">👆</span>
              <h2 className="text-3xl font-black text-slate-800 uppercase">Final Step</h2>
              <p className="text-slate-500 font-bold">Click to generate final link</p>
            </div>
          </div>
        )}
        <div className="bg-white p-12 rounded-[3rem] shadow-2xl max-w-md w-full text-center border border-emerald-100">
          <h1 className="text-3xl font-black text-emerald-700 mb-6 uppercase italic">Ready! ✅</h1>
          {count > 0 ? (
            <div className="text-9xl font-black text-emerald-500 tabular-nums tracking-tighter">{count}</div>
          ) : (
            <button onClick={handleGetLink} className="w-full bg-emerald-500 text-white font-black py-8 rounded-[2rem] text-2xl shadow-xl active:scale-95 transition-all">
              GET LINK 🚀
            </button>
          )}
        </div>
      </div>
    );
  }

  // --- واجهة صفحات الانتظار (الزرقاء) ---
  return (
    <div onClick={handleStart} className="min-h-screen bg-slate-50 flex flex-col items-center relative font-sans overflow-x-hidden cursor-pointer pb-60">
      
      {(!hasStarted || isPaused) && (
        <div className="fixed inset-0 z-[100] bg-slate-900/95 flex items-center justify-center p-6 backdrop-blur-xl">
          <div className="bg-white p-12 rounded-[3.5rem] text-center shadow-2xl border-8 border-blue-600 max-w-xs w-full animate-pulse">
            <span className="text-7xl mb-6 block">👆</span>
            <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">Verify</h2>
            <p className="text-slate-500 font-bold text-sm">Click anywhere to continue</p>
          </div>
        </div>
      )}

      <header className="w-full bg-white p-6 text-center border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <h1 className="text-2xl font-black text-blue-600 italic tracking-tighter">ExtraLink</h1>
      </header>

      {/* مساحة وهمية مكان الإعلان العلوي */}
      <div className="w-full max-w-md h-32 bg-slate-100 mt-8 rounded-3xl border-2 border-dashed border-slate-200 mx-4 flex items-center justify-center">
        <p className="text-slate-300 font-bold uppercase text-[10px] tracking-widest">Clean Mode: No Ads</p>
      </div>

      <div className="bg-white p-10 rounded-[3rem] shadow-2xl max-w-md w-full text-center border border-slate-100 z-10 mx-4 mt-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-slate-100">
          <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${(count/15)*100}%` }}></div>
        </div>
        <div className="mb-8">
          <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-5 py-2 rounded-full uppercase tracking-widest border border-blue-100">
            Step {step} of {linkData.page_count}
          </span>
        </div>
        
        {count > 0 ? (
          <div className="py-10">
            <div className="text-9xl font-black text-slate-800 tabular-nums leading-none tracking-tighter">{count}</div>
            <p className="text-slate-400 font-black mt-6 uppercase text-[10px] tracking-[0.3em] animate-pulse">Security Check...</p>
          </div>
        ) : (
          <div className="py-10 space-y-4">
            <button 
              onClick={(e) => { e.stopPropagation(); setShowRealButton(true); }}
              className="w-full bg-blue-600 text-white font-black py-7 rounded-[2rem] text-2xl uppercase shadow-xl active:scale-95 transition-all"
            >
              CONTINUE
            </button>
            {showRealButton && (
              <p className="text-red-600 font-black text-xs animate-bounce uppercase tracking-widest">
                👇 Scroll down to find the Next Page button 👇
              </p>
            )}
          </div>
        )}
      </div>

      {/* محتوى وهمي طويل جداً لضمان السكرول */}
      <div className="max-w-md w-full px-8 mt-20 space-y-20 text-center">
        <div className="space-y-4">
          <h3 className="font-black text-slate-800 uppercase text-sm tracking-widest">Cloud Encryption Active</h3>
          <p className="text-xs text-slate-400 leading-relaxed font-medium">ExtraLink protocol v4.2 ensures your destination link is safe from malicious bots.</p>
        </div>

        <div className="bg-slate-900 p-8 rounded-[2.5rem] font-mono text-[10px] text-green-500 text-left space-y-3 shadow-2xl">
          <p>{`> Initializing secure handshake... OK`}</p>
          <p>{`> Verifying connection: SECURE`}</p>
        </div>

        {/* مساحة وهمية مكان الإعلان السفلي */}
        <div className="w-full h-60 bg-slate-100 rounded-3xl border-2 border-dashed border-slate-200 flex items-center justify-center">
          <p className="text-slate-300 font-bold uppercase text-[10px] tracking-widest text-center">Ad Area Protected <br/>(Clean Session)</p>
        </div>

        {/* الزر الحقيقي يظهر فقط في الأسفل بعد الضغط على Continue */}
        {showRealButton && (
          <div className="pt-10 pb-20 animate-fadeIn">
            <button 
              onClick={(e) => { e.stopPropagation(); handleNext(); }} 
              className="w-full bg-blue-600 text-white font-black py-8 rounded-[2.5rem] shadow-2xl transition-all active:scale-95 text-3xl uppercase tracking-tighter"
            >
              Next Page →
            </button>
          </div>
        )}
      </div>

      <footer className="mt-20 opacity-20 grayscale font-black text-[8px] tracking-[0.5em] text-center px-10 pb-10 uppercase">
        ExtraLink Secure Protocol - Clean Edition
      </footer>
    </div>
  );
}