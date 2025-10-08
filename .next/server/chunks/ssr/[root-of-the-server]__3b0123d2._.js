module.exports = {

"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}}),
"[project]/src/utils/api.ts [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

/**
 * Safely construct API URLs by ensuring no double slashes
 */ __turbopack_context__.s({
    "getApiEndpoint": ()=>getApiEndpoint,
    "getApiUrl": ()=>getApiUrl
});
function getApiUrl() {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    // Remove trailing slash if present
    return baseUrl.replace(/\/$/, "");
}
function getApiEndpoint(path) {
    const baseUrl = getApiUrl();
    // Ensure path starts with /
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${baseUrl}${cleanPath}`;
}
}),
"[project]/src/context/CountdownContext.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "CountdownProvider": ()=>CountdownProvider,
    "useCountdown": ()=>useCountdown
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/api.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
const FREEZE_SEC = Number(process.env.NEXT_PUBLIC_FREEZE_SEC || 180);
const WINNER_HOLD_MS = Number(process.env.NEXT_PUBLIC_WINNER_HOLD_MS || 15000);
const CountdownContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(undefined);
const CountdownProvider = ({ children })=>{
    const [timeLeft, setTimeLeft] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [drawInfo, setDrawInfo] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const fetchDrawInfo = async ()=>{
        try {
            if ("TURBOPACK compile-time truthy", 1) return null;
            //TURBOPACK unreachable
            ;
            // ✅ NEW: Use unified endpoint for better synchronization
            const endpoint = undefined;
            const controller = undefined;
            const timeoutId = undefined;
            const res = undefined;
            const json = undefined;
            // ✅ NEW: Transform unified response to DrawInfo format
            const unifiedData = undefined;
            const automation = undefined;
            const roundData = undefined;
            // Convert to DrawInfo format for compatibility
            const drawInfo = undefined;
        } catch (err) {
            console.error("❌ Error fetching unified draw info:", err);
            return null;
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        let lastFetchTime = 0;
        let cached = null;
        let winnerHoldUntil = 0; // hold “Winner chosen!” briefly after completion
        const fetchData = async ()=>{
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
        };
        const fmt = (sec)=>{
            const h = Math.floor(sec / 3600);
            const m = Math.floor(sec % 3600 / 60);
            const s = sec % 60;
            return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
        };
        const updateCountdown = ()=>{
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
            const end = cached.drawTime ?? 0;
            const freezeAt = cached.freezeTime ?? (end ? end - FREEZE_SEC : 0);
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
        };
        void fetchData();
        const dataFetchInterval = setInterval(fetchData, 30_000);
        const countdownInterval = setInterval(updateCountdown, 1000);
        return ()=>{
            clearInterval(dataFetchInterval);
            clearInterval(countdownInterval);
        };
    }, []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(CountdownContext.Provider, {
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
const useCountdown = ()=>{
    const ctx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(CountdownContext);
    if (!ctx) throw new Error("useCountdown must be used within a CountdownProvider");
    return ctx;
};
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/dynamic-access-async-storage.external.js [external] (next/dist/server/app-render/dynamic-access-async-storage.external.js, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/dynamic-access-async-storage.external.js", () => require("next/dist/server/app-render/dynamic-access-async-storage.external.js"));

module.exports = mod;
}}),

};

//# sourceMappingURL=%5Broot-of-the-server%5D__3b0123d2._.js.map