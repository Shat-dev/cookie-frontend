(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push([typeof document === "object" ? document.currentScript : undefined, {

"[project]/src/utils/api.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
/**
 * Safely construct API URLs by ensuring no double slashes
 */ __turbopack_context__.s({
    "getApiEndpoint": ()=>getApiEndpoint,
    "getApiUrl": ()=>getApiUrl
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
function getApiUrl() {
    const baseUrl = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    // Remove trailing slash if present
    return baseUrl.replace(/\/$/, "");
}
function getApiEndpoint(path) {
    const baseUrl = getApiUrl();
    // Ensure path starts with /
    const cleanPath = path.startsWith("/") ? path : "/".concat(path);
    return "".concat(baseUrl).concat(cleanPath);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/context/CountdownContext.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "CountdownProvider": ()=>CountdownProvider,
    "useCountdown": ()=>useCountdown
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/api.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
const FREEZE_SEC = Number(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_FREEZE_SEC || 180);
const WINNER_HOLD_MS = Number(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_WINNER_HOLD_MS || 15000);
const CountdownContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
const CountdownProvider = (param)=>{
    let { children } = param;
    _s();
    const [timeLeft, setTimeLeft] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [drawInfo, setDrawInfo] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const fetchDrawInfo = async ()=>{
        try {
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            // ✅ NEW: Use unified endpoint for better synchronization
            const endpoint = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getApiEndpoint"])("/api/automation/unified-status");
            const controller = new AbortController();
            const timeoutId = setTimeout(()=>controller.abort(), 10000);
            const res = await fetch(endpoint, {
                method: "GET",
                mode: "cors",
                cache: "no-store",
                signal: controller.signal,
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                }
            });
            clearTimeout(timeoutId);
            if (!res.ok) throw new Error("HTTP ".concat(res.status, ": ").concat(res.statusText));
            const json = await res.json();
            if (!(json === null || json === void 0 ? void 0 : json.success)) throw new Error((json === null || json === void 0 ? void 0 : json.error) || "API unsuccessful");
            // ✅ NEW: Transform unified response to DrawInfo format
            const unifiedData = json.data;
            const automation = unifiedData.automation;
            const roundData = unifiedData.roundData;
            // Convert to DrawInfo format for compatibility
            const drawInfo = {
                drawNumber: unifiedData.drawNumber || 1,
                hasActiveDraw: (automation === null || automation === void 0 ? void 0 : automation.hasActiveDraw) || false,
                drawTime: (automation === null || automation === void 0 ? void 0 : automation.drawTime) || null,
                freezeTime: (automation === null || automation === void 0 ? void 0 : automation.freezeTime) || null,
                totalEntries: (automation === null || automation === void 0 ? void 0 : automation.totalEntries) || 0,
                isCompleted: (automation === null || automation === void 0 ? void 0 : automation.isCompleted) || false,
                round: (automation === null || automation === void 0 ? void 0 : automation.round) || unifiedData.currentRound || 0,
                // Additional automation-specific data
                automationEnabled: (automation === null || automation === void 0 ? void 0 : automation.isEnabled) || false,
                roundState: roundData ? {
                    isActive: roundData.isActive,
                    start: roundData.start,
                    end: roundData.end,
                    winner: roundData.winner,
                    winningTokenId: roundData.winningTokenId
                } : null
            };
            return drawInfo;
        } catch (err) {
            console.error("❌ Error fetching unified draw info:", err);
            return null;
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CountdownProvider.useEffect": ()=>{
            let lastFetchTime = 0;
            let cached = null;
            let winnerHoldUntil = 0; // hold “Winner chosen!” briefly after completion
            const fetchData = {
                "CountdownProvider.useEffect.fetchData": async ()=>{
                    const d = await fetchDrawInfo();
                    if (!d) {
                        setError("Please wait");
                        setLoading(false);
                        return;
                    }
                    cached = d;
                    setDrawInfo(d);
                    setError("");
                    setLoading(false);
                    lastFetchTime = Date.now();
                    if (d.isCompleted) {
                        winnerHoldUntil = Date.now() + WINNER_HOLD_MS;
                    }
                }
            }["CountdownProvider.useEffect.fetchData"];
            const fmt = {
                "CountdownProvider.useEffect.fmt": (sec)=>{
                    const h = Math.floor(sec / 3600);
                    const m = Math.floor(sec % 3600 / 60);
                    const s = sec % 60;
                    return "".concat(String(h).padStart(2, "0"), ":").concat(String(m).padStart(2, "0"), ":").concat(String(s).padStart(2, "0"));
                }
            }["CountdownProvider.useEffect.fmt"];
            const updateCountdown = {
                "CountdownProvider.useEffect.updateCountdown": ()=>{
                    if (!cached) {
                        setTimeLeft("Loading...");
                        return;
                    }
                    // Keep “Winner chosen!” visible even if next round already started
                    if (winnerHoldUntil > Date.now()) {
                        setTimeLeft("Winner chosen!");
                        return;
                    }
                    const now = Math.floor(Date.now() / 1000);
                    // No active draw yet
                    if (!cached.hasActiveDraw) {
                        setTimeLeft("Round starting");
                        return;
                    }
                    var _cached_drawTime;
                    const end = (_cached_drawTime = cached.drawTime) !== null && _cached_drawTime !== void 0 ? _cached_drawTime : 0;
                    var _cached_freezeTime;
                    const freezeAt = (_cached_freezeTime = cached.freezeTime) !== null && _cached_freezeTime !== void 0 ? _cached_freezeTime : end ? end - FREEZE_SEC : 0;
                    const secsToFreeze = Math.max(0, freezeAt > 0 ? freezeAt - now : 0);
                    const secsToEnd = Math.max(0, end > 0 ? end - now : 0);
                    // After end → Automation/VRF
                    if (end > 0 && now >= end) {
                        if (cached.isCompleted) {
                            setTimeLeft("Winner chosen!");
                            if (winnerHoldUntil === 0) {
                                winnerHoldUntil = Date.now() + WINNER_HOLD_MS;
                            }
                        } else {
                            setTimeLeft("awaiting winner...");
                        }
                        if (Date.now() - lastFetchTime > 2000) void fetchData();
                        return;
                    }
                    // Freeze window
                    if (freezeAt > 0 && now >= freezeAt && now < end) {
                        setTimeLeft("drawing...");
                        return;
                    }
                    // Pre-freeze countdown
                    if (end > 0 && now < freezeAt) {
                        setTimeLeft(fmt(secsToFreeze)); // mm:ss
                        return;
                    }
                    // Fallback
                    setTimeLeft(secsToEnd > 0 ? fmt(secsToEnd) : "Round pending");
                }
            }["CountdownProvider.useEffect.updateCountdown"];
            void fetchData();
            const dataFetchInterval = setInterval(fetchData, 30_000);
            const countdownInterval = setInterval(updateCountdown, 1000);
            return ({
                "CountdownProvider.useEffect": ()=>{
                    clearInterval(dataFetchInterval);
                    clearInterval(countdownInterval);
                }
            })["CountdownProvider.useEffect"];
        }
    }["CountdownProvider.useEffect"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CountdownContext.Provider, {
        value: {
            timeLeft,
            loading,
            error,
            drawInfo
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/context/CountdownContext.tsx",
        lineNumber: 210,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(CountdownProvider, "jVQwyz8xvkx0cvC+Zq7iB39RDMQ=");
_c = CountdownProvider;
const useCountdown = ()=>{
    _s1();
    const ctx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(CountdownContext);
    if (!ctx) throw new Error("useCountdown must be used within a CountdownProvider");
    return ctx;
};
_s1(useCountdown, "/dMy7t63NXD4eYACoT93CePwGrg=");
var _c;
__turbopack_context__.k.register(_c, "CountdownProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
}]);

//# sourceMappingURL=src_37f21852._.js.map