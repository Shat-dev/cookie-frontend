/*"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import GlassCard from "./GlassCard";
import { useWinners } from "@/hooks/useWinners";

const WinnersFooter: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { winners, loading } = useWinners();

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || winners.length === 0) return;

    let scrollDirection = 1;
    let isHovered = false;
    let animationFrameId: number;

    const step = () => {
      if (!isHovered) {
        const maxScroll =
          scrollContainer.scrollWidth - scrollContainer.clientWidth;

        if (scrollContainer.scrollLeft >= maxScroll) {
          scrollDirection = -1;
        } else if (scrollContainer.scrollLeft <= 0) {
          scrollDirection = 1;
        }

        scrollContainer.scrollLeft += scrollDirection * 0.51;
      }

      animationFrameId = requestAnimationFrame(step);
    };

    const handleMouseEnter = () => {
      isHovered = true;
    };

    const handleMouseLeave = () => {
      isHovered = false;
    };

    scrollContainer.addEventListener("mouseenter", handleMouseEnter);
    scrollContainer.addEventListener("mouseleave", handleMouseLeave);

    animationFrameId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animationFrameId);
      scrollContainer.removeEventListener("mouseenter", handleMouseEnter);
      scrollContainer.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [winners]);

  // 🚫 Don’t render anything unless winners exist
  if (loading || winners.length === 0) {
    return null;
  }

  return (
    <div className="w-full flex flex-col space-y-4">
      <div className="w-full overflow-x-auto">
        <div
          ref={scrollRef}
          className="flex flex-nowrap gap-3 w-full py-2 overflow-x-scroll scrollbar-none"
          style={{ scrollBehavior: "smooth" }}
        >
          {winners.map((winner, index) => (
            <GlassCard
              key={`${winner.drawNumber}-${index}`}
              className="w-[160px] md:w-[220px] flex-none"
            >
              <div className="flex items-center justify-center px-3 md:px-6 py-1.5 md:py-2 text-xs md:text-sm leading-[18px] md:leading-[21px] text-[#666666] font-thin font-['Fira_Code'] cursor-pointer box-border">
                <div className="flex items-center justify-between w-full">
                  {/* Draw info */ /*}
                  <div className="flex items-center space-x-1 md:space-x-2">
                    <span className="text-xs md:text-sm font-thin font-['Fira_Code'] text-[#666666]">
                      Draw #{winner.drawNumber}
                    </span>
                    <span className="text-xs md:text-sm font-bold text-[#666666]">
                      ${winner.amount}
                    </span>
                  </div>

                  {/* NFT Ball Image */ /*}
                  <div className="relative w-6 h-6 md:w-8 md:h-8 rounded-full overflow-hidden flex-shrink-0 ml-2 md:ml-4">
                    <Image
                      src={winner.nftImageUrl}
                      alt={`Winner NFT ${winner.drawNumber}`}
                      fill
                      className="object-contain scale-240"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/Generated-Images/154.png";
                      }}
                    />
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WinnersFooter;
*/
