import { Button } from "@/components/ui/button";

interface SuggestionChipsProps {
    onSelect: (text: string) => void;
}

const SUGGESTIONS = [
    "How can I be more productive?",
    "Review my goals for this week",
    "I'm feeling stressed",
    "Help me reflect on my day"
];

export function SuggestionChips({ onSelect }: SuggestionChipsProps) {
    return (
        <div className="flex flex-wrap gap-2 px-4 pb-2">
            {SUGGESTIONS.map((suggestion) => (
                <Button
                    key={suggestion}
                    variant="outline"
                    size="sm"
                    onClick={() => onSelect(suggestion)}
                    className="rounded-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs text-slate-600 dark:text-slate-300 transition-all hover:scale-105"
                >
                    {suggestion}
                </Button>
            ))}
        </div>
    );
}
