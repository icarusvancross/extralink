"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from './lib/supabase';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        router.push('/dashboard'); // إذا مسجل دخول، طيران للداشبورد
      } else {
        router.push('/login'); // إذا مش مسجل، يروح يسجل دخول
      }
    };
    checkUser();
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-blue-500 font-black animate-pulse tracking-widest">
        REDIRECTING TO EXTRALINK...
      </div>
    </div>
  );
}