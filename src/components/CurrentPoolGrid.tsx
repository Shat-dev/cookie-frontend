"use client";

import Image from "next/image";
import GlassmorphismDiv from "@/components/GlassmorphismDiv";

export default function CurrentPoolGrid() {
  // Mock NFT data using images from Generated-Images folder
  // In the future, this will be fetched from a backend API
  const poolNFTs = [
    { id: 1, image: "/Generated-Images/1025.png", number: "1025" },
    { id: 2, image: "/Generated-Images/2025.png", number: "2025" },
    { id: 3, image: "/Generated-Images/3025.png", number: "3025" },
    { id: 4, image: "/Generated-Images/4025.png", number: "4025" },
    { id: 5, image: "/Generated-Images/5025.png", number: "5025" },
    { id: 6, image: "/Generated-Images/6025.png", number: "6025" },
    { id: 7, image: "/Generated-Images/7025.png", number: "7025" },
    { id: 8, image: "/Generated-Images/8025.png", number: "8025" },
    { id: 9, image: "/Generated-Images/9025.png", number: "9025" },
    { id: 10, image: "/Generated-Images/234.png", number: "234" },
    { id: 11, image: "/Generated-Images/154.png", number: "154" },
    { id: 12, image: "/Generated-Images/89.png", number: "89" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {poolNFTs.map((nft) => (
        <GlassmorphismDiv
          key={nft.id}
          onClick={() => console.log(`Clicked Pool NFT ${nft.number}`)}
          className="rounded-xs"
        >
          <div className="p-14 pb-6 text-center cursor-pointer">
            <div className="relative w-16 h-16">
              <Image
                src={nft.image}
                alt={`Ball ${nft.number}`}
                fill
                className="object-contain scale-400"
              />
            </div>
            <p className="text-sm font-mono text-[#212427] mt-10">
              #{nft.number}
            </p>
          </div>
        </GlassmorphismDiv>
      ))}
    </div>
  );
}
