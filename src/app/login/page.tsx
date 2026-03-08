"use client";
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) alert(error.message);
      else alert("Account created! You can now login.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
      else router.push('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col lg:flex-row font-sans overflow-hidden">
      
      {/* Left Side: Marketing Info */}
      <div className="lg:w-1/2 p-10 flex flex-col justify-center relative overflow-hidden bg-blue-600">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <div className="relative z-10">
          <h1 className="text-5xl font-black italic tracking-tighter mb-6 uppercase">ExtraLink</h1>
          <h2 className="text-3xl font-bold mb-8 leading-tight">The #1 High-CPM <br/>Publisher Network</h2>
          
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <span className="bg-white/20 p-3 rounded-2xl">💰</span>
              <div>
                <p className="font-bold">Highest Rates</p>
                <p className="text-sm text-blue-100">Earn up to $2.40 per 1000 clicks.</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="bg-white/20 p-3 rounded-2xl">⚡</span>
              <div>
                <p className="font-bold">Daily Payments</p>
                <p className="text-sm text-blue-100">Withdraw via Binance or LTC instantly.</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="bg-white/20 p-3 rounded-2xl">🛡️</span>
              <div>
                <p className="font-bold">Anti-Fraud Shield</p>
                <p className="text-sm text-blue-100">Advanced security for your earnings.</p>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-10 border-t border-white/20">
            <p className="text-xs font-bold uppercase tracking-widest opacity-60 italic">Trusted by 1,200+ Publishers Worldwide</p>
          </div>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 bg-slate-950">
        <div className="max-w-md w-full bg-slate-900/50 p-10 rounded-[3rem] border border-slate-800 shadow-2xl">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-bold">{isSignUp ? 'Join the Network' : 'Welcome Back'}</h3>
            <p className="text-slate-500 text-sm mt-2">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            <input 
              type="email" required placeholder="Email Address"
              className="w-full bg-slate-800 border border-slate-700 p-4 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={email} onChange={(e) => setEmail(e.target.value)}
            />
            <input 
              type="password" required placeholder="Password"
              className="w-full bg-slate-800 border border-slate-700 p-4 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={password} onChange={(e) => setPassword(e.target.value)}
            />
            <button 
              type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 py-4 rounded-2xl font-black text-lg transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? 'WAIT...' : (isSignUp ? 'GET STARTED 🚀' : 'LOGIN NOW 🔑')}
            </button>
          </form>

          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="w-full mt-6 text-sm text-slate-500 hover:text-blue-400 transition-all font-medium"
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Join us"}
          </button>
        </div>
      </div>
    </div>
  );
}