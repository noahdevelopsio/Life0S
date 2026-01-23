'use client';

import 'regenerator-runtime/runtime';
import React, { useEffect, useState } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceInputProps {
    onTranscript: (text: string) => void;
}

export function VoiceInput({ onTranscript }: VoiceInputProps) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const commands = [
        {
            command: 'reset',
            callback: ({ resetTranscript }: any) => resetTranscript()
        },
    ];

    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition({ commands });

    useEffect(() => {
        if (transcript) {
            // Logic to debounced update or similar could go here
            // For now we might just let user manually confirm or continuously update?
            // The parent expects "onTranscript", let's call it when listening stops or periodically
        }
    }, [transcript]);

    // When listening stops, send full transcript
    useEffect(() => {
        if (!listening && transcript) {
            onTranscript(transcript);
            resetTranscript();
        }
    }, [listening]);

    if (!isClient) return null;

    if (!browserSupportsSpeechRecognition) {
        return <span className="text-xs text-red-400">Browser doesn't support speech recognition.</span>;
    }

    const toggleListening = () => {
        if (listening) {
            SpeechRecognition.stopListening();
        } else {
            SpeechRecognition.startListening({ continuous: true });
        }
    };

    return (
        <div className="flex items-center gap-2">
            <Button
                type="button"
                onClick={toggleListening}
                variant={listening ? "destructive" : "secondary"}
                size="icon"
                className={cn("rounded-full transition-all duration-300", listening && "animate-pulse ring-4 ring-red-200")}
            >
                {listening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>
            {listening && <span className="text-sm text-slate-500 animate-pulse">Listening...</span>}
        </div>
    );
}
