"use client";
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '../lib/supabase'; 
import AdsterraPage from './AdsterraPage';
import HilltopPage from './HilltopPage';
import FinalPage from './FinalPage';

export default function MainManager() {
  const { code } = useParams();
  const [linkData, setLinkData] = useState<any>(null);
  const [step, setStep] = useState(1);
  const [isFinal, setIsFinal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const ipRes = await fetch('https://api.ipify.org?format=json');
        const { ip } = await ipRes.json();
        const { data: blocked } = await supabase.rpc('check_ip_limit', { visitor_ip: ip });
        if (blocked) { setIsBlocked(true); setLoading(false); return; }

        const { data } = await supabase.from('links').select('*').eq('short_code', code).single();
        if (!data) window.location.href = "/";
        else { setLinkData(data); setLoading(false); }
      } catch (e) { setLoading(false); }
    };
    init();
  }, [code]);

  const handleNextStep = () => {
    // إصلاح منطق العداد: إذا كانت الخطوة الحالية هي الأخيرة، اذهب لـ Final
    if (step >= linkData.page_count) {
      setIsFinal(true);
    } else {
      setStep(prev => prev + 1);
    }
  };

  const handleFinalComplete = async () => {
    const ipRes = await fetch('https://api.ipify.org?format=json');
    const { ip } = await ipRes.json();
    await supabase.rpc('record_visit_and_pay', { target_link_id: linkData.id, target_user_id: linkData.user_id, visitor_ip: ip });
    window.open("https://www.effectivegatecpm.com/rcbjyg6w?key=4b7c5edb9470ea073ea974701e4201aa", '_blank');
    window.location.href = linkData.original_url;
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-blue-500 font-black animate-pulse">INITIALIZING...</div>;
  if (isBlocked) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-red-500 font-black p-10 text-center uppercase">Daily Limit Reached! 🛑</div>;

  if (isFinal) return <FinalPage onComplete={handleFinalComplete} />;

  if (step % 2 !== 0) {
    return <AdsterraPage key={`adsterra-${step}`} step={step} totalSteps={linkData.page_count} onNext={handleNextStep} />;
  } else {
    return <HilltopPage key={`hilltop-${step}`} step={step} totalSteps={linkData.page_count} onNext={handleNextStep} />;
  }
}