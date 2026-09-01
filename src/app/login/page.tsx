"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import { Trophy, ArrowRight, Mail, Lock, Loader2 } from "lucide-react";
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';

const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "939551744838-oj26rfbr0ilp7gu60aa7dnqcrmhokk3a.apps.googleusercontent.com";

function LoginContent() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleStandardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || '';
      const res = await fetch(`${apiBase}/api/auth/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = "/lobby";
      } else {
        setErrorMsg(data.message || "Invalid email or password");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Connection error: Make sure backend is running");
    }
    setLoading(false);
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setErrorMsg("");
      try {
        const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        }).then(res => res.json());

        const apiBase = process.env.NEXT_PUBLIC_API_URL || '';
        const res = await fetch(`${apiBase}/api/auth/google`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            google_id: userInfo.sub,
            email: userInfo.email,
            name: userInfo.name,
            avatar: userInfo.picture,
          })
        });
        const data = await res.json();
        if (res.ok) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          window.location.href = "/lobby";
        } else {
          setErrorMsg(data.message || "Google authentication failed");
        }
      } catch (err: any) {
        console.error("Google Auth error:", err);
        setErrorMsg("Google Sign-In error: " + (err?.message || "Failed to authenticate"));
      }
      setLoading(false);
    },
    onError: (error) => {
      console.error('Google Login Failed', error);
      setErrorMsg("Google Authorization Window was closed or failed");
    }
  });

  return (
    <div className="flex-1 w-full min-h-screen flex items-center justify-center p-6 relative bg-[#0B0F19]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#0052FF]/20 via-[#0B0F19] to-[#0B0F19] -z-10" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-panel p-8 rounded-3xl relative overflow-hidden"
      >
        {loading && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-3">
            <Loader2 className="animate-spin text-[#00F0FF] w-12 h-12" />
            <span className="text-white font-bold text-sm">Authenticating...</span>
          </div>
        )}

        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#0052FF] to-[#00F0FF] flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.4)]">
            <Trophy className="text-white w-8 h-8" />
          </div>
        </div>
        
        <h2 className="text-3xl font-black text-white text-center mb-2">WELCOME BACK</h2>
        <p className="text-zinc-400 text-center mb-6 font-medium">Sign in to continue your draft journey.</p>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-bold text-center">
            {errorMsg}
          </div>
        )}

        {/* OFFICIAL GOOGLE OAUTH BUTTON */}
        <button 
          type="button" 
          onClick={() => loginWithGoogle()}
          className="w-full bg-white hover:bg-zinc-100 text-black font-black text-sm py-4 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-all flex items-center justify-center gap-3 mb-6"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
          Continue with Google
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div className="h-px bg-white/10 flex-1"></div>
          <span className="text-zinc-500 font-bold text-xs">OR SIGN IN WITH EMAIL</span>
          <div className="h-px bg-white/10 flex-1"></div>
        </div>

        <form onSubmit={handleStandardSubmit} className="space-y-4">
          <div>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input 
                type="email" 
                placeholder="Email Address" 
                required
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full bg-black/50 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white focus:outline-none focus:border-[#00F0FF] transition text-sm"
              />
            </div>
          </div>
          <div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input 
                type="password" 
                placeholder="Password" 
                required
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                className="w-full bg-black/50 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white focus:outline-none focus:border-[#00F0FF] transition text-sm"
              />
            </div>
          </div>

          <button type="submit" className="w-full bg-gradient-to-r from-[#0052FF] to-[#00F0FF] text-white font-black text-sm py-4 rounded-xl shadow-[0_0_20px_rgba(0,82,255,0.4)] hover:shadow-[0_0_30px_rgba(0,240,255,0.6)] transition-all flex items-center justify-center gap-2 mt-4">
            SIGN IN <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <p className="text-center text-zinc-400 mt-6 font-medium text-xs">
          Don't have an account? <Link href="/register" className="text-[#00F0FF] hover:underline font-bold">Create one</Link>
        </p>
      </motion.div>
    </div>
  );
}

export default function Login() {
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <LoginContent />
    </GoogleOAuthProvider>
  );
}
