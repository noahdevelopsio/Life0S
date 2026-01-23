export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-background-light dark:bg-background-dark">
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] -top-[200px] -right-[200px] animate-pulse" />
        <div className="absolute w-[500px] h-[500px] bg-primary/10 rounded-full blur-[80px] -bottom-[150px] -left-[150px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="w-full max-w-md relative z-10 glass rounded-3xl p-8 shadow-2xl">
        {children}
      </div>
    </div>
  );
}
