"use client";
import { useState, useEffect } from 'react';

export default function FinalPage({ onComplete }: any) {
  const [count, setCount] = useState(5);

  useEffect(() => {
    if (count > 0) {
      const timer = setTimeout(() => setCount(count - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [count]);

  return (
    <div className="min-h-screen bg-emerald-50 flex flex-col items-center justify-center p-4 font-sans">
      <div className="bg-white p-10 rounded-[3rem] shadow-2xl max-w-md w-full text-center border border-emerald-100">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
          <span className="text-4xl">✅</span>
        </div>
        <h1 className="text-3xl font-black text-emerald-700 mb-2 tracking-tighter">Link Ready!</h1>
        <p className="text-slate-400 text-sm mb-8 font-medium">Your secure link is now available.</p>

        {count > 0 ? (
          <div className="py-6">
            <div className="text-7xl font-black text-emerald-500 mb-2">{count}s</div>
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em]">Final Security Check</p>
          </div>
        ) : (
          <button 
            onClick={onComplete}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-6 rounded-[2rem] transition-all transform hover:scale-105 shadow-xl shadow-emerald-200 text-2xl uppercase tracking-tighter"
          >
            GET LINK 🚀
          </button>
        )}
      </div>
    </div>
  );
}