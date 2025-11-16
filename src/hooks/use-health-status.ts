import {useCallback, useEffect, useRef, useState} from "react";
import {DEFAULT_INTERVAL, DEGRADED_LATENCY_MS, type HealthState, type HealthStatus} from "@/interfaces.ts";
import {fetchWithTimeout, getBaseUrl} from "@/services/api.ts";

export function useHealthStatus(interval: number = DEFAULT_INTERVAL) {
    const [status, setStatus] = useState<HealthStatus>({status: "down", lastChecked: new Date(), error: "Not yet checked"});
    const mountedRef = useRef(true);

    const check = useCallback(async () => {
        const start = performance.now();
        let next: HealthStatus;
        try {
            const res = await fetchWithTimeout(`${getBaseUrl()}/health`, {headers: {"Accept": "application/json"}});
            const end = performance.now();
            const latencyMs = Math.round(end - start);
            if (!res.ok) {
                next = {status: "down", lastChecked: new Date(), latencyMs, error: `HTTP ${res.status}`};
            } else {
                let body: any = null;
                try { body = await res.json(); } catch (e) { /* ignore parse */ }
                // Determine health state.
                const state: HealthState = latencyMs > DEGRADED_LATENCY_MS ? "degraded" : "up";
                next = {status: state, lastChecked: new Date(), latencyMs, error: body?.message && state !== "up" ? body.message : undefined};
            }
        } catch (err: any) {
            next = {status: "down", lastChecked: new Date(), error: err?.name === 'AbortError' ? 'Timeout' : err?.message || 'Network error'};
        }
        if (mountedRef.current) setStatus(next);
    }, []);

    useEffect(() => {
        mountedRef.current = true;
        // Initial check shortly after mount.
        check();
        const id = setInterval(check, interval);
        return () => {
            mountedRef.current = false;
            clearInterval(id);
        };
    }, [check, interval]);

    return {status, refresh: check};
}

