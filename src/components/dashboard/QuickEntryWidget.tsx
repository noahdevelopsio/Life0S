import 'regenerator-runtime/runtime';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardCard } from './DashboardCard';
import { Button } from '@/components/ui/button'; // Assuming Button is used/exported correctly, usually shadcn/ui
import { Mic, ArrowRight, MicOff } from 'lucide-react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

export function QuickEntryWidget({ onEntryCreated }: { onEntryCreated: () => void }) {
    const [content, setContent] = useState('');
    const [isMounted, setIsMounted] = useState(false);
    const router = useRouter();

    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition();

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (transcript) {
            setContent(transcript);
        }
    }, [transcript]);

    const toggleListening = () => {
        if (listening) {
            SpeechRecognition.stopListening();
        } else {
            resetTranscript();
            SpeechRecognition.startListening({ continuous: true });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (listening) {
            SpeechRecognition.stopListening();
        }
        router.push(`/dashboard/journal/new?initial=${encodeURIComponent(content)}`);
    };

    if (!isMounted) return null;

    return (
        <DashboardCard
            className="bg-[#648468] text-white relative overflow-hidden"
        >
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-xl font-semibold text-white">Solma AI Journal</h3>
                        <p className="text-white/60 text-sm">
                            {listening ? 'Listening...' : 'Listening your story...'}
                        </p>
                    </div>
                    {browserSupportsSpeechRecognition && (
                        <button
                            onClick={toggleListening}
                            className={`w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105 ${listening
                                    ? 'bg-red-500 text-white ring-4 ring-red-300/30'
                                    : 'bg-white text-primary'
                                }`}
                        >
                            {listening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                        </button>
                    )}
                </div>

                {/* Waveform Visualization */}
                <div className="flex items-end justify-center gap-[6px] h-12 mb-6">
                    {[...Array(12)].map((_, i) => (
                        <div
                            key={i}
                            className={`w-[3px] bg-white/80 rounded-full ${listening ? 'animate-pulse' : ''}`}
                            style={{
                                height: listening
                                    ? `${Math.max(20, Math.random() * 100)}%`
                                    : '20%', // Static when not listening
                                transition: 'height 0.2s ease',
                                animationDelay: `${i * 0.1}s`
                            }}
                        />
                    ))}
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="bg-white/90 dark:bg-white/10 backdrop-blur-md rounded-3xl p-2 pl-4 flex items-center justify-between">
                        <input
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Type here or dictate..."
                            className="bg-transparent border-none focus:outline-none text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/50 w-full"
                        />
                        <Button size="icon" className="rounded-full bg-primary text-white h-9 w-9 shrink-0 ml-2">
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </div>
                </form>
            </div>
        </DashboardCard>
    );
}
