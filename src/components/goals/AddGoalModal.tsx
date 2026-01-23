'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase/client';
import { useUser } from '@/lib/hooks/useUser';

export function AddGoalModal({ onGoalCreated }: { onGoalCreated: () => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { user } = useUser();

    const [formData, setFormData] = useState({
        title: '',
        frequency: 'daily',
        target_value: 1,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);

        try {
            const { error } = await supabase.from('goals').insert({
                user_id: user.id,
                title: formData.title,
                frequency: formData.frequency,
                target_value: Number(formData.target_value),
                current_value: 0,
                streak: 0
            });

            if (error) throw error;

            onGoalCreated();
            setIsOpen(false);
            setFormData({ title: '', frequency: 'daily', target_value: 1 });
        } catch (error) {
            console.error(error);
            alert('Failed to create goal');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="rounded-full">
                    + New Goal
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Goal</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Goal Title</Label>
                        <Input
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g. Read 30 mins"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Frequency</Label>
                        <select
                            className="w-full h-11 rounded-standard border border-input bg-background px-3 py-2 text-sm"
                            value={formData.frequency}
                            onChange={e => setFormData({ ...formData, frequency: e.target.value })}
                        >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label>Target Value (per {formData.frequency})</Label>
                        <Input
                            type="number"
                            min="1"
                            value={formData.target_value}
                            onChange={e => setFormData({ ...formData, target_value: parseInt(e.target.value) || 0 })}
                            required
                        />
                    </div>

                    <Button type="submit" className="w-full mt-4" disabled={loading}>
                        {loading ? 'Creating...' : 'Create Goal'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
