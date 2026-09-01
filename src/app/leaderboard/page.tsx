"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Trophy, ArrowLeft, Shield, Users, Award, TrendingUp, Sparkles, RefreshCw } from 'lucide-react';

interface LeaderboardUser {
  rank: number;
  id: number;
  name: string;
  username?: string;
  avatar?: string;
  rank_tier: string;
  score: number;
  wins: number;
  losses: number;
  matches: number;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [myScore, setMyScore] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [myUserId, setMyUserId] = useState<number | null>(null);

  const fetchLeaderboard = () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const apiBase = process.env.NEXT_PUBLIC_API_URL || '';
    fetch(`${apiBase}/api/leaderboard`, { headers })
      .then(res => res.json())
      .then(data => {
        setLeaderboard(data.leaderboard || []);
        if (data.current_user_rank) setMyRank(data.current_user_rank);
        if (data.current_user_score !== undefined) setMyScore(data.current_user_score);
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    if (token) {
      fetch(`${apiBase}/api/auth/me`, { headers })
        .then(res => res.json())
        .then(data => {
          if (data.user && data.user.id) {
            setMyUserId(data.user.id);
            if (data.user.score !== undefined) setMyScore(data.user.score);
          }
        })
        .catch(console.error);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const top1 = leaderboard[0];
  const top2 = leaderboard[1];
  const top3 = leaderboard[2];
  const restLeaderboard = leaderboard.slice(3);

  const getRankBadgeClass = (rank: number) => {
    if (rank === 1) return 'bg-[#FFD700] text-black shadow-[0_0_15px_rgba(255,215,0,0.6)] font-extrabold';
    if (rank === 2) return 'bg-zinc-300 text-black font-extrabold';
    if (rank === 3) return 'bg-amber-700 text-white font-extrabold';
    return 'bg-white/10 text-zinc-300 font-bold';
  };

  return (
    <div className="flex-1 w-full min-h-screen bg-[#050811] text-white relative overflow-x-hidden">
      {/* Background Gradient & Glows */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#050811] to-black -z-10 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#FFD700]/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* Navigation Header */}
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-6 flex justify-between items-center z-20">
        <Link 
          href="/lobby" 
          className="text-zinc-400 hover:text-white transition flex items-center gap-2 font-bold uppercase tracking-widest bg-white/5 px-4 sm:px-6 py-2.5 rounded-2xl hover:bg-white/10 border border-white/5 text-xs sm:text-sm"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" /> Lobby
        </Link>

        <button 
          onClick={fetchLeaderboard} 
          className="text-[#00F0FF] hover:text-white transition flex items-center gap-2 font-bold uppercase tracking-widest bg-[#00F0FF]/10 px-4 sm:px-6 py-2.5 rounded-2xl hover:bg-[#00F0FF]/20 border border-[#00F0FF]/20 text-xs sm:text-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 flex flex-col items-center">

        {/* Header Title */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-8 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FFD700] to-amber-600 flex items-center justify-center text-black mb-3 shadow-[0_0_30px_rgba(255,215,0,0.4)]">
            <Trophy className="w-9 h-9 fill-current" />
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white uppercase drop-shadow-lg">
            WORLD <span className="gold-gradient-text">LEADERBOARD</span>
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm font-bold tracking-[0.3em] uppercase mt-2">
            Global Player Rankings • +10 PTS Win | -10 PTS Loss
          </p>
        </motion.div>

        {/* Current Logged-in User Rank Banner */}
        {myRank !== null && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-3xl bg-gradient-to-r from-blue-900/40 via-purple-900/40 to-blue-900/40 border-2 border-[#FFD700]/40 rounded-2xl p-4 sm:p-6 mb-10 flex flex-wrap sm:flex-nowrap items-center justify-between gap-4 shadow-[0_0_30px_rgba(255,215,0,0.15)]"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#FFD700] text-black font-black text-xl flex items-center justify-center shadow-lg">
                #{myRank}
              </div>
              <div>
                <span className="text-[10px] font-black text-[#FFD700] uppercase tracking-widest block">YOUR GLOBAL RANKING</span>
                <h3 className="text-lg font-black text-white">World Position: #{myRank}</h3>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Global Score</span>
                <span className={`text-2xl font-black ${myScore >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {myScore >= 0 ? `+${myScore}` : myScore} <span className="text-xs">PTS</span>
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* PODIUM TOP 3 */}
        {leaderboard.length >= 3 && (
          <div className="w-full max-w-3xl flex justify-center items-end gap-3 sm:gap-6 mb-12 pt-4">
            
            {/* 🥈 #2 SILVER */}
            {top2 && (
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex-1 max-w-[200px] flex flex-col items-center"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-zinc-300 to-zinc-500 border-2 border-white/40 flex items-center justify-center text-black font-black text-2xl shadow-xl mb-3 relative overflow-hidden">
                  {top2.avatar ? <img src={top2.avatar} className="w-full h-full object-cover" /> : <span>🥈</span>}
                  <div className="absolute top-1 left-1 bg-black/70 text-white text-[9px] font-black px-1.5 py-0.5 rounded">#2</div>
                </div>
                <h3 className="font-black text-sm sm:text-base text-white text-center truncate w-full">{top2.name}</h3>
                <span className="text-[10px] text-zinc-400 font-bold uppercase">{top2.rank_tier}</span>
                <div className={`mt-2 px-3 py-1 rounded-full text-xs sm:text-sm font-black border border-white/10 ${top2.score >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                  {top2.score >= 0 ? `+${top2.score}` : top2.score} PTS
                </div>
              </motion.div>
            )}

            {/* 🥇 #1 GOLD CHAMPION */}
            {top1 && (
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex-1 max-w-[220px] flex flex-col items-center -translate-y-4"
              >
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-[#FFD700] to-amber-600 border-4 border-[#FFD700] flex items-center justify-center text-black font-black text-3xl shadow-[0_0_40px_rgba(255,215,0,0.6)] mb-3 relative overflow-hidden animate-pulse">
                  {top1.avatar ? <img src={top1.avatar} className="w-full h-full object-cover" /> : <span>🥇</span>}
                  <div className="absolute top-1 left-1 bg-black text-[#FFD700] text-[10px] font-black px-2 py-0.5 rounded">#1 WORLD</div>
                </div>
                <h3 className="font-black text-base sm:text-lg text-white text-center truncate w-full">{top1.name}</h3>
                <span className="text-xs text-[#FFD700] font-black uppercase tracking-wider">{top1.rank_tier}</span>
                <div className={`mt-2 px-4 py-1.5 rounded-full text-sm sm:text-base font-black border border-[#FFD700]/30 ${top1.score >= 0 ? 'bg-[#FFD700]/20 text-[#FFD700]' : 'bg-red-500/10 text-red-400'}`}>
                  {top1.score >= 0 ? `+${top1.score}` : top1.score} PTS
                </div>
              </motion.div>
            )}

            {/* 🥉 #3 BRONZE */}
            {top3 && (
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex-1 max-w-[200px] flex flex-col items-center"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-amber-700 to-amber-900 border-2 border-amber-500/40 flex items-center justify-center text-white font-black text-2xl shadow-xl mb-3 relative overflow-hidden">
                  {top3.avatar ? <img src={top3.avatar} className="w-full h-full object-cover" /> : <span>🥉</span>}
                  <div className="absolute top-1 left-1 bg-black/70 text-amber-400 text-[9px] font-black px-1.5 py-0.5 rounded">#3</div>
                </div>
                <h3 className="font-black text-sm sm:text-base text-white text-center truncate w-full">{top3.name}</h3>
                <span className="text-[10px] text-zinc-400 font-bold uppercase">{top3.rank_tier}</span>
                <div className={`mt-2 px-3 py-1 rounded-full text-xs sm:text-sm font-black border border-white/10 ${top3.score >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                  {top3.score >= 0 ? `+${top3.score}` : top3.score} PTS
                </div>
              </motion.div>
            )}

          </div>
        )}

        {/* FULL RANKINGS TABLE */}
        <div className="w-full max-w-4xl bg-[#0d1525] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          <div className="bg-white/5 px-6 py-4 border-b border-white/10 flex justify-between items-center">
            <h2 className="font-black text-sm uppercase tracking-widest text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#00F0FF]" /> World Rankings
            </h2>
            <span className="text-xs text-zinc-400 font-bold">{leaderboard.length} Ranked Managers</span>
          </div>

          {leaderboard.length === 0 ? (
            <div className="p-12 text-center text-zinc-500 font-bold text-sm">
              {loading ? 'Loading global rankings...' : 'No managers registered yet. Be the first to win a match!'}
            </div>
          ) : (
            <div className="divide-y divide-white/5 overflow-x-auto">
              {leaderboard.map((user) => {
                const isMe = myUserId === user.id;
                return (
                  <div 
                    key={user.id}
                    className={`flex items-center justify-between px-4 sm:px-6 py-3.5 transition ${
                      isMe ? 'bg-[#FFD700]/10 border-l-4 border-[#FFD700]' : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3 sm:gap-4 min-w-[180px]">
                      <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-xs sm:text-sm ${getRankBadgeClass(user.rank)}`}>
                        {user.rank}
                      </div>
                      <div className="flex flex-col">
                        <span className={`font-black text-sm sm:text-base ${isMe ? 'text-[#FFD700]' : 'text-white'} truncate max-w-[140px] sm:max-w-[200px]`}>
                          {user.name} {isMe && '(YOU)'}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-bold uppercase">{user.rank_tier}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 sm:gap-8">
                      <div className="hidden sm:flex items-center gap-3 text-xs text-zinc-400 font-bold">
                        <span>W: <strong className="text-emerald-400">{user.wins}</strong></span>
                        <span>L: <strong className="text-red-400">{user.losses}</strong></span>
                      </div>

                      <div className={`px-3 sm:px-4 py-1.5 rounded-xl font-black text-xs sm:text-sm text-center min-w-[90px] border ${
                        user.score >= 0 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {user.score >= 0 ? `+${user.score}` : user.score} PTS
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
