import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export function Spinner({ className }: { className?: string }) {
    return (
        <div className="flex items-center justify-center w-full h-full min-h-[200px]">
            <Loader2 className={cn("w-8 h-8 animate-spin text-primary", className)} />
        </div>
    );
}
