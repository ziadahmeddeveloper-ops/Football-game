"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Users, Settings, Play, Shield, Plus, Search, ArrowLeft, Trophy } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LobbyPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');
  const [roomCode, setRoomCode] = useState("");
  
  const [budget, setBudget] = useState("100000000");
  const [squadSize, setSquadSize] = useState("11");
  const [botDiff, setBotDiff] = useState("medium");
  const [maxPlayers, setMaxPlayers] = useState("4");

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (!token || !userStr) {
      window.location.href = '/login';
    }
  }, []);


  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const fakeCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    router.push(`/room/${fakeCode}?budget=${budget}&size=${squadSize}&diff=${botDiff}&max=${maxPlayers}`);
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if(roomCode.length > 3) router.push(`/room/${roomCode.toUpperCase()}`);
  };

  return (
    <div className="flex-1 w-full min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 relative">
      <div className="absolute inset-0 bg-[#0B0F19] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#0052FF]/20 via-[#0B0F19] to-[#0B0F19] -z-10" />
      
      {/* Responsive Header Navigation */}
      <div className="w-full max-w-xl flex justify-between items-center mb-6 z-20 gap-2">
        <Link href="/" className="text-zinc-400 hover:text-white transition flex items-center gap-1.5 font-bold uppercase tracking-widest bg-white/5 px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl hover:bg-white/10 border border-white/5 text-xs sm:text-sm">
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" /> Home
        </Link>

        <div className="flex items-center gap-2">
          <Link href="/leaderboard" className="text-[#FFD700] hover:text-white transition flex items-center gap-1.5 font-bold uppercase tracking-widest bg-[#FFD700]/10 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl hover:bg-[#FFD700]/20 border border-[#FFD700]/20 text-xs sm:text-sm">
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFD700]" /> Leaderboard
          </Link>

          <Link href="/profile" className="text-[#00F0FF] hover:text-white transition flex items-center gap-1.5 font-bold uppercase tracking-widest bg-[#00F0FF]/10 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl hover:bg-[#00F0FF]/20 border border-[#00F0FF]/20 text-xs sm:text-sm">
            <Users className="w-4 h-4 sm:w-5 sm:h-5" /> Profile
          </Link>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl glass-panel p-5 sm:p-8 rounded-3xl"
      >
        <div className="flex items-center justify-center gap-4 mb-8">
          <button 
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-3 text-center rounded-xl font-bold transition ${activeTab === 'create' ? 'bg-[#00F0FF] text-black shadow-[0_0_20px_rgba(0,240,255,0.3)]' : 'bg-white/5 text-zinc-400 hover:text-white'}`}
          >
            Create Match
          </button>
          <button 
            onClick={() => setActiveTab('join')}
            className={`flex-1 py-3 text-center rounded-xl font-bold transition ${activeTab === 'join' ? 'bg-[#00F0FF] text-black shadow-[0_0_20px_rgba(0,240,255,0.3)]' : 'bg-white/5 text-zinc-400 hover:text-white'}`}
          >
            Join Match
          </button>
        </div>

        {activeTab === 'create' ? (
          <form onSubmit={handleCreateRoom} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-300 flex items-center gap-2">
                <Users className="w-4 h-4 text-[#00F0FF]" /> Match Budget
              </label>
              <select 
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00F0FF] transition appearance-none"
              >
                <option value="50000000">50,000,000 (Hardcore)</option>
                <option value="100000000">100,000,000 (Standard)</option>
                <option value="150000000">150,000,000 (Relaxed)</option>
                <option value="300000000">300,000,000 (Legends Only)</option>
              </select>
            </div>



            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-300 flex items-center gap-2">
                <Users className="w-4 h-4 text-[#00F0FF]" /> Max Players
              </label>
              <select 
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00F0FF] transition appearance-none"
              >
                <option value="2">2 Players (1v1)</option>
                <option value="4">4 Players</option>
                <option value="8">8 Players</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-300 flex items-center gap-2">
                <Settings className="w-4 h-4 text-[#00F0FF]" /> Squad Size
              </label>
              <select 
                value={squadSize}
                onChange={(e) => setSquadSize(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00F0FF] transition appearance-none"
              >
                <option value="4">4-a-side (Mini)</option>
                <option value="5">5-a-side (Fast)</option>
                <option value="7">7-a-side</option>
                <option value="11">11-a-side (Full Squad)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-300 flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#00F0FF]" /> AI Bot Difficulty
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['easy', 'medium', 'hard', 'legendary'].map(diff => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setBotDiff(diff)}
                    className={`py-2 text-xs font-bold uppercase rounded-lg border transition ${botDiff === diff ? 'bg-[#0052FF] border-[#0052FF] text-white' : 'bg-transparent border-white/10 text-zinc-400 hover:border-white/30'}`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" className="w-full bg-gradient-to-r from-[#0052FF] to-[#00F0FF] text-white font-black text-lg py-4 rounded-xl shadow-[0_0_20px_rgba(0,82,255,0.4)] hover:shadow-[0_0_30px_rgba(0,240,255,0.6)] transition-all flex items-center justify-center gap-2 mt-8">
              <Play className="w-5 h-5 fill-current" />
              CREATE ARENA
            </button>
          </form>
        ) : (
          <form onSubmit={handleJoinRoom} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-300 flex items-center gap-2">
                <Search className="w-4 h-4 text-[#00F0FF]" /> Room Code
              </label>
              <input 
                type="text" 
                placeholder="e.g. X7K9MQ"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-white text-center font-black text-2xl tracking-[0.5em] uppercase focus:outline-none focus:border-[#00F0FF] transition placeholder:text-zinc-600 placeholder:tracking-normal placeholder:font-medium"
              />
            </div>
            <button type="submit" className="w-full bg-white text-black font-black text-lg py-4 rounded-xl hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 mt-8">
              JOIN ARENA
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
