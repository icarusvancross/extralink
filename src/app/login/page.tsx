"use client";
import { useState } from 'react';
import { supabase } from '../lib/supabase'; // تأكد من صحة المسار حسب مكان مجلد lib عندك
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
      // عملية تسجيل حساب جديد
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) alert(error.message);
      else alert("Account created! You can now login.");
    } else {
      // عملية تسجيل الدخول
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
      else {
        router.push('/'); // سنغيرها لاحقاً إلى /dashboard
        router.refresh();
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-slate-800 p-10 rounded-[2.5rem] shadow-2xl border border-slate-700">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-blue-500 italic tracking-tighter mb-2">ExtraLink</h1>
          <p className="text-slate-400 font-medium">
            {isSignUp ? 'Create your publisher account' : 'Login to your dashboard'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-2">Email Address</label>
            <input 
              type="email" 
              required
              placeholder="name@example.com"
              className="w-full bg-slate-900 border border-slate-700 p-4 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-2">Password</label>
            <input 
              type="password" 
              required
              placeholder="••••••••"
              className="w-full bg-slate-900 border border-slate-700 p-4 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 py-4 rounded-2xl font-black text-lg shadow-xl shadow-blue-900/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Processing...' : (isSignUp ? 'SIGN UP 🚀' : 'LOGIN 🔑')}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-slate-400 hover:text-blue-400 transition-colors"
          >
            {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
      
      <p className="mt-8 text-slate-600 text-xs font-bold uppercase tracking-widest">Secure Encryption Enabled</p>
    </div>
  );
}