"use client";

import EnterButton from "@/components/CoolButton";
import Link from "next/link";
import Header from "@/components/Header";
import { useState, useEffect } from "react";

export default function FAQ() {
  const [openQuestions, setOpenQuestions] = useState<number[]>([]);
  // ✅ NEW: Mobile menu state
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // ✅ NEW: Contract address and copy state for footer
  const [contractAddress, setContractAddress] = useState<string>("");
  const [copied, setCopied] = useState(false);

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

  const toggleQuestion = (index: number) => {
    setOpenQuestions((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const faqData = [
    {
      question: "What is this project about?",
      answer:
        "This is an on-chain lottery system powered by ERC-404 tokens and Chainlink VRF, where NFT holders can participate in regular automated draws by proving ownership and social activity.",
    },
    {
      question: "How do I enter the lottery?",
      answer:
        "To enter, you must hold at least one full Cookie token (ERC-404), receive the associated NFT, post on X/Twitter using our default template.",
    },
    {
      question: "Do I need to post every draw to stay eligible?",
      answer:
        "No. Once you have posted, you are entered into all future draws as long as you continue holding your NFT and your post remains visible/active.",
    },
    {
      question: "What happens if I delete my post?",
      answer:
        "Deleting your post removes your eligibility for the current draw and future draws. You will need to repost to re-enter.",
    },
    {
      question:
        "Do I need to repost on X if I buy more tokens to enter them in the pool?",
      answer:
        "No. We auto-detect new tokens after your original X post and add them to the current pool.",
    },
    {
      question: "What is Chainlink VRF and why is it used?",
      answer:
        "Chainlink VRF (Verifiable Random Function) ensures the randomness used to pick lottery winners is provably fair and tamper-proof.",
    },
    {
      question: "Can I win more than once?",
      answer:
        "Yes. As long as you continue to meet the eligibility criteria, you can win multiple times.",
    },
    {
      question: "How often is the draw conducted?",
      answer: "Draws occur automatically every 3 hours.",
    },
    {
      question: "How is my eligibility verified?",
      answer:
        "Eligibility is checked on-chain via NFT ownership and off-chain via X/Twitter post detection and verification logic on the backend.",
    },
    {
      question: "Do I need a BNB wallet to participate?",
      answer:
        "Yes. Since the project is built on BNB (an L1 by BNB), you will need a wallet configured for the BNB network to participate.",
    },
    {
      question: "What happens if I transfer or sell my NFT?",
      answer:
        "If you no longer hold the NFT in your wallet but have an existing X post, only the transferred tokens are removed from current and upcoming draws.",
    },
    {
      question: "How are prizes funded?",
      answer:
        "The prize pool is built from trading volume and tokenomics. A 5% trading fee funds the prize.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#fff49b] font-['Fira_Code'] overflow-hidden md:overflow-y-clip">
      {/* Header: desktop offset preserved, no desktop shift */}
      <div className="pt-[env(safe-area-inset-top)] py-6 md:pt-0 md:-mt-4">
        <Header
          currentPage="faq"
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
                  ERC-404 POWERED LOTTERY ON BNB
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
          <main className="max-w-4xl py-24 mx-auto px-4">
            <div className="text-center mb-12">
              <h1 className="text-3xl font-semi-bold text-[#212427] mb-4">
                Frequently Asked Questions
              </h1>
              <p className="text-lg text-[#666666] font-thin">
                Everything you need to know about FortuneCookieBNB.xyz
              </p>
            </div>

            <div className="space-y-0">
              {faqData.map((faq, index) => (
                <div key={index} className="">
                  <button
                    onClick={() => toggleQuestion(index)}
                    className="w-full p-6 text-left flex justify-between items-center cursor-pointer transition-colors duration-200"
                  >
                    <h2 className="text-xl font-semi-bold text-[#212427]">
                      {faq.question}
                    </h2>
                    <span className="text-2xl text-[#666666] transform transition-transform duration-200">
                      {openQuestions.includes(index) ? "−" : "+"}
                    </span>
                  </button>

                  {openQuestions.includes(index) && (
                    <div className="px-6 pb-6 border-t border-gray-100">
                      <p className="text-[#666666] font-thin leading-relaxed pt-4">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Back to Home */}
            <div className="pt-8 flex justify-center">
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
      <main className="hidden md:block max-w-4xl py-12 mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-semi-bold text-[#212427] mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-[#666666] font-thin">
            Everything you need to know about FortuneCookieBNB.xyz
          </p>
        </div>

        <div className="space-y-0">
          {faqData.map((faq, index) => (
            <div key={index} className="">
              <button
                onClick={() => toggleQuestion(index)}
                className="w-full p-6 text-left flex justify-between items-center cursor-pointer transition-colors duration-200"
              >
                <h2 className="text-xl font-semi-bold text-[#212427]">
                  {faq.question}
                </h2>
                <span className="text-2xl text-[#666666] transform transition-transform duration-200">
                  {openQuestions.includes(index) ? "−" : "+"}
                </span>
              </button>

              {openQuestions.includes(index) && (
                <div className="px-6 pb-6 border-t border-gray-100">
                  <p className="text-[#666666] font-thin leading-relaxed pt-4">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Back to Home */}
        <div className="pt-8 flex justify-center">
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
