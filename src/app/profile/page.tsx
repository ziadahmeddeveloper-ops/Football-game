"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Trophy, ArrowLeft, Coins, TrendingUp, TrendingDown, Target, Edit2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(savedUser));
    
    // Optionally fetch fresh data from backend
    const token = localStorage.getItem('token');
    const apiBase = process.env.NEXT_PUBLIC_API_URL || '';
    fetch(`${apiBase}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      if(data.user) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        if (data.reward_claimed) {
          alert("🎁 Daily Reward Claimed! +10,000 Coins added to your wallet.");
        }
      }
    });
  }, []);

  const formatMoney = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);

  if (!user) return <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00F0FF]"></div></div>;

  const totalMatches = user.wins + user.losses || 1; // prevent div by zero
  const winRate = user.wins > 0 ? Math.round((user.wins / totalMatches) * 100) : 0;

  return (
    <div className="flex-1 w-full min-h-screen flex flex-col items-center p-6 lg:p-12 relative bg-[#0B0F19]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0052FF]/20 via-[#0B0F19] to-[#0B0F19] -z-10" />
      
      <header className="w-full max-w-5xl flex justify-between items-center mb-12">
        <Link href="/lobby" className="text-zinc-400 hover:text-white transition flex items-center gap-2 font-bold uppercase tracking-widest bg-white/5 px-6 py-3 rounded-2xl hover:bg-white/10 border border-white/5 hover:border-white/20">
          <ArrowLeft className="w-5 h-5" /> Back to Lobby
        </Link>
        <button 
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            router.push('/login');
          }}
          className="text-red-400 hover:text-red-300 transition font-bold uppercase tracking-widest bg-red-500/10 px-6 py-3 rounded-2xl hover:bg-red-500/20"
        >
          Logout
        </button>
      </header>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* PROFILE CARD */}
        <div className="glass-panel p-8 rounded-3xl flex flex-col items-center border border-white/10 lg:col-span-1 text-center relative overflow-hidden">
          <div className="absolute top-0 w-full h-32 bg-gradient-to-b from-[#00F0FF]/20 to-transparent"></div>
          
          <div className="relative w-32 h-32 rounded-full border-4 border-[#00F0FF] p-1 mb-6 shadow-[0_0_30px_rgba(0,240,255,0.3)] mt-8">
            <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random`} alt="Avatar" className="w-full h-full rounded-full object-cover" />
            <button className="absolute bottom-0 right-0 bg-[#00F0FF] text-black p-2 rounded-full hover:scale-110 transition">
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
          
          <h2 className="text-3xl font-black text-white mb-1">{user.name}</h2>
          <p className="text-[#00F0FF] font-bold uppercase tracking-widest text-sm mb-4">{user.rank || 'Bronze'}</p>
          
          <div className="w-full bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-2xl p-4 flex items-center justify-between border border-[#FFD700]/30 mb-4">
            <span className="text-zinc-400 font-bold uppercase tracking-widest text-xs">Global Score</span>
            <span className={`font-black text-xl ${user.score >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {user.score >= 0 ? `+${user.score || 0}` : user.score} <span className="text-xs">PTS</span>
            </span>
          </div>

          <div className="w-full bg-black/40 rounded-2xl p-4 flex items-center justify-between border border-white/5 mb-6">
            <span className="text-zinc-400 font-bold uppercase tracking-widest text-xs">Wallet</span>
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-[#FFD700]" />
              <span className="font-black text-[#FFD700] text-lg">{formatMoney(user.coins || 100000)}</span>
            </div>
          </div>

          <Link 
            href="/leaderboard" 
            className="w-full bg-gradient-to-r from-[#FFD700] to-amber-600 text-black font-black py-3 rounded-xl shadow-[0_0_20px_rgba(255,215,0,0.3)] hover:brightness-110 transition flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
          >
            <Trophy className="w-4 h-4 fill-current" /> View World Leaderboard
          </Link>
        </div>

        {/* STATS & RECORDS */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          <div className="glass-panel p-8 rounded-3xl border border-white/10">
            <h3 className="text-xl font-black text-white uppercase tracking-widest mb-6 flex items-center gap-3">
              <Target className="w-6 h-6 text-[#00F0FF]" /> Lifetime Record
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-black/40 rounded-2xl p-6 border border-white/5 flex flex-col items-center">
                <Trophy className="w-8 h-8 text-[#FFD700] mb-3" />
                <span className="text-4xl font-black text-white mb-1">{user.wins || 0}</span>
                <span className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Wins (+10 PTS)</span>
              </div>
              <div className="bg-black/40 rounded-2xl p-6 border border-white/5 flex flex-col items-center">
                <TrendingDown className="w-8 h-8 text-red-400 mb-3" />
                <span className="text-4xl font-black text-white mb-1">{user.losses || 0}</span>
                <span className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Losses (-10 PTS)</span>
              </div>
              <div className="bg-black/40 rounded-2xl p-6 border border-white/5 flex flex-col items-center">
                <TrendingUp className="w-8 h-8 text-[#00F0FF] mb-3" />
                <span className="text-4xl font-black text-white mb-1">{winRate}%</span>
                <span className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Win Rate</span>
              </div>
            </div>
          </div>

          <div className="glass-panel p-8 rounded-3xl border border-white/10 flex-1 flex flex-col justify-center items-center opacity-50">
            <Trophy className="w-12 h-12 text-zinc-600 mb-4" />
            <h3 className="text-lg font-black text-zinc-500 uppercase tracking-widest mb-2">Match History</h3>
            <p className="text-zinc-600 font-medium text-center">Play your first Draft Arena match to see your history here.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
