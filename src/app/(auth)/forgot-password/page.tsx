'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { KeyRound } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const forgotPasswordSchema = z.object({
    email: z.string().email(),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordForm>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = async (data: ForgotPasswordForm) => {
        setLoading(true);
        setError(null);
        setSuccess(false);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
                redirectTo: window.location.origin + '/auth/callback?next=/settings/reset-password',
            });

            if (error) throw error;
            setSuccess(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-6 text-primary">
                    <KeyRound className="w-6 h-6" />
                </div>
                <h2 className="text-3xl font-display font-semibold tracking-tight text-slate-900 dark:text-white">
                    Reset password
                </h2>
                <p className="text-slate-500 dark:text-slate-400">
                    Enter your email and we'll send you a link to reset your password
                </p>
            </div>

            {success ? (
                <div className="p-4 bg-green-50 border border-green-100 rounded-xl text-center space-y-4">
                    <h3 className="text-green-800 font-semibold">Check your email</h3>
                    <p className="text-green-600 text-sm">
                        We've sent you a password reset link. Please check your inbox (and spam folder).
                    </p>
                    <Button
                        variant="outline"
                        className="w-full mt-4"
                        onClick={() => router.push('/login')}
                    >
                        Back to Sign in
                    </Button>
                </div>
            ) : (
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

                    {error && (
                        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg text-center">
                            {error}
                        </div>
                    )}

                    <Button type="submit" className="w-full h-12 rounded-xl text-md font-medium shadow-lg hover:shadow-primary/20 transition-all text-white" disabled={loading}>
                        {loading ? 'Sending link...' : 'Send Reset Link'}
                    </Button>
                </form>
            )}

            <div className="text-center text-sm">
                <Link href="/login" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                    Back to Sign in
                </Link>
            </div>
        </div>
    );
}
