# Performance Optimization Recommendations for Lottery Results Page

## Issues Fixed ✅

1. **Loading State**: Added proper loading spinner that shows while fetching data
2. **Initial Display**: Fixed immediate "no lottery rounds yet" display on page load
3. **Error Handling**: Added proper error state display
4. **State Management**: Improved loading state logic with proper refs to prevent flicker

## Performance Optimization Suggestions

### 1. Implement SWR or React Query for Better Data Fetching

**Current Issue**: Manual fetch logic with custom intervals
**Solution**: Use SWR or TanStack Query for automatic caching, revalidation, and background updates

```typescript
// Install: npm install swr
import useSWR from "swr";

const fetcher = async (url: string) => {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error("Failed to fetch");
  const data = await response.json();
  return data.success ? data.data : [];
};

export default function DrawResults() {
  const {
    data: rounds = [],
    error,
    isLoading,
  } = useSWR(`${API_BASE_URL}/api/lottery/results`, fetcher, {
    refreshInterval: 30000, // Auto-refresh every 30s
    revalidateOnFocus: true,
    dedupingInterval: 10000, // Prevent duplicate requests
  });

  // No need for manual useEffect, SWR handles everything
}
```

### 2. Next.js App Router Optimizations

#### A. Server Components + Streaming

```typescript
// app/results/page.tsx (Server Component)
import { Suspense } from "react";
import ResultsTable from "./ResultsTable";
import ResultsTableSkeleton from "./ResultsTableSkeleton";

export default function ResultsPage() {
  return (
    <div>
      <Header />
      <Suspense fallback={<ResultsTableSkeleton />}>
        <ResultsTable />
      </Suspense>
    </div>
  );
}
```

#### B. Static Generation with ISR

```typescript
// Enable ISR for better performance
export const revalidate = 60; // Revalidate every 60 seconds

export default async function ResultsPage() {
  // Fetch data at build time + ISR
  const rounds = await fetchLotteryResults();

  return <ResultsClient initialData={rounds} />;
}
```

### 3. Blockchain Query Optimization

#### A. Batch RPC Calls

```typescript
// Instead of sequential calls, batch them
const batchProvider = new ethers.JsonRpcProvider("https://sepolia.base.org", {
  batchMaxSize: 10,
  batchMaxWait: 100,
});

// Use Promise.allSettled for parallel round fetching
const roundPromises = Array.from({ length: currentRoundNumber }, (_, i) =>
  lottery.getRound(i + 1).catch((err) => ({ error: err, roundNumber: i + 1 }))
);

const roundResults = await Promise.allSettled(roundPromises);
```

#### B. Smart Caching for Blockchain Data

```typescript
// Cache completed rounds (they never change)
const CACHE_KEY = "lottery-rounds-cache";
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

const getCachedRounds = () => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TTL) {
        return data;
      }
    }
  } catch {}
  return null;
};

const setCachedRounds = (rounds: LotteryRound[]) => {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        data: rounds,
        timestamp: Date.now(),
      })
    );
  } catch {}
};
```

### 4. Backend API Optimizations

#### A. Add Pagination

```typescript
// API: /api/lottery/results?page=1&limit=20
const { data: rounds, isLoading } = useSWR(
  `${API_BASE_URL}/api/lottery/results?page=1&limit=20`,
  fetcher
);
```

#### B. Add HTTP Caching Headers

```typescript
// In your backend API
app.get("/api/lottery/results", (req, res) => {
  res.set({
    "Cache-Control": "public, max-age=30, stale-while-revalidate=60",
    ETag: generateETag(data),
  });
  res.json(data);
});
```

### 5. Component-Level Optimizations

#### A. Virtualization for Large Lists

```typescript
// Install: npm install react-window
import { FixedSizeList as List } from "react-window";

const Row = ({ index, style }) => (
  <div style={style}>
    <ResultRow round={rounds[index]} />
  </div>
);

<List height={600} itemCount={rounds.length} itemSize={80}>
  {Row}
</List>;
```

#### B. Memoization

```typescript
import { memo, useMemo } from "react";

const ResultRow = memo(({ round }: { round: LotteryRound }) => {
  const formattedAddress = useMemo(
    () => formatAddress(round.winner),
    [round.winner]
  );

  // ... component JSX
});
```

### 6. Image and Asset Optimization

```typescript
// Optimize images with Next.js Image component
import Image from "next/image";

<Image
  src="/link.svg"
  alt="Link"
  width={12}
  height={12}
  priority={false} // Don't prioritize small icons
  loading="lazy" // Lazy load
/>;
```

### 7. Bundle Optimization

#### A. Dynamic Imports for Heavy Dependencies

```typescript
// Only load ethers when needed
const loadEthers = async () => {
  const { ethers } = await import("ethers");
  return ethers;
};
```

#### B. Tree Shaking for Ethers

```typescript
// Instead of: import { ethers } from "ethers";
import { JsonRpcProvider, Contract, ZeroAddress } from "ethers";
```

## Implementation Priority

1. **High Impact, Low Effort**: SWR implementation + caching headers
2. **Medium Impact, Medium Effort**: Blockchain call batching + local caching
3. **High Impact, High Effort**: Move to Server Components + ISR
4. **Low Impact, Low Effort**: Component memoization + image optimization

## Recommended Next Steps

1. Install and implement SWR for immediate performance gains
2. Add backend caching headers
3. Implement blockchain data caching
4. Consider Server Components migration for better initial load times

Each optimization can be implemented incrementally without breaking existing functionality.
