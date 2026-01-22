import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden bg-background-light dark:bg-background-dark">
      {/* Floating orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-80 h-80 bg-primary/20 rounded-full blur-3xl -top-20 -right-20 animate-float"></div>
        <div className="absolute w-64 h-64 bg-primary/15 rounded-full blur-3xl -bottom-16 -left-16 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="w-full max-w-sm flex flex-col items-center text-center space-y-12 z-10">
        {/* Logo/Icon */}
        <div className="relative w-full h-48 flex justify-center items-center">
          <div className="absolute w-32 h-32 bg-gradient-to-tr from-primary/40 to-white/60 dark:to-white/20 rounded-full shadow-2xl animate-float"></div>
          <div className="absolute w-12 h-12 bg-gradient-to-bl from-primary/30 to-white/40 dark:to-white/10 rounded-full animate-float shadow-xl" style={{ animationDelay: '-2s', top: '10%', right: '25%' }}></div>
          <div className="absolute w-8 h-8 bg-white/40 rounded-full animate-float shadow-lg" style={{ animationDelay: '-4s', bottom: '20%', left: '30%' }}></div>
        </div>

        {/* Content */}
        <div className="space-y-4 px-4">
          <h1 className="text-5xl font-light tracking-tight text-slate-900 dark:text-white leading-[1.1]">
            Welcome to <br />
            <span className="font-bold text-primary">LifeOS</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg font-normal leading-relaxed">
            Your sanctuary for mindful productivity and emotional clarity.
          </p>
        </div>

        {/* Buttons */}
        <div className="w-full px-4 pt-8">
          <Link
            href="/login"
            className="w-full bg-primary/90 backdrop-blur-sm hover:bg-primary text-white flex items-center justify-between px-8 py-5 rounded-full font-semibold text-lg transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/20"
          >
            <span>Get Started</span>
            <div className="bg-white/20 p-2 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </div>

        {/* Footer */}
        <div className="pt-8 flex flex-col items-center space-y-8">
          <div className="flex space-x-2">
            <div className="w-6 h-1.5 rounded-full bg-primary"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700"></div>
          </div>
          <Link
            href="/login"
            className="text-sm font-medium text-slate-500 dark:text-slate-500 hover:text-primary transition-colors"
          >
            Already have an account? <span className="text-primary font-bold">Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
