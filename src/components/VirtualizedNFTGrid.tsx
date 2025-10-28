import React, {
  useCallback,
  useState,
  useRef,
  useEffect,
  useMemo,
} from "react";
import Image from "next/image";

const IMAGE_CID = "bafybeigh3dk6a2sq5efrohnwboovpbrs7xbddxw23z6untjv32sk4ninsu";

const METADATA_CID =
  "bafybeiebn7qamvm6mpyce2n7acryqhlin3loyi3npqvdz2zn22xxfvaqvi";

// Fallback direct IPFS gateways (same as enter page)
const DIRECT_IPFS_GATEWAYS = [
  `https://gateway.pinata.cloud/ipfs/${METADATA_CID}`,
  `https://ipfs.io/ipfs/${METADATA_CID}`,
  `https://cloudflare-ipfs.com/ipfs/${METADATA_CID}`,
];

const imageUrlFor = (
  tokenId: string,
  useDirectGateway: boolean = false,
  gatewayIndex: number = 0
) => {
  // Every NFT metadata points to art.png inside IMAGE_CID
  const base =
    gatewayIndex < DIRECT_IPFS_GATEWAYS.length
      ? DIRECT_IPFS_GATEWAYS[gatewayIndex].replace(METADATA_CID, IMAGE_CID)
      : `https://ipfs.io/ipfs/${IMAGE_CID}`;

  return `${base}/art.png`;
};

interface NFT {
  tokenId: string;
  wallet: string;
}

interface VirtualizedNFTGridProps {
  nfts: NFT[];
  loading?: boolean;
  error?: string;
}

// Configuration constants
const BATCH_SIZE = 50;
const IMAGE_LOAD_TIMEOUT = 15000; // 15 seconds timeout
const MAX_RETRIES = 2;
const MAX_CONCURRENT_PREFETCH = 4; // Max concurrent prefetch requests
const COLUMNS = 4;

interface ImageState {
  status: "loading" | "loaded" | "error" | "timeout";
  retryCount: number;
  timeoutId?: NodeJS.Timeout;
  src: string; // Stable src URL to prevent unnecessary changes
  useDirectGateway: boolean; // Track if using direct IPFS gateway
  gatewayIndex: number; // Track current gateway index for fallback
}

