'use client';

import { ChatInterface } from '@/components/ai/ChatInterface';
import { Suspense } from 'react';

export default function AIPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <Suspense fallback={<div className="h-screen w-full flex items-center justify-center">Loading AI...</div>}>
        <ChatInterface />
      </Suspense>
    </div>
  );
}
