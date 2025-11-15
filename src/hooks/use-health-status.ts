import {useEffect, useRef, useState, useCallback} from "react";
import type {HealthStatus, HealthState} from "@/interfaces.ts";

const DEFAULT_INTERVAL = 20_000; // 20s polling
const TIMEOUT_MS = 5_000; // abort if backend doesn't respond quickly
const DEGRADED_LATENCY_MS = 1500; // threshold for degraded state

function getBaseUrl() {
    // Allow configuration via env, fallback to relative path.
    return import.meta.env.VITE_API_URL || "";
}

async function fetchWithTimeout(input: RequestInfo, init?: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
        const res = await fetch(input, {...init, signal: controller.signal});
        return res;
    } finally {
        clearTimeout(id);
    }
}

export function useHealthStatus(interval: number = DEFAULT_INTERVAL) {
    const [status, setStatus] = useState<HealthStatus>({status: "down", lastChecked: new Date(), error: "Not yet checked"});
    const mountedRef = useRef(true);

    const check = useCallback(async () => {
        const start = performance.now();
        let next: HealthStatus;
        try {
            const res = await fetchWithTimeout(`${getBaseUrl()}/api/health`, {headers: {"Accept": "application/json"}});
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

