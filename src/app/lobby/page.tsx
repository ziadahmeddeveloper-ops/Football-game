"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Users, Settings, Play, Shield, Plus, Search, ArrowLeft, Trophy, UserCheck, Smartphone, Globe } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LobbyPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');
  const [roomCode, setRoomCode] = useState("");
  
  const [budget, setBudget] = useState("100000000");
  const [squadSize, setSquadSize] = useState("11");
  const [botDiff, setBotDiff] = useState("medium");
  const [maxPlayers, setMaxPlayers] = useState("2");
  const [opponentType, setOpponentType] = useState<'bot' | 'local_friend' | 'online_friend'>('local_friend');

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
    router.push(`/room/${fakeCode}?budget=${budget}&size=${squadSize}&diff=${botDiff}&max=${maxPlayers}&mode=${opponentType}`);
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
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" /> الرئيسية
        </Link>

        <div className="flex items-center gap-2">
          <Link href="/leaderboard" className="text-[#FFD700] hover:text-white transition flex items-center gap-1.5 font-bold uppercase tracking-widest bg-[#FFD700]/10 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl hover:bg-[#FFD700]/20 border border-[#FFD700]/20 text-xs sm:text-sm">
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFD700]" /> المتصدرين
          </Link>

          <Link href="/profile" className="text-[#00F0FF] hover:text-white transition flex items-center gap-1.5 font-bold uppercase tracking-widest bg-[#00F0FF]/10 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl hover:bg-[#00F0FF]/20 border border-[#00F0FF]/20 text-xs sm:text-sm">
            <Users className="w-4 h-4 sm:w-5 sm:h-5" /> الملف الشخصي
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
            إنشاء مباراة جديد
          </button>
          <button 
            onClick={() => setActiveTab('join')}
            className={`flex-1 py-3 text-center rounded-xl font-bold transition ${activeTab === 'join' ? 'bg-[#00F0FF] text-black shadow-[0_0_20px_rgba(0,240,255,0.3)]' : 'bg-white/5 text-zinc-400 hover:text-white'}`}
          >
            دخول غرفة بدعوة
          </button>
        </div>

        {activeTab === 'create' ? (
          <form onSubmit={handleCreateRoom} className="space-y-6">
            
            {/* Opponent Selection (Bot vs Local Friend vs Online Friend) */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#00F0FF]" /> اختر المنافس (Game Mode)
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setOpponentType('local_friend')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition text-center ${opponentType === 'local_friend' ? 'bg-[#00F0FF]/20 border-[#00F0FF] text-white' : 'bg-black/40 border-white/10 text-zinc-400 hover:border-white/20'}`}
                >
                  <Smartphone className="w-5 h-5 text-[#00F0FF]" />
                  <span className="text-xs font-bold">صديق (نفس الجهاز)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setOpponentType('online_friend')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition text-center ${opponentType === 'online_friend' ? 'bg-[#FFD700]/20 border-[#FFD700] text-white' : 'bg-black/40 border-white/10 text-zinc-400 hover:border-white/20'}`}
                >
                  <Globe className="w-5 h-5 text-[#FFD700]" />
                  <span className="text-xs font-bold">صديق (أونلاين)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setOpponentType('bot')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition text-center ${opponentType === 'bot' ? 'bg-[#0052FF]/20 border-[#0052FF] text-white' : 'bg-black/40 border-white/10 text-zinc-400 hover:border-white/20'}`}
                >
                  <Shield className="w-5 h-5 text-[#0052FF]" />
                  <span className="text-xs font-bold">كمبيوتر (AI)</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-300 flex items-center gap-2">
                <Users className="w-4 h-4 text-[#00F0FF]" /> ميزانية المزاد (Budget)
              </label>
              <select 
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00F0FF] transition appearance-none"
              >
                <option value="50000000">50,000,000 (صعبة للغاية)</option>
                <option value="100000000">100,000,000 (قياسي Standard)</option>
                <option value="150000000">150,000,000 (مريحة)</option>
                <option value="300000000">300,000,000 (نجوم وأساطير)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-300 flex items-center gap-2">
                <Settings className="w-4 h-4 text-[#00F0FF]" /> عدد لاعبي التشكيلة
              </label>
              <select 
                value={squadSize}
                onChange={(e) => setSquadSize(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00F0FF] transition appearance-none"
              >
                <option value="4">4 لاعبين (مصغرة)</option>
                <option value="5">5 لاعبين (خماسي سريع)</option>
                <option value="7">7 لاعبين (سباعي)</option>
                <option value="11">11 لاعب (تشكيلة كاملة)</option>
              </select>
            </div>

            {opponentType === 'bot' && (
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-300 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#00F0FF]" /> مستوى قوة الـ AI
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
            )}

            <button type="submit" className="w-full bg-gradient-to-r from-[#0052FF] to-[#00F0FF] text-white font-black text-lg py-4 rounded-xl shadow-[0_0_20px_rgba(0,82,255,0.4)] hover:shadow-[0_0_30px_rgba(0,240,255,0.6)] transition-all flex items-center justify-center gap-2 mt-8">
              <Play className="w-5 h-5 fill-current" />
              ابدأ التحدي الآن ⚽
            </button>
          </form>
        ) : (
          <form onSubmit={handleJoinRoom} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-300 flex items-center gap-2">
                <Search className="w-4 h-4 text-[#00F0FF]" /> أدخل كود الغرفة
              </label>
              <input 
                type="text" 
                placeholder="مثال: X7K9MQ"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-white text-center font-black text-2xl tracking-[0.5em] uppercase focus:outline-none focus:border-[#00F0FF] transition placeholder:text-zinc-600 placeholder:tracking-normal placeholder:font-medium"
              />
            </div>
            <button type="submit" className="w-full bg-white text-black font-black text-lg py-4 rounded-xl hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 mt-8">
              دخول الغرفة 🚀
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}

