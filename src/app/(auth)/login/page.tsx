'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Leaf } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setError(null);
    console.log('[Login] Attempting login for:', data.email);

    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      console.log('[Login] Supabase response:', {
        user: authData.user?.id,
        session: !!authData.session,
        error: error?.message
      });

      if (error) throw error;

      console.log('[Login] Success! Redirecting to /dashboard...');
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      console.error('[Login] Error caught:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-6 text-primary">
          <Leaf className="w-6 h-6" />
        </div>
        <h2 className="text-3xl font-display font-semibold tracking-tight text-slate-900 dark:text-white">
          Welcome back
        </h2>
        <p className="text-slate-500 dark:text-slate-400">
          Enter your details to access your sanctuary
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            {...register('email')}
            className="bg-white/50 border-slate-200 focus:border-primary focus:ring-primary/20 transition-all h-11"
          />
          {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="password" className="text-slate-700 dark:text-slate-300">Password</Label>
            <Link href="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
          </div>
          <Input
            id="password"
            type="password"
            {...register('password')}
            className="bg-white/50 border-slate-200 focus:border-primary focus:ring-primary/20 transition-all h-11"
          />
          {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
        </div>

        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg text-center">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full h-12 rounded-xl text-md font-medium shadow-lg hover:shadow-primary/20 transition-all text-white" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>

      <div className="text-center text-sm">
        <span className="text-slate-500 dark:text-slate-400">Don't have an account? </span>
        <Link href="/signup" className="font-semibold text-primary hover:text-primary/80 transition-colors">
          Create account
        </Link>
      </div>
    </div>
  );
}
