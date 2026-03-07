"use client";
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '../lib/supabase'; 
import AdsterraPage from './AdsterraPage';

export default function MainManager() {
  const { code } = useParams();
  const [linkData, setLinkData] = useState<any>(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    const init = async () => {
      const ipRes = await fetch('https://api.ipify.org?format=json');
      const { ip } = await ipRes.json();
      const { data: blocked } = await supabase.rpc('check_ip_limit', { visitor_ip: ip });
      if (blocked) { setIsBlocked(true); setLoading(false); return; }

      const { data } = await supabase.from('links').select('*').eq('short_code', code).single();
      if (!data) window.location.href = "/";
      else { setLinkData(data); setLoading(false); }
    };
    init();
  }, [code]);

  const handleNextStep = () => {
    setStep(prev => prev + 1);
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-blue-500 font-black animate-pulse">INITIALIZING...</div>;
  if (isBlocked) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-red-500 font-black p-10 text-center uppercase">Daily Limit Reached! 🛑</div>;

  // حالياً سنعرض AdsterraPage للتجربة، وسنضيف HilltopAds في الخطوة القادمة
  return (
    <AdsterraPage 
      key={`step-${step}`} // هذا السطر مهم جداً لإعادة تحميل الإعلانات
      step={step} 
      totalSteps={linkData.page_count} 
      onNext={handleNextStep} 
    />
  );
}