// Memoized NFT Item component to prevent unnecessary re-renders
const NFTItem = React.memo<{
  nft: NFT;
  isInLoadedBatch: boolean;
  imageState: ImageState | undefined;
  onImageLoad: (tokenId: string) => void;
  onImageError: (tokenId: string) => void;
  onRetryImage: (tokenId: string) => void;
  eager?: boolean;
}>(
  ({
    nft,
    isInLoadedBatch,
    imageState,
    onImageLoad,
    onImageError,
    onRetryImage,
    eager,
  }) => {
    const status = imageState?.status || "loading";
    const canRetry = imageState && imageState.retryCount < MAX_RETRIES;
    const stableSrc = imageState?.src || imageUrlFor(nft.tokenId);

    return (
      <div className="p-0.5 sm:p-1">
        <div className="rounded-xs">
          <div className="p-2 sm:p-3 pb-2 sm:pb-4 text-center">
            <div className="relative w-14 h-14 sm:w-18 sm:h-18 md:w-22 md:h-22 mx-auto">
              {!isInLoadedBatch || status === "loading" ? (
                <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-md flex items-center justify-center">
                  <div className="h-6 w-6 sm:h-8 sm:w-8 border-2 border-[#dddddd] border-t-[#FFFFFF] rounded-full animate-spin"></div>
                </div>
              ) : status === "error" ? (
                <div className="absolute inset-0 bg-gray-100 rounded-md flex items-center justify-center">
                  <span className="text-xs text-gray-500">No Image</span>
                </div>
              ) : status === "timeout" && canRetry ? (
                <div
                  className="absolute inset-0 bg-yellow-100 rounded-md flex items-center justify-center cursor-pointer hover:bg-yellow-200 transition-colors"
                  onClick={() => onRetryImage(nft.tokenId)}
                  title="Click to retry loading"
                >
                  <span className="text-xs text-yellow-700">↻</span>
                </div>
              ) : status === "timeout" && !canRetry ? (
                <div className="absolute inset-0 bg-gray-100 rounded-md flex items-center justify-center">
                  <span className="text-xs text-gray-500">?</span>
                </div>
              ) : null}

              {isInLoadedBatch && status !== "error" && (
                <Image
                  src={stableSrc}
                  alt={`Cookie ${nft.tokenId}`}
                  fill
                  className={`object-cover rounded-md transition-opacity duration-200 ${
                    status === "loaded" ? "opacity-100" : "opacity-0"
                  }`}
                  onLoad={() => onImageLoad(nft.tokenId)}
                  onError={() => onImageError(nft.tokenId)}
                  loading={eager ? "eager" : "lazy"}
                  priority={!!eager}
                  fetchPriority={eager ? "high" : "auto"}
                  sizes="(max-width: 640px) 56px, (max-width: 768px) 72px, 88px"
                />
              )}
            </div>
            <div className="text-xs sm:text-sm md:text-md font-mono text-[#FFFFFF] mt-3 md:mt-6">
              #{nft.tokenId}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

NFTItem.displayName = "NFTItem";

export default function VirtualizedNFTGrid({
  nfts,
  loading,
  error,
}: VirtualizedNFTGridProps) {
  const [loadedBatches, setLoadedBatches] = useState<Set<number>>(new Set());
  const [imageStates, setImageStates] = useState<Map<string, ImageState>>(
    new Map()
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const imageStatesRef = useRef<Map<string, ImageState>>(new Map());
  const prefetchQueue = useRef<Set<string>>(new Set());
  const activePrefetches = useRef<Set<string>>(new Set());

  // Keep ref in sync with state for timeout callbacks
  useEffect(() => {
    imageStatesRef.current = imageStates;
  }, [imageStates]);

  // When NFTs list identity/size changes, reset batches
  useEffect(() => {
    setLoadedBatches(new Set());
    setImageStates(new Map());
  }, [nfts]);

  // Fixed 4 columns: compute item size
  useEffect(() => {
    const updateDimensions = () => {
      const cw =
        containerRef.current?.offsetWidth ||
        (typeof window !== "undefined" ? window.innerWidth : 360);
      const itemWidth = Math.floor(cw / COLUMNS);
      const itemHeight = itemWidth + 60; // Increased height for larger images and text spacing
      setDimensions({ width: itemWidth, height: itemHeight });
    };

    if (typeof window !== "undefined") {
      requestAnimationFrame(updateDimensions);
      setTimeout(updateDimensions, 0);
      window.addEventListener("resize", updateDimensions);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", updateDimensions);
      }
    };
  }, []);

  // Prefetch with concurrency control
  const prefetchImage = useCallback((tokenId: string) => {
    if (typeof window === "undefined") return;

    if (
      activePrefetches.current.has(tokenId) ||
      activePrefetches.current.size >= MAX_CONCURRENT_PREFETCH ||
      imageStatesRef.current.has(tokenId)
    ) {
      return;
    }

    activePrefetches.current.add(tokenId);
    const img = new window.Image();
    img.src = imageUrlFor(tokenId, false, 0); // Start with API route

    const cleanup = () => {
      activePrefetches.current.delete(tokenId);
      prefetchQueue.current.delete(tokenId);
    };

    img.onload = cleanup;
    img.onerror = cleanup;

    // Timeout cleanup
    setTimeout(cleanup, 10000);
  }, []);

  // Clear timeouts when component unmounts
  useEffect(() => {
    return () => {
      imageStatesRef.current.forEach((state) => {
        if (state.timeoutId) {
          clearTimeout(state.timeoutId);
        }
      });
    };
  }, []);

  // Initialize image state with timeout and stable src
  const initializeImageState = useCallback((tokenId: string) => {
    const currentState = imageStatesRef.current.get(tokenId);
    if (
      currentState &&
      currentState.status !== "error" &&
      currentState.status !== "timeout"
    ) {
      return; // Already initialized and not in error state
    }

    const stableSrc = imageUrlFor(tokenId, false, 0); // Start with API route
    const timeoutId = setTimeout(() => {
      setImageStates((prev) => {
        const current = imageStatesRef.current.get(tokenId);
        if (current && current.status === "loading") {
          const newMap = new Map(prev);
          newMap.set(tokenId, {
            ...current,
            status: "timeout",
            timeoutId: undefined,
          });
          return newMap;
        }
        return prev;
      });
    }, IMAGE_LOAD_TIMEOUT);

    setImageStates((prev) => {
      const newMap = new Map(prev);
      newMap.set(tokenId, {
        status: "loading",
        retryCount: currentState?.retryCount || 0,
        timeoutId,
        src: stableSrc,
        useDirectGateway: false,
        gatewayIndex: 0,
      });
      return newMap;
    });
  }, []);

  // Retry failed image
  const retryImage = useCallback((tokenId: string) => {
    const currentState = imageStatesRef.current.get(tokenId);
    if (!currentState || currentState.retryCount >= MAX_RETRIES) {
      return;
    }

    // Clear existing timeout
    if (currentState.timeoutId) {
      clearTimeout(currentState.timeoutId);
    }

    // Set up new attempt with incremented retry count
    const newRetryCount = currentState.retryCount + 1;
    const timeoutId = setTimeout(() => {
      setImageStates((prev) => {
        const current = imageStatesRef.current.get(tokenId);
        if (
          current &&
          current.status === "loading" &&
          current.retryCount === newRetryCount
        ) {
          const newMap = new Map(prev);
          newMap.set(tokenId, {
            ...current,
            status: newRetryCount >= MAX_RETRIES ? "error" : "timeout",
            timeoutId: undefined,
          });
          return newMap;
        }
        return prev;
      });
    }, IMAGE_LOAD_TIMEOUT);

    setImageStates((prev) => {
      const newMap = new Map(prev);
      newMap.set(tokenId, {
        status: "loading",
        retryCount: newRetryCount,
        timeoutId,
        src: currentState.src, // Keep stable src
        useDirectGateway: currentState.useDirectGateway || false,
        gatewayIndex: currentState.gatewayIndex || 0,
      });
      return newMap;
    });
  }, []);

  // Handle image load success
  const handleImageLoad = useCallback((tokenId: string) => {
    setImageStates((prev) => {
      const current = prev.get(tokenId);
      if (current && current.timeoutId) {
        clearTimeout(current.timeoutId);
      }
      const newMap = new Map(prev);
      newMap.set(tokenId, {
        status: "loaded",
        retryCount: current?.retryCount || 0,
        timeoutId: undefined,
        src: current?.src || imageUrlFor(tokenId, false, 0),
        useDirectGateway: current?.useDirectGateway || false,
        gatewayIndex: current?.gatewayIndex || 0,
      });
      return newMap;
    });
  }, []);

  // Handle image load error with gateway fallback
  const handleImageError = useCallback((tokenId: string) => {
    setImageStates((prev) => {
      const current = prev.get(tokenId);
      if (current && current.timeoutId) {
        clearTimeout(current.timeoutId);
      }

      const newMap = new Map(prev);
      if (current) {
        // Try fallback strategies
        if (!current.useDirectGateway) {
          // First fallback: try direct IPFS gateway
          newMap.set(tokenId, {
            status: "loading",
            retryCount: current.retryCount,
            timeoutId: undefined,
            src: imageUrlFor(tokenId, true, 0),
            useDirectGateway: true,
            gatewayIndex: 0,
          });
        } else if (current.gatewayIndex < DIRECT_IPFS_GATEWAYS.length - 1) {
          // Try next direct gateway
          const nextIndex = current.gatewayIndex + 1;
          newMap.set(tokenId, {
            status: "loading",
            retryCount: current.retryCount,
            timeoutId: undefined,
            src: imageUrlFor(tokenId, true, nextIndex),
            useDirectGateway: true,
            gatewayIndex: nextIndex,
          });
        } else {
          // All gateways failed
          newMap.set(tokenId, {
            status: "error",
            retryCount: MAX_RETRIES,
            timeoutId: undefined,
            src: current.src,
            useDirectGateway: current.useDirectGateway,
            gatewayIndex: current.gatewayIndex,
          });
        }
      } else {
        // Fallback initialization
        newMap.set(tokenId, {
          status: "error",
          retryCount: MAX_RETRIES,
          timeoutId: undefined,
          src: imageUrlFor(tokenId, false, 0),
          useDirectGateway: false,
          gatewayIndex: 0,
        });
      }
      return newMap;
    });
  }, []);

  // Auto-retry timed-out images once without user click
  useEffect(() => {
    const idsToRetry: string[] = [];
    imageStates.forEach((s, id) => {
      if (s.status === "timeout" && s.retryCount < MAX_RETRIES)
        idsToRetry.push(id);
    });
    if (idsToRetry.length) {
      const t = setTimeout(() => idsToRetry.forEach(retryImage), 800);
      return () => clearTimeout(t);
    }
  }, [imageStates, retryImage]);

  // Load ALL batches immediately (no scroll dependency)
  const loadBatch = useCallback(
    (batchIndex: number) => {
      setLoadedBatches((prevLoadedBatches) => {
        if (prevLoadedBatches.has(batchIndex)) return prevLoadedBatches;

        const startIndex = batchIndex * BATCH_SIZE;
        const endIndex = Math.min(startIndex + BATCH_SIZE, nfts.length);

        // Initialize image states for this batch
        for (let i = startIndex; i < endIndex; i++) {
          if (nfts[i]) {
            initializeImageState(nfts[i].tokenId);
          }
        }

        return new Set(prevLoadedBatches).add(batchIndex);
      });
    },
    [nfts, initializeImageState]
  );

  useEffect(() => {
    if (!nfts.length) return;
    const total = Math.ceil(nfts.length / BATCH_SIZE);
    for (let i = 0; i < total; i++) {
      setTimeout(() => loadBatch(i), i * 10); // slight stagger to avoid blocking
    }
  }, [nfts, loadBatch]);

  // Prefetch every image regardless of scroll (concurrency-limited)
  useEffect(() => {
    if (!nfts.length) return;
    let i = 0;
    const ids = nfts.map((n) => n.tokenId);

    const pump = () => {
      while (
        activePrefetches.current.size < MAX_CONCURRENT_PREFETCH &&
        i < ids.length
      ) {
        const id = ids[i++];
        if (!prefetchQueue.current.has(id)) {
          prefetchQueue.current.add(id);
          prefetchImage(id);
        }
      }
      if (i < ids.length) setTimeout(pump, 25);
    };

    pump();
  }, [nfts, prefetchImage]);

  // Compute eager count for above-the-fold only (columns fixed at 4)
  const firstEagerCount = 8;

  // Memoized grid items
  const gridItems = useMemo(() => {
    return nfts.map((nft, index) => {
      const isInLoadedBatch = loadedBatches.has(Math.floor(index / BATCH_SIZE));
      const imageState = imageStates.get(nft.tokenId);

      return (
        <div key={nft.tokenId}>
          <NFTItem
            nft={nft}
            isInLoadedBatch={isInLoadedBatch}
            imageState={imageState}
            onImageLoad={handleImageLoad}
            onImageError={handleImageError}
            onRetryImage={retryImage}
            eager={index < firstEagerCount}
          />
        </div>
      );
    });
  }, [
    nfts,
    loadedBatches,
    imageStates,
    handleImageLoad,
    handleImageError,
    retryImage,
    firstEagerCount,
  ]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="h-8 w-8 border-2 border-[#dddddd] border-t-[#FFFFFF] rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-[#FFFFFF] text-sm">{error}</p>;
  }

  if (nfts.length === 0) {
    return (
      <p className="text-center text-[#FFFFFF] text-sm">
        No NFTs yet. Waiting for tweets...
      </p>
    );
  }

  if (!dimensions.width || !dimensions.height) {
    return <div ref={containerRef} className="h-96" />;
  }

  return (
    <div ref={containerRef} className="w-full overflow-hidden">
      <div
        className="grid gap-0.5 sm:gap-1 md:gap-2"
        style={{
          gridTemplateColumns: `repeat(${COLUMNS}, ${dimensions.width}px)`,
          gridAutoRows: `${dimensions.height}px`,
        }}
      >
        {gridItems}
      </div>
      {/* sentinel removed */}
    </div>
  );
}
