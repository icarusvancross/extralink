"use client";
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      {/* Navigation */}
      <nav className="p-6 flex justify-between items-center max-w-6xl mx-auto">
        <h1 className="text-2xl font-black text-blue-500 italic">ExtraLink</h1>
        <Link href="/login" className="bg-blue-600 px-6 py-2 rounded-full font-bold text-sm hover:bg-blue-700 transition-all">
          Publisher Login
        </Link>
      </nav>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto text-center pt-20 px-6">
        <h2 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter">
          Secure Cloud <span className="text-blue-500">Link Encryption</span>
        </h2>
        <p className="text-slate-400 text-lg mb-10 leading-relaxed">
          ExtraLink provides military-grade encryption for your shared files. 
          Protect your data from bots and unauthorized access with our advanced protocol v4.2.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800">
            <h3 className="text-blue-500 font-bold mb-2 text-xl">Fast</h3>
            <p className="text-slate-500 text-sm">Global CDN ensures lightning fast redirects.</p>
          </div>
          <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800">
            <h3 className="text-green-500 font-bold mb-2 text-xl">Secure</h3>
            <p className="text-slate-500 text-sm">AES-256 bit encryption for every link.</p>
          </div>
          <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800">
            <h3 className="text-orange-500 font-bold mb-2 text-xl">Reliable</h3>
            <p className="text-slate-500 text-sm">99.9% Uptime guaranteed for all users.</p>
          </div>
        </div>

        <footer className="border-t border-slate-900 pt-10 opacity-30 text-[10px] font-bold uppercase tracking-[0.5em]">
          © 2026 ExtraLink Protocol - All Rights Reserved
        </footer>
      </main>
    </div>
  );
}