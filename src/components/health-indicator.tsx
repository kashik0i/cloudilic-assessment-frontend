import {cn} from "@/lib/utils";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import {useHealthStatus} from "@/hooks/use-health-status.ts";
import {useEffect} from "react";

export function HealthIndicator({className}: {className?: string}) {
    const {status, refresh} = useHealthStatus();

    // Optional: auto-refresh after tab becomes visible again.
    useEffect(() => {
        function onVis() { if (document.visibilityState === 'visible') refresh(); }
        document.addEventListener('visibilitychange', onVis);
        return () => document.removeEventListener('visibilitychange', onVis);
    }, [refresh]);

    const colorMap: Record<string, string> = {
        up: 'bg-green-500',
        degraded: 'bg-yellow-500',
        down: 'bg-red-500',
    };
    const labelMap: Record<string, string> = {
        up: 'Backend: Healthy',
        degraded: 'Backend: Slow',
        down: 'Backend: Unreachable',
    };

    return (
        <div className={cn("mt-4", className)} aria-live="polite">
            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        type="button"
                        onClick={() => refresh()}
                        aria-label="Backend health status"
                        className="flex items-center gap-2 text-xs text-zinc-600 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                    >
                        <span
                            className={cn("size-2.5 rounded-full animate-pulse", colorMap[status.status])}
                            aria-hidden="true"
                        />
                        <span>{labelMap[status.status]}</span>
                        {typeof status.latencyMs === 'number' && (
                            <span className="text-[10px] text-zinc-500 dark:text-zinc-400">{status.latencyMs}ms</span>
                        )}
                    </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                    <div className="space-y-1">
                        <p className="font-medium">{labelMap[status.status]}</p>
                        <p className="text-[10px]">Last check: {status.lastChecked.toLocaleTimeString()}</p>
                        {status.error && (
                            <p className="text-[10px] text-red-400">{status.error}</p>
                        )}
                        <p className="text-[10px] text-zinc-400">Click to retry</p>
                    </div>
                </TooltipContent>
            </Tooltip>
        </div>
    );
}

