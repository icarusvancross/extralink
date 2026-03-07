"use client";
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '../lib/supabase'; 
import AdsterraPage from './AdsterraPage'; // استيراد الغرفة الأولى

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
    // هنا سنضيف لاحقاً منطق الانتقال لـ HilltopPage أو FinalPage
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white font-black animate-pulse">LOADING EXTRALINK...</div>;
  if (isBlocked) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-red-500 font-black p-10 text-center">DAILY LIMIT REACHED! 🛑</div>;

  // حالياً سنعرض فقط AdsterraPage للتجربة
  return (
    <AdsterraPage 
      step={step} 
      totalSteps={linkData.page_count} 
      onNext={handleNextStep} 
    />
  );
}