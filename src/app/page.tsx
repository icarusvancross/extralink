"use client";
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      <nav className="p-6 flex justify-between items-center max-w-6xl mx-auto">
        <h1 className="text-2xl font-black text-blue-500 italic">ExtraLink</h1>
        <Link href="/login" className="bg-blue-600 px-6 py-2 rounded-full font-bold text-sm hover:bg-blue-700 transition-all">
          Publisher Login
        </Link>
      </nav>

      <main className="max-w-4xl mx-auto text-center pt-20 px-6">
        <div className="inline-block bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold px-4 py-1 rounded-full mb-6 uppercase tracking-widest">
          Next-Gen Link Protection
        </div>
        <h2 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter">
          Secure Your Links with <span className="text-blue-500">Cloud Encryption</span>
        </h2>
        <p className="text-slate-400 text-lg mb-10 leading-relaxed max-w-2xl mx-auto">
          ExtraLink provides military-grade AES-256 encryption for your shared files and URLs. 
          Protect your data from malicious bots and unauthorized access with our global secure protocol.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 text-left">
            <div className="text-blue-500 text-3xl mb-4">⚡</div>
            <h3 className="font-bold mb-2 text-xl">Ultra Fast</h3>
            <p className="text-slate-500 text-sm">Global CDN ensures lightning fast redirects for users worldwide.</p>
          </div>
          <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 text-left">
            <div className="text-green-500 text-3xl mb-4">🛡️</div>
            <h3 className="font-bold mb-2 text-xl">Anti-Bot</h3>
            <p className="text-slate-500 text-sm">Advanced AI detection to block fraudulent traffic and scrapers.</p>
          </div>
          <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 text-left">
            <div className="text-orange-500 text-3xl mb-4">💎</div>
            <h3 className="font-bold mb-2 text-xl">Premium Ads</h3>
            <p className="text-slate-500 text-sm">We partner with top-tier ad networks to keep our service free.</p>
          </div>
        </div>

        <footer className="border-t border-slate-900 pt-10 opacity-30 text-[10px] font-bold uppercase tracking-[0.5em] pb-10">
          © 2026 ExtraLink Secure Protocol - All Rights Reserved
        </footer>
      </main>
    </div>
  );
}