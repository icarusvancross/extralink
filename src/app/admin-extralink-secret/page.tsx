"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase'; 
import { useRouter } from 'next/navigation';

export default function AdminPanel() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [inputKey, setInputKey] = useState('');
  const [isKeyCorrect, setIsKeyCorrect] = useState(false);
  const router = useRouter();

  // 🛑 إعدادات الأمان (غيرها كما تحب)
  const ADMIN_EMAIL = "xaldd99@gmail.com"; 
  const ADMIN_SECRET_KEY = "123456"; 

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
          router.push('/');
          return;
        }
        setIsAdmin(true);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    checkAdmin();
  }, [router]);

  const fetchRequests = async () => {
    const { data } = await supabase
      .from('withdrawals')
      .select('*, profiles(username)')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });
    setRequests(data || []);
  };

  const handleVerifyKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputKey === ADMIN_SECRET_KEY) {
      setIsKeyCorrect(true);
      fetchRequests();
    } else {
      alert("Wrong Key!");
      setInputKey('');
    }
  };

  const handleComplete = async (id: string, userId: string, amount: number) => {
    if (!confirm(`Confirm payment of $${amount}?`)) return;

    const { data: profile } = await supabase.from('profiles').select('balance, total_withdrawn').eq('id', userId).single();
    if (!profile) return alert("Profile not found!");

    await supabase.from('withdrawals').update({ status: 'completed' }).eq('id', id);
    await supabase.from('profiles').update({
      balance: Number(profile.balance) - Number(amount),
      total_withdrawn: Number(profile.total_withdrawn) + Number(amount)
    }).eq('id', userId);

    alert("Paid Successfully! ✅");
    fetchRequests();
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white font-bold animate-pulse">VERIFYING...</div>;

  if (isAdmin && !isKeyCorrect) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <form onSubmit={handleVerifyKey} className="max-w-md w-full bg-slate-900 p-10 rounded-[2rem] border border-slate-800 text-center shadow-2xl">
          <h1 className="text-white font-black mb-6 uppercase tracking-widest">Admin Key</h1>
          <input type="password" className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl text-center text-white mb-4 outline-none focus:ring-2 focus:ring-red-500" value={inputKey} onChange={(e) => setInputKey(e.target.value)} autoFocus />
          <button type="submit" className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-all">UNLOCK TERMINAL</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-10 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-10 border-b border-slate-800 pb-8">
          <h1 className="text-3xl font-black text-red-500 uppercase tracking-tighter italic">Admin Terminal 🚨</h1>
          <p className="text-sm font-bold text-blue-400">{ADMIN_EMAIL}</p>
        </div>

        <div className="space-y-6">
          {requests.length === 0 ? <p className="text-slate-500 text-center py-20">No pending requests. ☕</p> : 
            requests.map((r) => (
              <div key={r.id} className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl">
                <div>
                  <p className="text-blue-400 font-black text-xs mb-2 uppercase">User: {r.profiles?.username}</p>
                  <p className="text-5xl font-black text-white mb-1">${r.amount}</p>
                  
                  {r.method.includes("LTC") ? (
                    <p className="text-orange-500 font-bold text-sm mb-3">SEND NET: ${(Number(r.amount) * 0.99).toFixed(2)} <span className="text-[10px]">(1% Fee)</span></p>
                  ) : (
                    <p className="text-green-500 font-bold text-sm mb-3">SEND FULL: ${r.amount} (No Fees)</p>
                  )}

                  <div className="flex gap-3">
                    <span className="bg-slate-950 px-3 py-1 rounded-lg text-[10px] font-black text-slate-400 border border-slate-800 uppercase">{r.method}</span>
                    <span className="bg-slate-950 px-3 py-1 rounded-lg text-[10px] font-black text-blue-500 border border-slate-800">{r.address}</span>
                  </div>
                </div>
                <button onClick={() => handleComplete(r.id, r.user_id, r.amount)} className="w-full md:w-auto bg-green-600 hover:bg-green-500 text-white px-12 py-6 rounded-3xl font-black text-sm shadow-xl transition-all active:scale-95">MARK AS PAID ✅</button>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}