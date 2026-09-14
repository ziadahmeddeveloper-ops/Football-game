"use client";

import { motion } from "framer-motion";
import { Trophy, Gavel, Brain, Users, Shield, Globe, Play, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [targetPath, setTargetPath] = useState("/login");
  
  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("token");
    if (token) {
      setTargetPath("/lobby");
    }
  }, []);

  return (
    <div className="flex-1 w-full min-h-screen bg-[#050505] overflow-x-hidden relative text-white font-sans selection:bg-[#FFD700] selection:text-black">
      {/* Dark stadium-like radial gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a1500] via-[#050505] to-[#000000] z-0 pointer-events-none" />
      
      {/* Light ray from top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#FFD700] opacity-[0.03] blur-[120px] rounded-full pointer-events-none z-0" />

      {/* Top Tagline */}
      <div className="w-full text-center py-3 z-20 relative border-b border-white/5 bg-black/40 backdrop-blur-sm">
        <p className="text-[10px] md:text-xs font-black tracking-[0.3em] text-zinc-300 uppercase">
          ⚽ FOOTBALL DRAFT ARENA 2026 • EA FC DRAFT EXPERIENCE
        </p>
      </div>

      <div className="max-w-[1400px] mx-auto w-full px-6 pt-12 pb-24 relative z-10 flex flex-col items-center">
        
        {/* Logo Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center mb-12 text-center"
        >
          <Trophy className="w-14 h-14 text-[#FFD700] mb-3 drop-shadow-[0_0_20px_rgba(255,215,0,0.6)]" />
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white drop-shadow-2xl flex items-center">
            FOOTBALL<span className="gold-gradient-text text-7xl md:text-9xl ml-2">DRAFT</span>
          </h1>
          <p className="text-sm md:text-base tracking-[0.4em] text-amber-400 font-bold uppercase mt-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#FFD700]" /> ساحة مزاد ومباريات كرة القدم الحقيقية
          </p>
        </motion.div>

        {/* Main Content Area */}
        <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-12 mt-4 relative">
          
          {/* Left Sidebar Features */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col gap-6 lg:w-1/4 z-20"
          >
            <FeatureRow icon={<Gavel />} title="مزادات حية ⚡" sub="مزاد مباشر بين اللاعبين" />
            <FeatureRow icon={<Users />} title="لعب 1v1 مع صديق 👥" sub="أونلاين أو نفس الجهاز" />
            <FeatureRow icon={<Brain />} title="تحدي الـ AI 🤖" sub="مستويات ذكاء اصطناعي محترفة" />
            <FeatureRow icon={<Shield />} title="تشكيلات EA FC 🎮" sub="بناء تشكيلة الأحلام" />
          </motion.div>

          {/* Center Floating Cards (Legends) */}
          <div className="flex-1 flex justify-center items-center h-[340px] sm:h-[450px] md:h-[500px] relative z-30 perspective-[2000px] w-full my-6 lg:my-0 scale-75 sm:scale-90 md:scale-100">
            {mounted && (
              <>
                {/* Left Card */}
                <motion.div 
                  initial={{ opacity: 0, x: 50, rotateY: 45, z: -200 }}
                  animate={{ opacity: 1, x: -70, rotateY: 15, z: -100 }}
                  transition={{ duration: 1, delay: 0.4 }}
                  className="absolute animate-float hidden sm:block"
                  style={{ animationDelay: '0.2s' }}
                >
                  <LegendCard name="MESSI" rating="99" pos="RW" img="/api/player-photo/158023?name=Messi" />
                </motion.div>
                
                {/* Center Card */}
                <motion.div 
                  initial={{ opacity: 0, y: 50, scale: 0.8 }}
                  animate={{ opacity: 1, y: -20, scale: 1.05, z: 50 }}
                  transition={{ duration: 1, delay: 0.6 }}
                  className="absolute z-40 animate-float"
                >
                  <LegendCard name="RONALDO" rating="99" pos="ST" img="/api/player-photo/20801?name=Ronaldo" isCenter />
                </motion.div>

                {/* Right Card */}
                <motion.div 
                  initial={{ opacity: 0, x: -50, rotateY: -45, z: -200 }}
                  animate={{ opacity: 1, x: 70, rotateY: -15, z: -100 }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="absolute animate-float hidden sm:block"
                  style={{ animationDelay: '0.4s' }}
                >
                  <LegendCard name="NEYMAR" rating="91" pos="LW" img="/api/player-photo/190871?name=Neymar" />
                </motion.div>
              </>
            )}
          </div>

          {/* Right Sidebar Panels */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col gap-6 lg:w-1/4 z-20 items-end"
          >
             {/* Live Auction Widget */}
             <div className="w-full bg-black/60 border border-[#FFD700]/30 rounded-2xl p-5 backdrop-blur-md shadow-[0_0_30px_rgba(255,215,0,0.1)]">
               <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center gap-2">
                   <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                   <span className="text-xs font-black tracking-widest uppercase text-amber-400">مزاد مباشر عاجل</span>
                 </div>
                 <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded font-bold">15 ثانية</span>
               </div>
               <div className="flex items-center gap-4 mb-4">
                 <div className="w-16 h-16 bg-gradient-to-tr from-zinc-800 to-zinc-900 border border-zinc-700 rounded-lg overflow-hidden flex items-center justify-center p-1">
                    <img src="/api/player-photo/231747?name=Mbappe" className="w-full h-full object-contain" />
                 </div>
                 <div>
                   <h4 className="font-black text-lg text-white">KYLIAN MBAPPÉ</h4>
                   <p className="text-xs text-amber-400 font-bold">91 ST • Real Madrid</p>
                 </div>
               </div>
               <div className="text-xs text-zinc-400 font-bold uppercase mb-1">أعلى مزايدة حالية</div>
               <div className="text-2xl font-black text-[#FFD700] mb-4">128,500,000 <span className="text-sm">🪙</span></div>
               <Link href={targetPath} className="block w-full bg-gradient-to-r from-[#B8860B] via-[#FFD700] to-[#B8860B] text-black text-center py-2.5 rounded-xl font-black text-sm uppercase tracking-widest hover:brightness-110 transition shadow-lg">
                 زايد الآن ⚽
               </Link>
             </div>
          </motion.div>
        </div>

        {/* Bottom CTA Area */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="w-full flex flex-col items-center mt-16 z-30 text-center"
        >
          <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter text-white drop-shadow-2xl mb-8">
            كون تشكيلتك الذهبية <br className="md:hidden" />
            <span className="gold-gradient-text ml-2">وابدأ التحدي الآن!</span>
          </h2>
          
          <Link href={targetPath} className="group relative px-12 py-5 bg-gradient-to-r from-[#B8860B] via-[#FFD700] to-[#B8860B] rounded-full overflow-hidden shadow-[0_0_40px_rgba(255,215,0,0.5)] hover:shadow-[0_0_60px_rgba(255,215,0,0.7)] transition-all transform hover:scale-105">
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
            <span className="relative text-black font-black text-xl md:text-2xl tracking-widest uppercase flex items-center gap-3">
              ادخل الملعب وابدأ اللعب ⚽ <Play className="w-6 h-6 fill-current" />
            </span>
          </Link>
        </motion.div>

      </div>
    </div>
  );
}

function FeatureRow({ icon, title, sub }: { icon: React.ReactNode, title: string, sub: string }) {
  return (
    <div className="flex items-center gap-4 group cursor-pointer bg-white/5 p-3 rounded-2xl border border-white/5 hover:border-[#FFD700]/30 transition">
      <div className="w-12 h-12 rounded-xl border border-[#FFD700]/30 bg-[#FFD700]/10 flex items-center justify-center text-[#FFD700] group-hover:bg-[#FFD700]/20 group-hover:scale-110 transition-all shadow-[0_0_15px_rgba(255,215,0,0.1)]">
        {icon}
      </div>
      <div>
        <h3 className="font-black text-white text-sm group-hover:text-[#FFD700] transition-colors">{title}</h3>
        <p className="text-xs text-zinc-400 font-bold tracking-wide">{sub}</p>
      </div>
    </div>
  );
}

function LegendCard({ name, rating, pos, img, isCenter = false }: { name: string, rating: string, pos: string, img: string, isCenter?: boolean }) {
  return (
    <div className={`fut-card legend-card flex flex-col items-center justify-between p-4 ${isCenter ? 'w-64 h-[380px]' : 'w-56 h-[340px] opacity-90'}`}>
      <div className="w-full flex justify-between items-start z-10">
        <div className="flex flex-col items-center">
          <span className={`${isCenter ? 'text-5xl' : 'text-4xl'} font-black text-[#FFD700] drop-shadow-md`}>{rating}</span>
          <span className="text-sm font-bold text-[#FFD700]/80">{pos}</span>
        </div>
      </div>
      
      <div className="w-full h-40 -mt-10 flex items-end justify-center z-10 relative">
        <img 
          src={img} 
          alt={name} 
          className="w-[120%] h-[120%] object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.9)]" 
          onError={(e) => {
            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1a1a2e&color=FFD700&bold=true`;
          }}
        />
      </div>

      <div className="flex flex-col items-center w-full z-10">
        <h3 className={`${isCenter ? 'text-2xl' : 'text-xl'} font-black text-white uppercase tracking-wider mb-2 drop-shadow-md`}>{name}</h3>
        <div className="w-full h-px bg-gradient-to-r from-transparent via-[#FFD700]/50 to-transparent mb-2" />
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 w-full text-[10px] font-black text-[#FFD700]/90 text-center">
          <div className="flex justify-between"><span>95</span><span className="text-white/70">PAC</span></div>
          <div className="flex justify-between"><span>96</span><span className="text-white/70">DRI</span></div>
          <div className="flex justify-between"><span>98</span><span className="text-white/70">SHO</span></div>
          <div className="flex justify-between"><span>45</span><span className="text-white/70">DEF</span></div>
          <div className="flex justify-between"><span>94</span><span className="text-white/70">PAS</span></div>
          <div className="flex justify-between"><span>82</span><span className="text-white/70">PHY</span></div>
        </div>
      </div>
    </div>
  );
}

