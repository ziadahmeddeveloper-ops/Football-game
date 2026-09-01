"use client";

import { motion } from "framer-motion";
import { Trophy, Gavel, Brain, Users, Shield, Globe, Play } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex-1 w-full min-h-screen bg-[#050505] overflow-x-hidden relative text-white font-sans selection:bg-[#FFD700] selection:text-black">
      {/* Dark stadium-like radial gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a1500] via-[#050505] to-[#000000] z-0 pointer-events-none" />
      
      {/* Light ray from top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#FFD700] opacity-[0.03] blur-[120px] rounded-full pointer-events-none z-0" />

      {/* Top Tagline */}
      <div className="w-full text-center py-3 z-20 relative border-b border-white/5 bg-black/40 backdrop-blur-sm">
        <p className="text-[10px] md:text-xs font-black tracking-[0.3em] text-zinc-400 uppercase">
          Build your team. Win the auction. Become a legend.
        </p>
      </div>

      <div className="max-w-[1400px] mx-auto w-full px-6 pt-12 pb-24 relative z-10 flex flex-col items-center">
        
        {/* Logo Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center mb-16"
        >
          <Trophy className="w-12 h-12 text-[#FFD700] mb-2 drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]" />
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white drop-shadow-2xl flex items-center">
            DRAFTI<span className="gold-gradient-text text-7xl md:text-9xl -ml-1">X</span>
            <span className="text-[#FFD700] ml-4 font-black italic tracking-widest text-4xl md:text-5xl mt-4">AI</span>
          </h1>
          <p className="text-sm md:text-base tracking-[0.4em] text-zinc-400 font-bold uppercase mt-2">
            The Ultimate Football Auction Game
          </p>
        </motion.div>

        {/* Main Content Area */}
        <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-12 mt-4 relative">
          
          {/* Left Sidebar Features */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col gap-8 lg:w-1/4 z-20"
          >
            <FeatureRow icon={<Gavel />} title="LIVE AUCTIONS" sub="REAL TIME BIDDING" />
            <FeatureRow icon={<Brain />} title="AI ASSISTANT" sub="SMART STRATEGY" />
            <FeatureRow icon={<Users />} title="25,000+ PLAYERS" sub="LEGENDS & STARS" />
            <FeatureRow icon={<Shield />} title="BUILD YOUR" sub="DREAM TEAM" />
            <FeatureRow icon={<Globe />} title="COMPETE" sub="WORLDWIDE" />
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
                  <LegendCard name="MESSI" rating="99" pos="RW" img="https://cdn.sofifa.net/players/158/023/22_120.png" />
                </motion.div>
                
                {/* Center Card */}
                <motion.div 
                  initial={{ opacity: 0, y: 50, scale: 0.8 }}
                  animate={{ opacity: 1, y: -20, scale: 1.05, z: 50 }}
                  transition={{ duration: 1, delay: 0.6 }}
                  className="absolute z-40 animate-float"
                >
                  <LegendCard name="RONALDO" rating="99" pos="ST" img="https://cdn.sofifa.net/players/020/801/22_120.png" isCenter />
                </motion.div>

                {/* Right Card */}
                <motion.div 
                  initial={{ opacity: 0, x: -50, rotateY: -45, z: -200 }}
                  animate={{ opacity: 1, x: 70, rotateY: -15, z: -100 }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="absolute animate-float hidden sm:block"
                  style={{ animationDelay: '0.4s' }}
                >
                  <LegendCard name="NEYMAR" rating="91" pos="LW" img="https://cdn.sofifa.net/players/190/871/22_120.png" />
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
             <div className="w-full bg-black/60 border border-[#FFD700]/20 rounded-2xl p-4 backdrop-blur-md shadow-[0_0_30px_rgba(255,215,0,0.05)]">
               <div className="flex items-center gap-2 mb-4">
                 <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                 <span className="text-[10px] font-black tracking-widest uppercase text-zinc-400">Live Auction</span>
               </div>
               <div className="flex items-center gap-4 mb-4">
                 <div className="w-16 h-16 bg-gradient-to-tr from-zinc-800 to-zinc-900 border border-zinc-700 rounded-lg overflow-hidden flex items-end">
                    <img src="https://cdn.sofifa.net/players/231/747/22_120.png" className="w-full h-full object-contain" />
                 </div>
                 <div>
                   <h4 className="font-black text-lg">MBAPPÉ</h4>
                   <p className="text-xs text-zinc-400 font-bold">91 ST</p>
                 </div>
               </div>
               <div className="text-xs text-zinc-500 font-bold uppercase mb-1">Current Bid</div>
               <div className="text-2xl font-black text-[#FFD700] mb-4">128,500,000 <span className="text-sm">🪙</span></div>
               <div className="w-full bg-gradient-to-r from-[#B8860B] to-[#FFD700] text-black text-center py-2 rounded-lg font-black text-sm uppercase tracking-widest cursor-pointer hover:brightness-110 transition">
                 Place Bid
               </div>
             </div>
          </motion.div>
        </div>

        {/* Bottom CTA Area */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="w-full flex flex-col items-center mt-20 z-30"
        >
          <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter text-white drop-shadow-2xl mb-8 text-center" style={{ fontFamily: 'Impact, sans-serif' }}>
            EVERY BID <br className="md:hidden" />
            <span className="gold-gradient-text ml-4">CHANGES HISTORY</span>
          </h2>
          
          <Link href="/login" className="group relative px-10 py-5 bg-gradient-to-r from-[#B8860B] via-[#FFD700] to-[#B8860B] rounded-full overflow-hidden shadow-[0_0_40px_rgba(255,215,0,0.4)] hover:shadow-[0_0_60px_rgba(255,215,0,0.6)] transition-all transform hover:scale-105">
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
            <span className="relative text-black font-black text-xl md:text-2xl tracking-widest uppercase flex items-center gap-3">
              JOIN NOW & RULE THE GAME! <Play className="w-6 h-6 fill-current" />
            </span>
          </Link>

          {/* Bottom Icons Nav */}
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 mt-20 pt-8 border-t border-white/10 w-full max-w-4xl">
            <BottomIcon icon={<Trophy />} label="LEGENDS" />
            <BottomIcon icon={<Brain />} label="AI ASSISTANT" />
            <BottomIcon icon={<Gavel />} label="LIVE AUCTIONS" />
            <BottomIcon icon={<Shield />} label="BUILD" />
            <BottomIcon icon={<Globe />} label="COMPETE" />
          </div>
        </motion.div>

      </div>
    </div>
  );
}

function FeatureRow({ icon, title, sub }: { icon: React.ReactNode, title: string, sub: string }) {
  return (
    <div className="flex items-center gap-4 group cursor-pointer">
      <div className="w-12 h-12 rounded-lg border border-[#FFD700]/30 bg-[#FFD700]/5 flex items-center justify-center text-[#FFD700] group-hover:bg-[#FFD700]/20 group-hover:scale-110 transition-all shadow-[0_0_15px_rgba(255,215,0,0.1)]">
        {icon}
      </div>
      <div>
        <h3 className="font-black text-white tracking-widest uppercase text-sm group-hover:text-[#FFD700] transition-colors">{title}</h3>
        <p className="text-[10px] text-zinc-500 font-bold tracking-[0.2em] uppercase">{sub}</p>
      </div>
    </div>
  );
}

function BottomIcon({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <div className="flex flex-col items-center gap-3 group cursor-pointer text-zinc-500 hover:text-[#FFD700] transition-colors">
      <div className="w-8 h-8 flex items-center justify-center">
        {icon}
      </div>
      <span className="text-[10px] font-black tracking-[0.2em] uppercase">{label}</span>
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
