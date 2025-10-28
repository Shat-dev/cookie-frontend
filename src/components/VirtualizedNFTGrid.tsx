import React, {
  useCallback,
  useState,
  useRef,
  useEffect,
  useMemo,
} from "react";
import Image from "next/image";

// Use local art.jpg for all NFTs
const imageUrlFor = () => "/art.jpg";

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
  status: "loading" | "loaded" | "error";
  retryCount: number;
  src: string; // Always "/art.jpg" now
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
    const stableSrc = imageState?.src || imageUrlFor();

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

  // Simplified prefetch - just preload the single local image once
  const prefetchImage = useCallback(() => {
    if (typeof window === "undefined") return;

    // Only preload once
    if (activePrefetches.current.size > 0) return;

    activePrefetches.current.add("art.jpg");
    const img = new window.Image();
    img.src = imageUrlFor();

    img.onload = () => activePrefetches.current.delete("art.jpg");
    img.onerror = () => activePrefetches.current.delete("art.jpg");
  }, []);

  // Preload the single local image on mount
  useEffect(() => {
    prefetchImage();
  }, [prefetchImage]);

  // Initialize image state - simplified for local images
  const initializeImageState = useCallback((tokenId: string) => {
    const currentState = imageStatesRef.current.get(tokenId);
    if (currentState && currentState.status !== "error") {
      return; // Already initialized and not in error state
    }

    setImageStates((prev) => {
      const newMap = new Map(prev);
      newMap.set(tokenId, {
        status: "loading",
        retryCount: currentState?.retryCount || 0,
        src: imageUrlFor(),
      });
      return newMap;
    });
  }, []);

  // Retry failed image - simplified for local images
  const retryImage = useCallback((tokenId: string) => {
    const currentState = imageStatesRef.current.get(tokenId);
    if (!currentState || currentState.retryCount >= MAX_RETRIES) {
      return;
    }

    setImageStates((prev) => {
      const newMap = new Map(prev);
      newMap.set(tokenId, {
        status: "loading",
        retryCount: currentState.retryCount + 1,
        src: imageUrlFor(),
      });
      return newMap;
    });
  }, []);

  // Handle image load success
  const handleImageLoad = useCallback((tokenId: string) => {
    setImageStates((prev) => {
      const current = prev.get(tokenId);
      const newMap = new Map(prev);
      newMap.set(tokenId, {
        status: "loaded",
        retryCount: current?.retryCount || 0,
        src: imageUrlFor(),
      });
      return newMap;
    });
  }, []);

  // Handle image load error - simplified for local images
  const handleImageError = useCallback((tokenId: string) => {
    setImageStates((prev) => {
      const current = prev.get(tokenId);
      const newMap = new Map(prev);
      newMap.set(tokenId, {
        status: "error",
        retryCount: MAX_RETRIES,
        src: imageUrlFor(),
      });
      return newMap;
    });
  }, []);

  // No need for auto-retry logic with local images

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

  // No need for complex prefetch logic - single local image is already preloaded

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
