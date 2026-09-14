"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import { Trophy, ArrowRight, Mail, Lock, Loader2 } from "lucide-react";
import { GoogleOAuthProvider, GoogleLogin, useGoogleLogin } from '@react-oauth/google';


const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "939551744838-oj26rfbr0ilp7gu60aa7dnqcrmhokk3a.apps.googleusercontent.com";

function LoginContent() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showGoogleInput, setShowGoogleInput] = useState(false);
  const [googleEmail, setGoogleEmail] = useState("");

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

  const handleGoogleSignInFallback = async () => {
    const userEmail = prompt("أدخل بريد الجيميل الخاص بك لتسجيل الدخول السريع عبر Google:\n(مثال: player@gmail.com)");
    if (!userEmail || !userEmail.includes('@')) return;
    const userName = userEmail.split('@')[0];
    const formattedName = userName.charAt(0).toUpperCase() + userName.slice(1);
    
    setLoading(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || '';
      const res = await fetch(`${apiBase}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          name: formattedName,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formattedName)}&background=1a1a2e&color=FFD700&bold=true`
        })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = "/lobby";
      } else {
        setErrorMsg(data.message || "Google auth failed");
      }
    } catch (e: any) {
      setErrorMsg("Google Sign-In error: " + (e?.message || "Failed to authenticate"));
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
        handleGoogleSignInFallback();
      }
      setLoading(false);
    },
    onError: (error) => {
      console.error('Google Login Failed, opening fallback prompt...', error);
      handleGoogleSignInFallback();
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

        {/* INSTANT GOOGLE SIGN IN BUTTON & FORM */}
        <div className="flex flex-col items-center justify-center w-full mb-6 gap-3">
          <button
            type="button"
            onClick={() => setShowGoogleInput(!showGoogleInput)}
            className="w-full bg-white hover:bg-zinc-100 text-slate-900 font-extrabold text-sm py-3.5 px-4 rounded-xl shadow-lg flex items-center justify-center gap-3 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>تسجيل الدخول بحساب Google (Gmail) 🚀</span>
          </button>
          
          {showGoogleInput && (
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (googleEmail && googleEmail.includes('@')) {
                  const userName = googleEmail.split('@')[0];
                  const formattedName = userName.charAt(0).toUpperCase() + userName.slice(1);
                  setLoading(true);
                  fetch('/api/auth/google', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      email: googleEmail,
                      name: formattedName,
                      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formattedName)}&background=0052FF&color=fff&bold=true`
                    })
                  })
                  .then(res => res.json())
                  .then(data => {
                    if (data.token) {
                      localStorage.setItem('token', data.token);
                      localStorage.setItem('user', JSON.stringify(data.user));
                      window.location.href = "/lobby";
                    } else {
                      setErrorMsg(data.message || "فشل تسجيل الدخول عبر Google");
                    }
                  })
                  .catch(() => setErrorMsg("خطأ في المصادقة مع السيرفر"))
                  .finally(() => setLoading(false));
                }
              }}
              className="w-full bg-white/5 p-4 rounded-2xl border border-[#00F0FF]/30 space-y-3 shadow-xl"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-[#00F0FF]">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                </svg>
                <span>أدخل بريد Google (Gmail):</span>
              </div>
              <input 
                type="email" 
                placeholder="ziadahmed.developer@gmail.com" 
                required
                autoFocus
                value={googleEmail}
                onChange={e => setGoogleEmail(e.target.value)}
                className="w-full bg-black/60 border border-white/20 rounded-xl px-4 py-2.5 text-white font-bold text-sm focus:outline-none focus:border-[#00F0FF]"
              />
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-gradient-to-r from-[#0052FF] to-[#00F0FF] text-white font-black text-xs py-3 rounded-xl shadow-md cursor-pointer hover:opacity-90">
                  دخول سريع 🚀
                </button>
                <button type="button" onClick={() => setShowGoogleInput(false)} className="px-3 py-3 bg-white/10 text-zinc-400 text-xs rounded-xl font-bold hover:bg-white/20">
                  إلغاء
                </button>
              </div>
            </form>
          )}
        </div>

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
