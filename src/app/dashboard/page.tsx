"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [linkTitle, setLinkTitle] = useState('');
  const [url, setUrl] = useState('');
  const [pages, setPages] = useState(3);
  const [shortLink, setShortLink] = useState('');
  const [myLinks, setMyLinks] = useState<any[]>([]);
  const [myWithdrawals, setMyWithdrawals] = useState<any[]>([]);
  const [globalWithdrawals, setGlobalWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [wAmount, setWAmount] = useState('');
  const [wMethod, setWMethod] = useState('Binance (USDT TRC20)');
  const [wAddress, setWAddress] = useState('');
  const [wError, setWError] = useState('');
  const router = useRouter();

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push('/login');
    setUser(user);

    const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    setProfile(prof);

    const { data: links } = await supabase.from('links').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20);
    setMyLinks(links || []);

    const { data: myW } = await supabase.from('withdrawals').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20);
    setMyWithdrawals(myW || []);

    const { data: globW } = await supabase.from('withdrawals').select('*').eq('status', 'completed').order('created_at', { ascending: false }).limit(20);
    setGlobalWithdrawals(globW || []);

    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [router]);

  const handleShorten = async () => {
    if (!url || !linkTitle) return alert("Please enter Link Name and URL");
    const code = Math.random().toString(36).substring(2, 8);
    const { error } = await supabase.from('links').insert([{ title: linkTitle, original_url: url, short_code: code, page_count: pages, user_id: user.id }]);
    if (error) alert(error.message);
    else {
      setShortLink(`${window.location.origin}/${code}`);
      setLinkTitle(''); setUrl(''); fetchData();
    }
  };

  const handleWithdrawRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setWError('');
    const amount = parseFloat(wAmount);
    if (amount < 5) return setWError("Minimum withdrawal is $5");
    if (amount > (profile?.balance || 0)) return setWError("Insufficient balance!");

    const { error } = await supabase.from('withdrawals').insert([{ 
      user_id: user.id, 
      amount, 
      method: wMethod, 
      address: wAddress, 
      status: 'pending' 
    }]);

    if (!error) { 
      alert("Withdrawal request sent! 🚀"); 
      setWAmount(''); setWAddress(''); 
      fetchData(); 
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-blue-500 font-black animate-pulse tracking-widest uppercase">ExtraLink Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-black text-blue-500 italic tracking-tighter">ExtraLink</h1>
          <button onClick={() => supabase.auth.signOut().then(() => router.push('/login'))} className="text-xs bg-red-500/10 text-red-500 px-4 py-2 rounded-xl font-bold border border-red-500/20">LOGOUT</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 shadow-2xl text-center">
            <p className="text-slate-500 text-[10px] font-black uppercase mb-2">Available Balance</p>
            <h2 className="text-4xl font-black text-green-500">${profile?.balance || '0.00'}</h2>
          </div>
          <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 shadow-2xl text-center">
            <p className="text-slate-500 text-[10px] font-black uppercase mb-2">Total Withdrawn</p>
            <h2 className="text-4xl font-black text-blue-500">${profile?.total_withdrawn || '0.00'}</h2>
          </div>
          <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 shadow-2xl text-center">
            <p className="text-slate-500 text-[10px] font-black uppercase mb-2">Account Status</p>
            <h2 className="text-4xl font-black text-orange-500 italic">Active</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-10">
            <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-xl">
              <h3 className="text-xl font-bold mb-6">Create New Link 🔗</h3>
              <input type="text" placeholder="Link Name (e.g. GTA V File)" className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl mb-4 outline-none focus:ring-2 focus:ring-blue-500" value={linkTitle} onChange={(e) => setLinkTitle(e.target.value)} />
              <input type="url" placeholder="Destination URL" className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl mb-4 outline-none focus:ring-2 focus:ring-blue-500" value={url} onChange={(e) => setUrl(e.target.value)} />
              <select className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl mb-6 outline-none" value={pages} onChange={(e) => setPages(Number(e.target.value))}>
                {[2,3,4,5,6].map(n => <option key={n} value={n}>{n} Pages (Profit x{n})</option>)}
              </select>
              <button onClick={handleShorten} className="w-full bg-blue-600 hover:bg-blue-700 py-4 rounded-2xl font-black shadow-xl">GENERATE LINK 🚀</button>
              {shortLink && (
                <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex justify-between items-center">
                  <span className="text-blue-400 font-bold text-sm truncate mr-2">{shortLink}</span>
                  <button onClick={() => {navigator.clipboard.writeText(shortLink); alert("Copied!")}} className="bg-blue-600 text-[10px] px-3 py-1 rounded-lg font-black">COPY</button>
                </div>
              )}
            </div>

            <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-xl">
              <h3 className="text-xl font-bold mb-6">My Recent Links (Last 20) 📊</h3>
              <div className="space-y-4">
                {myLinks.length === 0 ? <p className="text-slate-600 italic text-sm">No links created yet.</p> : 
                  myLinks.map((l: any) => (
                    <div key={l.id} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex justify-between items-center">
                      <div className="truncate mr-4">
                        <p className="font-bold text-slate-200 truncate">{l.title}</p>
                        <p className="text-[10px] text-blue-500 font-mono">{window.location.origin}/{l.short_code}</p>
                      </div>
                      <div className="text-right min-w-[60px]">
                        <p className="text-xl font-black text-white">{l.clicks_count}</p>
                        <p className="text-[8px] text-slate-500 uppercase font-bold">Clicks</p>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>

          <div className="space-y-10">
            <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-xl">
              <h3 className="text-xl font-bold mb-6">Request Withdrawal 💰</h3>
              <form onSubmit={handleWithdrawRequest} className="space-y-4">
                <input type="number" placeholder="Amount (Min $5)" className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl outline-none" value={wAmount} onChange={(e) => setWAmount(e.target.value)} required />
                <select className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl outline-none" value={wMethod} onChange={(e) => setWMethod(e.target.value)}>
                  <option value="Binance (USDT TRC20)">Binance (USDT TRC20) - No Fees (0%)</option>
                  <option value="Litecoin (LTC)">Litecoin (LTC) - Fee (1%)</option>
                </select>

                {wMethod.includes("LTC") && wAmount && parseFloat(wAmount) >= 5 && (
                  <p className="text-[10px] text-orange-400 font-bold ml-2 animate-pulse">
                    ⚠️ You will receive approx. ${(parseFloat(wAmount) * 0.99).toFixed(2)} after 1% fee.
                  </p>
                )}

                <input type="text" placeholder={wMethod.includes("Binance") ? "Binance ID or Email" : "LTC Wallet Address"} className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl outline-none" value={wAddress} onChange={(e) => setWAddress(e.target.value)} required />
                {wError && <p className="text-red-500 text-xs font-bold animate-bounce">{wError}</p>}
                <button type="submit" className="w-full bg-green-600 hover:bg-green-700 py-4 rounded-2xl font-black shadow-xl">SUBMIT REQUEST 💸</button>
              </form>
            </div>

            <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-xl">
              <h3 className="text-xl font-bold mb-6">My Withdrawals (Last 20) 🧾</h3>
              <div className="space-y-4">
                {myWithdrawals.map((w: any) => (
                  <div key={w.id} className="flex justify-between items-center p-4 bg-slate-950 rounded-2xl border border-slate-800">
                    <div>
                      <p className="font-black text-green-500">${w.amount}</p>
                      <p className="text-[9px] text-slate-500 uppercase font-bold">{w.method}</p>
                    </div>
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full ${w.status === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'}`}>
                      {w.status === 'completed' ? 'Complete ✅' : 'In Progress'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-xl">
              <h3 className="text-xl font-bold mb-6">Global Payments (Last 20) 🌍</h3>
              <div className="space-y-4">
                {globalWithdrawals.map((w: any) => (
                  <div key={w.id} className="flex justify-between items-center p-4 bg-slate-800/30 rounded-2xl">
                    <p className="text-[10px] font-bold text-slate-400">User: {w.user_id.substring(0,6)}***</p>
                    <p className="font-black text-white">${w.amount}</p>
                    <p className="text-[9px] text-green-500 font-bold uppercase">Complete ✅</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}