'use client';

import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden relative selection:bg-primary/30">

      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          animate={{ x: [0, 50, 0], y: [0, -30, 0], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] -top-[300px] -right-[200px]"
        />
        <motion.div
          animate={{ x: [0, -40, 0], y: [0, 60, 0], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute w-[600px] h-[600px] bg-primary/15 rounded-full blur-[100px] -bottom-[200px] -left-[200px]"
        />
      </div>

      <div className="relative z-10 w-full max-w-lg flex flex-col items-center text-center space-y-12">

        {/* Animated Logo/Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative w-48 h-48 flex justify-center items-center"
        >
          <div className="absolute inset-0 orb-gradient rounded-full opacity-90 animate-float" />
          <div className="absolute inset-4 bg-white/30 backdrop-blur-md rounded-full shadow-inner border border-white/20" />
          <div className="absolute w-20 h-20 bg-white/80 rounded-full shadow-lg flex items-center justify-center">
            <div className="w-10 h-10 border-2 border-primary/50 rounded-full" />
          </div>
        </motion.div>

        {/* Content */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <h1 className="text-6xl font-light tracking-tight text-slate-900 dark:text-white leading-[1.1]">
              Welcome to <br />
              <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-primary to-green-700">LifeOS</span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-slate-600 dark:text-slate-300 text-lg font-light leading-relaxed max-w-sm mx-auto"
          >
            Your sanctuary for mindful productivity<br />and emotional clarity.
          </motion.p>
        </div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="w-full px-8 pt-4"
        >
          <Link
            href="/login"
            className="group relative w-full bg-[#5A7C5F] overflow-hidden text-white flex items-center justify-center px-8 py-4 rounded-2xl font-medium text-lg transition-all hover:shadow-xl hover:shadow-[#5A7C5F]/30 active:scale-[0.98]"
          >
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
            <span className="relative mr-2">Get Started</span>
            <svg className="w-5 h-5 relative transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>

          <div className="mt-8">
            <Link
              href="/login"
              className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition-colors duration-300"
            >
              Already have an account? <span className="text-slate-900 dark:text-white font-medium underline decoration-primary/50 underline-offset-4">Sign In</span>
            </Link>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
