'use client';

const OPTIONS = [
    "How can I be more consistent?",
    "Reflect on my week",
    "Suggest a goal for me",
    "I'm feeling stressed",
];

export function SuggestionChips({ onSelect }: { onSelect: (text: string) => void }) {
    return (
        <div className="flex gap-2 overflow-x-auto pb-2 px-6 scrollbar-hide">
            {OPTIONS.map((opt) => (
                <button
                    key={opt}
                    onClick={() => onSelect(opt)}
                    className="whitespace-nowrap px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                    {opt}
                </button>
            ))}
        </div>
    );
}
