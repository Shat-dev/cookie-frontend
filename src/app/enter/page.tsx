"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Link from "next/link";
import EnterButton from "@/components/CoolButton";
import CoolButton from "@/components/CoolButton";
import Image from "next/image";
import { ethers } from "ethers";
import CookieABI from "../../../constants/CookieABI.json" assert { type: "json" };
import { useSimpleCountdownString } from "@/hooks/useSimpleCountdownString";
import { useProjections } from "@/hooks/useProjections";
import { usePrizePool } from "@/hooks/usePrizePool";

declare global {
  interface Window {
    ethereum?: unknown;
  }
}

interface NFT {
  id: number;
  wallet_address: string;
  token_id: string;
  image_url: string;
  verified: boolean;
  created_at: string;
  imageError?: boolean;
  currentGatewayIndex?: number;
  imageLoading?: boolean;
}

export default function EnterPage() {
  const [walletAddress, setWalletAddress] = useState("");
  const [isValidAddress, setIsValidAddress] = useState(false);
  const [showNFTs, setShowNFTs] = useState(false);
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // ✅ NEW: Mobile menu state
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // ✅ NEW: Contract address and copy state for footer
  const [contractAddress, setContractAddress] = useState<string>("");
  const [copied, setCopied] = useState(false);

  // Get real countdown and draw info
  const countdownString = useSimpleCountdownString();
  const { formattedUsd: prizePoolUsd } = usePrizePool();

  // ✅ NEW: Preload ball.png image for instant display when menu opens
  useEffect(() => {
    const img = new window.Image();
    img.src = "/ball.png";

    // Load contract address
    import("../../../constants/contract-address.json").then((data) => {
      setContractAddress(data.Cookie);
    });
  }, []);

  // ✅ NEW: Handle copy address functionality for footer
  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(contractAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy address:", err);
    }
  };

  // Multiple IPFS gateways for fallback - using correct image CID with /images path
  const IPFS_GATEWAYS = [
    "https://gateway.pinata.cloud/ipfs/QmQXUMvogYc9EPofMQvqQLr1DZRXH6L4hBsCqdLFzc7vuQ/images",
    "https://ipfs.io/ipfs/QmQXUMvogYc9EPofMQvqQLr1DZRXH6L4hBsCqdLFzc7vuQ/images",
  ];

  const toImageUrl = (id: bigint | number | string, gatewayIndex: number = 0) =>
    `${IPFS_GATEWAYS[gatewayIndex]}/${id.toString()}.jpg`;

  // Helper function to fetch owned token IDs using correct Cookie ABI functions
  async function fetchOwnedTokenIds(
    contract: ethers.Contract,
    wallet: string
  ): Promise<string[]> {
    try {
      // First check if the wallet has any ERC-721 tokens
      const erc721Balance = await contract.erc721BalanceOf(wallet);

      if (erc721Balance === BigInt(0) || erc721Balance === 0) {
        // No NFTs to fetch
        return [];
      }

      // Use the owned(address) function from Cookie ABI to get all token IDs
      const tokenIds: bigint[] = await contract.owned(wallet);

      if (tokenIds && tokenIds.length > 0) {
        // Decode the token IDs and convert to strings
        return tokenIds.map((id) => decodeId(id).toString());
      }

      return [];
    } catch (error) {
      console.error("Error fetching owned token IDs:", error);
      // Check if this is a BAD_DATA error specifically from owned() function
      if (
        error instanceof Error &&
        error.message.includes("could not decode result data")
      ) {
        console.warn(
          "owned() function returned empty data - wallet likely has no NFTs"
        );
        return [];
      }

      // For other errors, try to check if user has any ERC-721 balance as fallback
      try {
        const erc721Balance = await contract.erc721BalanceOf(wallet);
        if (erc721Balance > 0) {
          console.warn(
            `User has ${erc721Balance.toString()} ERC-721 tokens but owned() function failed with error:`,
            error
          );
        }
      } catch (balanceError) {
        console.warn("erc721BalanceOf also failed:", balanceError);
      }

      return [];
    }
  }

  // Helper function to fetch metadata from IPFS with retry logic
  async function fetchTokenMetadata(
    tokenId: string,
    retryCount: number = 0
  ): Promise<{ name?: string; image?: string; description?: string } | null> {
    const maxRetries = 2;
    const retryDelay = 1000; // 1 second

    try {
      // Use the correct metadata URL format as specified
      const metadataUrl = `https://gateway.pinata.cloud/ipfs/QmTwdrsBSTL23jnvkpsWocSjJU9fo5hhr4tidB91ggHnnF/metadata/${tokenId}.json`;

      // Add timeout to fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

      const response = await fetch(metadataUrl, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(
          `Failed to fetch metadata for token ${tokenId}:`,
          response.status
        );
        return null;
      }

      const metadata = await response.json();
      return {
        name: metadata.name,
        image: metadata.image,
        description: metadata.description,
      };
    } catch (error) {
      console.warn(
        `Error fetching metadata for token ${tokenId} (attempt ${
          retryCount + 1
        }):`,
        error
      );

      // Retry logic for timeouts and network errors
      if (
        retryCount < maxRetries &&
        error instanceof Error &&
        (error.name === "AbortError" ||
          error.message.includes("fetch") ||
          error.message.includes("network"))
      ) {
        console.log(
          `Retrying metadata fetch for token ${tokenId} in ${retryDelay}ms...`
        );
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
        return fetchTokenMetadata(tokenId, retryCount + 1);
      }

      return null;
    }
  }

  // Helper function to convert IPFS image URL to gateway URL
  function convertIpfsImageUrl(ipfsUrl: string): string {
    if (ipfsUrl.startsWith("ipfs://")) {
      const hash = ipfsUrl.replace("ipfs://", "");
      return `https://gateway.pinata.cloud/ipfs/${hash}`;
    }
    return ipfsUrl;
  }

  // Handle image load success
  const handleImageLoad = (tokenId: string) => {
    setNfts((prevNfts) =>
      prevNfts.map((nft) =>
        nft.token_id === tokenId ? { ...nft, imageLoading: false } : nft
      )
    );
  };

  // Handle image error with gateway fallback
  const handleImageError = (
    tokenId: string,
    currentGatewayIndex: number = 0
  ) => {
    const nextGatewayIndex = currentGatewayIndex + 1;

    if (nextGatewayIndex < IPFS_GATEWAYS.length) {
      // Try next gateway with direct image URL construction
      setNfts((prevNfts) =>
        prevNfts.map((nft) =>
          nft.token_id === tokenId
            ? {
                ...nft,
                image_url: toImageUrl(tokenId, nextGatewayIndex),
                currentGatewayIndex: nextGatewayIndex,
                imageLoading: true, // Reset loading state for new gateway
              }
            : nft
        )
      );
    } else {
      // All gateways failed, mark as error
      setNfts((prevNfts) =>
        prevNfts.map((nft) =>
          nft.token_id === tokenId
            ? { ...nft, imageError: true, imageLoading: false }
            : nft
        )
      );
    }
  };

  const ID_PREFIX = BigInt(1) << BigInt(255);
  const decodeId = (raw: bigint) => (raw > ID_PREFIX ? raw - ID_PREFIX : raw);

  useEffect(() => {
    setError("");
    setIsValidAddress(false);
    setShowNFTs(false);
    setNfts([]);
  }, [walletAddress]);

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (walletAddress.length <= 10) {
      setIsValidAddress(false);
      setShowNFTs(false);
      setLoading(false);
      return;
    }

    if (!contractAddress) {
      setError("Contract address not loaded yet. Please try again.");
      setLoading(false);
      return;
    }

    try {
      const provider = new ethers.JsonRpcProvider(
        process.env.NEXT_PUBLIC_BNB_TESTNET_RPC ||
          "https://bsc-testnet-rpc.publicnode.com"
      );
      // Handle both direct ABI array and Hardhat artifact format
      const cookieABI = Array.isArray(CookieABI)
        ? CookieABI
        : (CookieABI as { abi?: unknown; default?: unknown })?.abi ??
          (CookieABI as { abi?: unknown; default?: unknown })?.default;

      const contract = new ethers.Contract(
        contractAddress,
        cookieABI as ethers.InterfaceAbi,
        provider
      );

      if (!ethers.isAddress(walletAddress)) {
        setError("Please enter a valid wallet address.");
        setIsValidAddress(false);
        setShowNFTs(false);
        setLoading(false);
        return;
      }

      // Fetch owned token IDs using correct Cookie ABI functions
      const tokenIds = await fetchOwnedTokenIds(contract, walletAddress);

      if (!tokenIds?.length) {
        setError(
          "No Cookie NFTs found for this wallet address. You need to own at least 1 Cookie token to participate."
        );
        setIsValidAddress(false);
        setShowNFTs(false);
        setLoading(false);
        return;
      }

      // Fetch metadata for all tokens in parallel for better performance
      const metadataPromises = tokenIds.map(async (tokenId) => {
        const metadata = await fetchTokenMetadata(tokenId);
        return {
          tokenId,
          metadata,
        };
      });

      const metadataResults = await Promise.all(metadataPromises);

      // Create NFT objects with proper metadata
      const nftObjects: NFT[] = metadataResults.map((result, index) => {
        const { tokenId, metadata } = result;

        let imageUrl: string;
        if (metadata?.image) {
          // Convert IPFS URLs to gateway URLs
          imageUrl = convertIpfsImageUrl(metadata.image);
        } else {
          // Fallback to direct image URL construction
          imageUrl = toImageUrl(tokenId, 0);
        }

        return {
          id: index + 1,
          wallet_address: walletAddress,
          token_id: tokenId,
          image_url: imageUrl,
          verified: true,
          created_at: new Date().toISOString(),
          imageError: false,
          currentGatewayIndex: 0,
          imageLoading: true, // Start with loading state
        };
      });

      setNfts(nftObjects);
      setIsValidAddress(true);
      setShowNFTs(true);
    } catch (err) {
      console.error("Error fetching NFTs:", err);

      // Provide more specific error messages based on the error type
      let errorMessage = "Please enter a valid wallet address.";

      if (err instanceof Error) {
        if (err.message.includes("could not decode result data")) {
          errorMessage =
            "No Cookie NFTs found for this wallet address. You need to own at least 1 Cookie token to participate.";
        } else if (err.message.includes("network")) {
          errorMessage =
            "Network error. Please check your connection and try again.";
        } else if (err.message.includes("invalid address")) {
          errorMessage = "Please enter a valid wallet address.";
        } else if (err.message.includes("BAD_DATA")) {
          errorMessage =
            "No Cookie NFTs found for this wallet address. You need to own at least 1 Cookie token to participate.";
        }
      }

      setError(errorMessage);
      setIsValidAddress(false);
      setShowNFTs(false);
    } finally {
      setLoading(false);
    }
  };

  const cookieNumber = nfts.length > 0 ? nfts[0].token_id : "1293";
  const extraEntries = nfts.length > 1 ? nfts.length - 1 : 10;
  const prizePool = prizePoolUsd || "$2,000"; // fallback to $2,000 if loading
  const timeLeft = countdownString;
  // Use real-time projection count for accurate entry count
  const { totalCount: projectionCount } = useProjections();
  const totalEntries = projectionCount ?? 0;
  const others = Math.max(totalEntries ?? 0, 0);

  const tweetText = encodeURIComponent(
    `My Cookie ${cookieNumber} + ${extraEntries} more\n\n${prizePool} in the pot.\n\n${timeLeft} until draw\n\nI'm in @fortunebnb with ${others} others.\n\nhttps://FortuneCookieBNB.xyz`
  );

  const tweetURL = `https://x.com/intent/tweet?text=${tweetText}`;

  return (
    <div className="min-h-screen bg-[#fff49b] font-['Fira_Code'] overflow-hidden md:overflow-y-clip">
      {/* Header: desktop offset preserved, no desktop shift */}
      <div className="pt-[env(safe-area-inset-top)] py-6 md:pt-0 md:-mt-4">
        <Header
          currentPage="enter"
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
        />
      </div>

      {/* Mobile Layout: Show menu overlay or main content */}
      <div className="md:hidden">
        {isMenuOpen ? (
          <div className="relative w-full min-h-[100dvh] overflow-hidden px-8 pt-2 pb-[68px]">
            <div className="flex items-end justify-center min-h-[80dvh]">
              <img
                src="/ball.png"
                alt="Ball"
                className="w-auto h-auto max-w-[50%] max-h-[50%] object-contain"
              />
            </div>

            {/* Mobile Footer for Menu Overlay */}
            <footer className="fixed bottom-0 left-0 right-0 bg-[#fff49b] z-50 font-['Fira_Code'] text-[#666666] h-[72px] overflow-hidden">
              <div className="fixed bottom-0 left-0 right-0 z-0 flex flex-col items-center py-3 space-y-1 pb-[env(safe-area-inset-bottom)]">
                <div className="text-xs text-[#666666] font-mono text-center">
                  ERC-404 POWERED LOTTERY ON BSC
                </div>
                <div
                  className="text-xs text-[#666666] font-mono text-center opacity-75 cursor-pointer hover:text-[#212427] transition-colors"
                  onClick={handleCopyAddress}
                >
                  {copied
                    ? "Copied Successfully!"
                    : contractAddress ||
                      "0x6B60298f5Ab2D4B133D4385a73B17e95B16AA2aD"}
                </div>
                <div className="flex items-center space-x-1 text-[#666666] font-thin hover:text-[#212427] transition-colors group">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="group-hover:[&>path]:fill-[#212427] transition-colors"
                  >
                    <path
                      d="M10 9C10 8.44754 10.4476 8 10.9997 8H13C13.5071 8 13.7898 8.16249 13.9378 8.28087C14.0486 8.36952 14.1077 8.45538 14.119 8.4731C14.3737 8.94812 14.962 9.13706 15.4472 8.89443C15.9309 8.65259 16.1361 8.03372 15.8934 7.55064C15.8387 7.44229 15.7712 7.34071 15.6984 7.24375C15.5859 7.09376 15.4194 6.90487 15.1872 6.71913C14.7102 6.33751 13.9929 6 13 6H10.9997C9.34271 6 8 7.34332 8 9V14.9999C8 16.6566 9.34275 17.9999 10.9998 17.9999L13 17.9999C13.9929 18 14.7101 17.6625 15.1872 17.2809C15.4194 17.0951 15.5859 16.9062 15.6984 16.7563C15.7714 16.659 15.8389 16.5568 15.8939 16.4483C16.138 15.9605 15.9354 15.3497 15.4472 15.1056C14.962 14.8629 14.3737 15.0519 14.119 15.5269C14.1077 15.5446 14.0486 15.6305 13.9378 15.7191C13.7899 15.8375 13.5071 16 13 15.9999L10.9998 15.9999C10.4476 15.9999 10 15.5524 10 14.9999V9Z"
                      fill="#666666"
                    />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12 23C18.0751 23 23 18.0751 23 12C23 5.92487 18.0751 1 12 1C5.92487 1 1 5.92487 1 12C1 18.0751 5.92487 23 12 23ZM12 20.9932C7.03321 20.9932 3.00683 16.9668 3.00683 12C3.00683 7.03321 7.03321 3.00683 12 3.00683C16.9668 3.00683 20.9932 7.03321 20.9932 12C20.9932 16.9668 16.9668 20.9932 12 20.9932Z"
                      fill="#666666"
                    />
                  </svg>
                  <span className="text-xs">FortuneCookieBNB.xyz 2025</span>
                </div>
              </div>
            </footer>
          </div>
        ) : (
          <main className="max-w-4xl py-24 mx-auto px-0">
            {/* Header Section */}
            <div className="text-center md:mb-12">
              <h1 className="text-3xl font-semi-bold text-[#212427] mb-4">
                How to Enter
              </h1>
              <p className="text-lg px-8 text-[#666666] font-thin">
                Follow these steps to participate in the onchain lottery
              </p>
            </div>

            {/* How to Enter Steps */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 md:gap-6 md:mb-12">
              {/* Step 1 */}
              <div className="">
                <div className="p-6 text-center">
                  <h3 className="text-lg font-semi-bold text-[#212427] mb-2">
                    Step 1
                  </h3>
                  <p className="text-sm text-[#666666] font-thin">
                    Buy at least 1 $Cookie token (ERC-404)
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="">
                <div className="p-6 text-center">
                  <h3 className="text-lg font-semi-bold text-[#212427] mb-2">
                    Step 2
                  </h3>
                  <p className="text-sm text-[#666666] font-thin">
                    Post on X/Twitter with &quot;Cookie {cookieNumber}&quot;
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="">
                <div className="p-6 text-center">
                  <h3 className="text-lg font-semi-bold text-[#212427] mb-2">
                    Step 3
                  </h3>
                  <p className="text-sm text-[#666666] font-thin">
                    Wait for the draw and hope you win!
                  </p>
                </div>
              </div>
            </div>

            {/* Enter Form */}
            <div className="rounded-xs">
              <div className="p-8">
                <h2 className="text-xl font-semi-bold text-[#212427] mb-6 text-center">
                  Enter Your Wallet Address
                </h2>

                <form
                  onSubmit={handleAddressSubmit}
                  className="max-w-md mx-auto"
                >
                  <div className="mb-6">
                    <div className="relative">
                      <input
                        type="text"
                        id="walletAddress"
                        value={walletAddress}
                        onChange={(e) => setWalletAddress(e.target.value)}
                        placeholder="Enter your wallet address"
                        className="w-full px-4 py-3 pr-20 border border-[#dddddd] rounded-lg focus:outline-none focus:ring-0 focus:border-[#dddddd] font-mono text-sm"
                        disabled={loading}
                      />
                      <button
                        type="submit"
                        disabled={loading}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#666666] hover:text-[#212427] transition-colors font-thin cursor-pointer disabled:opacity-50"
                      >
                        {loading ? "..." : "Enter"}
                      </button>
                    </div>
                  </div>

                  {!isValidAddress &&
                    walletAddress.length > 0 &&
                    walletAddress.length <= 10 && (
                      <p className="text-[#212427] text-sm text-center mt-2">
                        Please enter a valid wallet address
                      </p>
                    )}

                  {error && (
                    <p className="text-[#212427] text-sm text-center mt-2">
                      {error}
                    </p>
                  )}

                  {/* Loading spinner with smooth transition */}
                  {loading && (
                    <div className="flex justify-center items-center py-6 mt-4 transition-opacity duration-300">
                      <div className="h-8 w-8 border-2 border-[#dddddd] border-t-[#212427] rounded-full animate-spin" />
                    </div>
                  )}
                </form>

                {/* NFT Display Section */}
                {showNFTs && nfts.length > 0 && (
                  <div className="mt-8 transition-all duration-500 ease-in-out">
                    <h2 className="text-xl font-semi-bold text-[#212427] mb-6 text-center">
                      Your Lottery Cookie ({nfts.length} NFT
                      {nfts.length !== 1 ? "s" : ""})
                    </h2>

                    <div className="w-full overflow-hidden">
                      <div className="grid gap-0.5 sm:gap-1 md:gap-2 grid-cols-4 sm:grid-cols-4">
                        {nfts.map((nft) => (
                          <div key={nft.token_id} className="p-0.5 sm:p-1">
                            <div className="rounded-xs">
                              <div className="p-2 sm:p-3 pb-2 sm:pb-4 text-center">
                                <div className="relative w-14 h-14 sm:w-18 sm:h-18 md:w-22 md:h-22 mx-auto">
                                  {nft.imageError ? (
                                    <div className="w-full h-full bg-gray-200 rounded-md flex items-center justify-center">
                                      <span className="text-xs text-gray-500">
                                        No Image
                                      </span>
                                    </div>
                                  ) : (
                                    <>
                                      {nft.imageLoading && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-md">
                                          <div className="h-6 w-6 sm:h-8 sm:w-8 border-2 border-[#dddddd] border-t-[#212427] rounded-full animate-spin" />
                                        </div>
                                      )}
                                      <Image
                                        src={nft.image_url}
                                        alt={`Cookie ${nft.token_id}`}
                                        fill
                                        className="object-cover rounded-md"
                                        unoptimized
                                        loading="eager"
                                        sizes="(max-width: 640px) 56px, (max-width: 768px) 72px, 88px"
                                        onLoad={() =>
                                          handleImageLoad(nft.token_id)
                                        }
                                        onError={() =>
                                          handleImageError(
                                            nft.token_id,
                                            nft.currentGatewayIndex || 0
                                          )
                                        }
                                      />
                                    </>
                                  )}
                                </div>
                                <div className="text-xs sm:text-sm md:text-md font-mono text-[#212427] mt-3 md:mt-6">
                                  #{nft.token_id}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Post to X Button */}
                    <div className="text-center mt-6 mb-4">
                      <CoolButton
                        onClick={() =>
                          window.open(tweetURL, "_blank", "noopener,noreferrer")
                        }
                        className="inline-block"
                      >
                        Post to X
                      </CoolButton>
                    </div>

                    <div className="text-center mt-6">
                      <p className="text-sm text-[#666666] font-thin">
                        Sharing makes you eligible for the upcoming draw. Keep
                        holding to stay in future draws!
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Back to Home */}
            <div className="pt-4 flex justify-center mt-10">
              <Link href="/">
                <EnterButton onClick={() => console.log("Play button clicked")}>
                  Back to Home
                </EnterButton>
              </Link>
            </div>
          </main>
        )}
      </div>

      {/* Desktop Layout (unchanged) */}
      <main className="hidden md:block max-w-4xl py-12 mx-auto px-0">
        {/* Header Section */}
        <div className="text-center md:mb-12">
          <h1 className="text-3xl font-semi-bold text-[#212427] mb-4">
            How to Enter
          </h1>
          <p className="text-lg px-8 text-[#666666] font-thin">
            Follow these steps to participate in the onchain lottery
          </p>
        </div>

        {/* How to Enter Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 md:gap-6 md:mb-12">
          {/* Step 1 */}
          <div className="">
            <div className="p-6 text-center">
              <h3 className="text-lg font-semi-bold text-[#212427] mb-2">
                Step 1
              </h3>
              <p className="text-sm text-[#666666] font-thin">
                Buy at least 1 $Cookie token (ERC-404)
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="">
            <div className="p-6 text-center">
              <h3 className="text-lg font-semi-bold text-[#212427] mb-2">
                Step 2
              </h3>
              <p className="text-sm text-[#666666] font-thin">
                Post on X/Twitter with &quot;Cookie {cookieNumber}&quot;
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="">
            <div className="p-6 text-center">
              <h3 className="text-lg font-semi-bold text-[#212427] mb-2">
                Step 3
              </h3>
              <p className="text-sm text-[#666666] font-thin">
                Wait for the draw and hope you win!
              </p>
            </div>
          </div>
        </div>

        {/* Enter Form */}
        <div className="rounded-xs">
          <div className="p-8">
            <h2 className="text-xl font-semi-bold text-[#212427] mb-6 text-center">
              Enter Your Wallet Address
            </h2>

            <form onSubmit={handleAddressSubmit} className="max-w-md mx-auto">
              <div className="mb-6">
                <div className="relative">
                  <input
                    type="text"
                    id="walletAddress"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    placeholder="Enter your wallet address"
                    className="w-full px-4 py-3 pr-20 border border-[#dddddd] rounded-lg focus:outline-none focus:ring-0 focus:border-[#dddddd] font-mono text-sm"
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#666666] hover:text-[#212427] transition-colors font-thin cursor-pointer disabled:opacity-50"
                  >
                    {loading ? "..." : "Enter"}
                  </button>
                </div>
              </div>

              {!isValidAddress &&
                walletAddress.length > 0 &&
                walletAddress.length <= 10 && (
                  <p className="text-[#212427] text-sm text-center mt-2">
                    Please enter a valid wallet address
                  </p>
                )}

              {error && (
                <p className="text-[#212427] text-sm text-center mt-2">
                  {error}
                </p>
              )}

              {/* Loading spinner with smooth transition */}
              {loading && (
                <div className="flex justify-center items-center py-6 mt-4 transition-opacity duration-300">
                  <div className="h-8 w-8 border-2 border-[#dddddd] border-t-[#212427] rounded-full animate-spin" />
                </div>
              )}
            </form>

            {/* NFT Display Section */}
            {showNFTs && nfts.length > 0 && (
              <div className="mt-8 transition-all duration-500 ease-in-out">
                <h2 className="text-xl font-semi-bold text-[#212427] mb-6 text-center">
                  Your Lottery Cookie ({nfts.length} NFT
                  {nfts.length !== 1 ? "s" : ""})
                </h2>

                <div className="w-full overflow-hidden">
                  <div className="grid gap-0.5 sm:gap-1 md:gap-2 grid-cols-4 sm:grid-cols-4">
                    {nfts.map((nft) => (
                      <div key={nft.token_id} className="p-0.5 sm:p-1">
                        <div className="rounded-xs">
                          <div className="p-2 sm:p-3 pb-2 sm:pb-4 text-center">
                            <div className="relative w-14 h-14 sm:w-18 sm:h-18 md:w-22 md:h-22 mx-auto">
                              {nft.imageError ? (
                                <div className="w-full h-full bg-gray-200 rounded-md flex items-center justify-center">
                                  <span className="text-xs text-gray-500">
                                    No Image
                                  </span>
                                </div>
                              ) : (
                                <>
                                  {nft.imageLoading && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-md">
                                      <div className="h-6 w-6 sm:h-8 sm:w-8 border-2 border-[#dddddd] border-t-[#212427] rounded-full animate-spin" />
                                    </div>
                                  )}
                                  <Image
                                    src={nft.image_url}
                                    alt={`Cookie ${nft.token_id}`}
                                    fill
                                    className="object-cover rounded-md"
                                    unoptimized
                                    loading="eager"
                                    sizes="(max-width: 640px) 56px, (max-width: 768px) 72px, 88px"
                                    onLoad={() => handleImageLoad(nft.token_id)}
                                    onError={() =>
                                      handleImageError(
                                        nft.token_id,
                                        nft.currentGatewayIndex || 0
                                      )
                                    }
                                  />
                                </>
                              )}
                            </div>
                            <div className="text-xs sm:text-sm md:text-md font-mono text-[#212427] mt-3 md:mt-6">
                              #{nft.token_id}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Post to X Button */}
                <div className="text-center mt-6 mb-4">
                  <CoolButton
                    onClick={() =>
                      window.open(tweetURL, "_blank", "noopener,noreferrer")
                    }
                    className="inline-block"
                  >
                    Post to X
                  </CoolButton>
                </div>

                <div className="text-center mt-6">
                  <p className="text-sm text-[#666666] font-thin">
                    Sharing makes you eligible for the upcoming draw. Keep
                    holding to stay in future draws!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Back to Home */}
        <div className="pt-4 flex justify-center mt-10">
          <Link href="/">
            <EnterButton onClick={() => console.log("Play button clicked")}>
              Back to Home
            </EnterButton>
          </Link>
        </div>
      </main>
    </div>
  );
}
