export type Language = "en" | "zh";

export interface Translations {
  // Common/Shared
  common: {
    prizePool: string;
    timeLeft: string;
    currentEntries: string;
    activeEntries: string;
    drawNumber: string;
    calculating: string;
    backToHome: string;
    currentPool: string;
    enterCookie: string;
    latestWinners: string;
    copiedSuccessfully: string;
    refreshPool: string;
    refreshing: string;
    nextUpdate: string;
    clear: string;
    loading: string;
  };

  // Header
  header: {
    bscFirstLottery: string;
    twitter: string;
    contract: string;
    dexscreener: string;
    howItWorks: string;
    docs: string;
    faq: string;
    results: string;
    menu: string;
    closeMenu: string;
  };

  // Footer
  footer: {
    erc404PoweredLottery: string;
    copyright: string;
  };

  // Home Page
  home: {
    title: string;
    description: string;
  };

  // FAQ Page
  faq: {
    title: string;
    subtitle: string;
    questions: {
      whatIsCookie: {
        question: string;
        answer: string;
      };
      howToEnter: {
        question: string;
        answer: string;
      };
      needToPostEveryDraw: {
        question: string;
        answer: string;
      };
      deletePost: {
        question: string;
        answer: string;
      };
      repostForNewTokens: {
        question: string;
        answer: string;
      };
      chainlinkVrf: {
        question: string;
        answer: string;
      };
      winMultipleTimes: {
        question: string;
        answer: string;
      };
      drawFrequency: {
        question: string;
        answer: string;
      };
      eligibilityVerification: {
        question: string;
        answer: string;
      };
      bscWallet: {
        question: string;
        answer: string;
      };
      transferNfts: {
        question: string;
        answer: string;
      };
      prizeFunding: {
        question: string;
        answer: string;
      };
    };
  };

  // How It Works Page
  howItWorks: {
    title: string;
    subtitle: string;
    projectOverview: {
      title: string;
      description: string;
    };
    howToEnter: {
      title: string;
      steps: {
        acquireCookie: {
          title: string;
          description: string;
        };
        postOnX: {
          title: string;
          description: string;
        };
        automaticEntries: {
          title: string;
          description: string;
        };
        automatedDrawings: {
          title: string;
          description: string;
        };
      };
    };
    whyItWorks: {
      title: string;
      points: {
        builtInVirality: {
          title: string;
          description: string;
        };
        marketingFlywheel: {
          title: string;
          description: string;
        };
        tokenFlywheel: {
          title: string;
          description: string;
          details: {
            intro: string;
            buybacks: string;
            prizePool: string;
            team: string;
          };
        };
        compoundingValue: {
          title: string;
          description: string;
        };
      };
    };
    technology: {
      title: string;
      items: {
        erc404Tax: {
          title: string;
          description: string;
        };
        lotteryContract: {
          title: string;
          description: string;
        };
        chainlinkVrf: {
          title: string;
          description: string;
        };
        bscNetwork: {
          title: string;
          description: string;
        };
        smartContracts: {
          title: string;
          description: string;
        };
      };
    };
    tokenomics: {
      title: string;
      description: string;
      breakdown: {
        buybacks: string;
        prizePool: string;
        team: string;
      };
      conclusion: string;
    };
  };

  // Current Pool Page
  currentPool: {
    title: string;
    subtitle: string;
    totalPrizePool: string;
    liveCookiePool: string;
    entries: string;
    walletAddressPlaceholder: string;
    validAddressPrompt: string;
    noEntriesDetected: string;
    walletHasEntries: string;
    noNftsYet: string;
    waitingForTweets: string;
  };

  // Enter Page (if needed for future)
  enter: {
    title: string;
    // Add more fields as needed
  };

  // Results Page (if needed for future)
  results: {
    title: string;
    // Add more fields as needed
  };

  // Language Toggle
  language: {
    english: string;
    chinese: string;
    toggleLanguage: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    common: {
      prizePool: "Prize Pool",
      timeLeft: "Time Left",
      currentEntries: "Current Entries",
      activeEntries: "Active Entries",
      drawNumber: "Draw Number",
      calculating: "Calculating...",
      backToHome: "Back to Home",
      currentPool: "Current pool",
      enterCookie: "Enter Cookie",
      latestWinners: "Latest winners",
      copiedSuccessfully: "Copied Successfully!",
      refreshPool: "Refresh Pool",
      refreshing: "Refreshing...",
      nextUpdate: "Next update",
      clear: "Clear",
      loading: "Loading...",
    },

    header: {
      bscFirstLottery: "BSC's first on-chain lottery",
      twitter: "Twitter",
      contract: "Contract",
      dexscreener: "Dexscreener",
      howItWorks: "How it works",
      docs: "Docs",
      faq: "FAQ",
      results: "Results",
      menu: "Menu",
      closeMenu: "Close menu",
    },

    footer: {
      erc404PoweredLottery: "ERC-404 POWERED LOTTERY ON BSC",
      copyright: "CookieBNB.xyz 2025",
    },

    home: {
      title: "PLAY $COOKIE 饼干",
      description: "The first BSC Lottery. Immutable, automated, always fair",
    },

    faq: {
      title: "Frequently Asked Questions",
      subtitle: "Everything you need to know about CookieBNB.xyz",
      questions: {
        whatIsCookie: {
          question: "What is Cookie about?",
          answer:
            "Cookie is the first fully-automated on-chain BSC lottery. It is powered by ERC-404 and Chainlink VRF, where NFT holders can participate in regular automated draws by proving ownership and social activity.",
        },
        howToEnter: {
          question: "How do I enter the lottery?",
          answer:
            "To enter, you must hold at least one full Cookie token (ERC-404), receive the associated NFT, post on X/Twitter using our default template.",
        },
        needToPostEveryDraw: {
          question: "Do I need to post every draw to stay eligible?",
          answer:
            "No. Once you have posted, you are entered into all future draws as long as you continue holding your NFT and your post remains visible/active.",
        },
        deletePost: {
          question: "What happens if I delete my post?",
          answer:
            "Deleting your post removes your eligibility for the current draw and future draws. You will need to repost to re-enter.",
        },
        repostForNewTokens: {
          question:
            "Do I need to repost on X if I buy more tokens to enter them in the pool?",
          answer:
            "No. We auto-detect new tokens after your original X post and add them to the current pool.",
        },
        chainlinkVrf: {
          question: "What is Chainlink VRF and why is it used?",
          answer:
            "Chainlink VRF (Verifiable Random Function) ensures the randomness used to pick lottery winners is provably fair and tamper-proof.",
        },
        winMultipleTimes: {
          question: "Can I win more than once?",
          answer:
            "Yes. As long as you continue to meet the eligibility criteria, you can win multiple times.",
        },
        drawFrequency: {
          question: "How often is the draw conducted?",
          answer: "Draws occur automatically every 1 hour.",
        },
        eligibilityVerification: {
          question: "How is my eligibility verified?",
          answer:
            "Eligibility is checked on-chain via NFT ownership and off-chain via X/Twitter post detection and verification logic on the backend.",
        },
        bscWallet: {
          question: "Do I need a BSC wallet to participate?",
          answer:
            "Yes. Since the project is built on BSC (an L1 by ETH), you will need a wallet configured for the BSC network to participate.",
        },
        transferNfts: {
          question: "What happens if I transfer or sell a portion of my NFT's?",
          answer:
            "If you no longer hold the NFT in your wallet but have an existing X post, only the transferred tokens are removed from current and upcoming draws.",
        },
        prizeFunding: {
          question: "How are prizes funded?",
          answer:
            "The prize pool is built from trading volume and tokenomics. A 3% trading fee funds the lottery.",
        },
      },
    },

    howItWorks: {
      title: "About Cookie",
      subtitle: "A custom ERC-404 lottery project on BSC",
      projectOverview: {
        title: "Project Overview",
        description:
          "CookieBNB.xyz is a decentralized lottery system on the BSC network using a custom ERC-404 contract. Automated. Immutable. Always fair. Every draw combines marketing virality and tokenomics buybacks into a dual flywheel that compounds growth.",
      },
      howToEnter: {
        title: "How to Enter",
        steps: {
          acquireCookie: {
            title: "Acquire Your Cookie",
            description:
              "Buy at least 1 $Cookie token. Each token = 1 NFT and 1 lottery entry.",
          },
          postOnX: {
            title: "Post on X",
            description:
              "Post your NFT on X tagging @CookieBinance. Use our default template. All tokens in your wallet are auto-entered.",
          },
          automaticEntries: {
            title: "Automatic Entries",
            description:
              "Our backend tracks posts and wallets. New tokens are added automatically. Tokens you transfer out are removed. Delete your post and all entries pause until you post again.",
          },
          automatedDrawings: {
            title: "Automated Drawings",
            description:
              "Smart contracts instantly reward winners at the end of each draw.",
          },
        },
      },
      whyItWorks: {
        title: "Why It Works",
        points: {
          builtInVirality: {
            title: "Built-In Virality",
            description:
              "Posting on X makes every player a promoter, fueling organic exposure.",
          },
          marketingFlywheel: {
            title: "The Marketing Flywheel",
            description:
              "Posts → visibility → participation → liquidity → bigger prize pools. The cycle runs itself.",
          },
          tokenFlywheel: {
            title: "The Token Flywheel",
            description: "",
            details: {
              intro: "Each trade powers growth. With every transaction:",
              buybacks:
                "1% fuels automated buybacks (supply sinks, value rises).",
              prizePool: "3% grows the prize pool.",
              team: "1% supports the team.",
            },
          },
          compoundingValue: {
            title: "Compounding Value",
            description:
              "Each post drives attention. Each trade boosts liquidity. Each winner proves fairness. Together, the flywheels create unstoppable momentum.",
          },
        },
      },
      technology: {
        title: "Technology",
        items: {
          erc404Tax: {
            title: "ERC-404 Tax Standard",
            description:
              "The first-ever custom ERC-404 Tax contract. Tokenomics are built directly into the token's core logic—buybacks, prize pools, and accounting happen at the protocol level, not bolted on.",
          },
          lotteryContract: {
            title: "Lottery Contract",
            description:
              "Fully automated draw lifecycle. Rounds, entries, randomness, and payouts are handled on-chain with a complete audit trail.",
          },
          chainlinkVrf: {
            title: "Chainlink VRF",
            description:
              "Cryptographically verifiable randomness ensures every draw is transparent, unpredictable, and tamper-proof.",
          },
          bscNetwork: {
            title: "BSC Network",
            description:
              "Deployed on BSC for low fees, fast finality, and security.",
          },
          smartContracts: {
            title: "Smart Contracts",
            description:
              "Audited, deterministic, and designed for continuous automation without manual intervention.",
          },
        },
      },
      tokenomics: {
        title: "Tokenomics",
        description:
          "Cookie uses a 5% tax model integrated at the contract level. This ensures that every transaction fuels the ecosystem:",
        breakdown: {
          buybacks:
            "1% Buybacks — Automated buybacks reduce supply and strengthen price momentum.",
          prizePool:
            "3% Prize Pool — Directly expands lottery rewards, making each draw bigger and more attractive.",
          team: "1% Team — Supports long-term development and ecosystem growth.",
        },
        conclusion:
          "This design creates a natural flywheel: volume drives prize pools, buybacks support token value, and posts generate visibility. Every player powers the system just by participating.",
      },
    },

    currentPool: {
      title: "Current Pool",
      subtitle: "View the current pool information",
      totalPrizePool: "Total Prize Pool",
      liveCookiePool: "Live Cookie pool",
      entries: "entries",
      walletAddressPlaceholder: "Enter Wallet Address",
      validAddressPrompt: "Please enter a valid wallet address",
      noEntriesDetected:
        "No entries detected. Recent posts may still be syncing.",
      walletHasEntries: "Wallet currently has",
      noNftsYet: "No NFTs yet. Waiting for tweets...",
      waitingForTweets: "Waiting for tweets...",
    },

    enter: {
      title: "Enter Lottery",
    },

    results: {
      title: "Results",
    },

    language: {
      english: "EN",
      chinese: "中文",
      toggleLanguage: "Toggle Language",
    },
  },

  zh: {
    common: {
      prizePool: "奖池",
      timeLeft: "剩余时间",
      currentEntries: "当前参与数",
      activeEntries: "活跃参与数",
      drawNumber: "抽奖期数",
      calculating: "计算中...",
      backToHome: "返回首页",
      currentPool: "当前奖池",
      enterCookie: "参与抽奖",
      latestWinners: "最新获奖者",
      copiedSuccessfully: "复制成功！",
      refreshPool: "刷新奖池",
      refreshing: "刷新中...",
      nextUpdate: "下次更新",
      clear: "清除",
      loading: "加载中...",
    },

    header: {
      bscFirstLottery: "BSC首个链上彩票",
      twitter: "推特",
      contract: "合约",
      dexscreener: "Dexscreener",
      howItWorks: "运作原理",
      docs: "文档",
      faq: "常见问题",
      results: "结果",
      menu: "菜单",
      closeMenu: "关闭菜单",
    },

    footer: {
      erc404PoweredLottery: "BSC上的ERC-404驱动彩票",
      copyright: "CookieBNB.xyz 2025",
    },

    home: {
      title: "PLAY $COOKIE 饼干",
      description: "首个BSC彩票。不可变、自动化、永远公平",
    },

    faq: {
      title: "常见问题",
      subtitle: "关于CookieBNB.xyz您需要了解的一切",
      questions: {
        whatIsCookie: {
          question: "Cookie是什么？",
          answer:
            "Cookie是首个完全自动化的BSC链上彩票。它由ERC-404和Chainlink VRF驱动，NFT持有者可以通过证明所有权和社交活动参与定期自动抽奖。",
        },
        howToEnter: {
          question: "如何参与彩票？",
          answer:
            "要参与，您必须持有至少一个完整的Cookie代币（ERC-404），获得相关NFT，并使用我们的默认模板在X/Twitter上发帖。",
        },
        needToPostEveryDraw: {
          question: "我需要每次抽奖都发帖才能保持资格吗？",
          answer:
            "不需要。一旦您发帖，只要您继续持有NFT且帖子保持可见/活跃状态，您就会自动参与所有未来的抽奖。",
        },
        deletePost: {
          question: "如果我删除帖子会怎样？",
          answer:
            "删除帖子会取消您当前和未来抽奖的资格。您需要重新发帖才能重新参与。",
        },
        repostForNewTokens: {
          question: "如果我购买更多代币来参与奖池，需要在X上重新发帖吗？",
          answer:
            "不需要。我们会在您原始X帖子后自动检测新代币并将其添加到当前奖池中。",
        },
        chainlinkVrf: {
          question: "什么是Chainlink VRF，为什么使用它？",
          answer:
            "Chainlink VRF（可验证随机函数）确保用于选择彩票获奖者的随机性是可证明公平且防篡改的。",
        },
        winMultipleTimes: {
          question: "我可以多次获奖吗？",
          answer: "可以。只要您继续满足资格标准，您就可以多次获奖。",
        },
        drawFrequency: {
          question: "抽奖多久进行一次？",
          answer: "抽奖每1小时自动进行一次。",
        },
        eligibilityVerification: {
          question: "如何验证我的资格？",
          answer:
            "资格通过链上NFT所有权检查和链下X/Twitter帖子检测及后端验证逻辑进行验证。",
        },
        bscWallet: {
          question: "我需要BSC钱包才能参与吗？",
          answer:
            "是的。由于项目构建在BSC（以太坊的L1）上，您需要配置BSC网络的钱包才能参与。",
        },
        transferNfts: {
          question: "如果我转移或出售部分NFT会怎样？",
          answer:
            "如果您的钱包中不再持有NFT但有现有的X帖子，只有转移的代币会从当前和即将到来的抽奖中移除。",
        },
        prizeFunding: {
          question: "奖金如何筹集？",
          answer: "奖池由交易量和代币经济学构建。3%的交易费用为彩票提供资金。",
        },
      },
    },

    howItWorks: {
      title: "关于Cookie",
      subtitle: "BSC上的自定义ERC-404彩票项目",
      projectOverview: {
        title: "项目概述",
        description:
          "CookieBNB.xyz是BSC网络上使用自定义ERC-404合约的去中心化彩票系统。自动化。不可变。永远公平。每次抽奖都将营销病毒性和代币经济学回购结合成双重飞轮，实现复合增长。",
      },
      howToEnter: {
        title: "如何参与",
        steps: {
          acquireCookie: {
            title: "获取您的Cookie",
            description:
              "购买至少1个$Cookie代币。每个代币 = 1个NFT和1个彩票参与权。",
          },
          postOnX: {
            title: "在X上发帖",
            description:
              "在X上发布您的NFT并标记@CookieBinance。使用我们的默认模板。您钱包中的所有代币都会自动参与。",
          },
          automaticEntries: {
            title: "自动参与",
            description:
              "我们的后端跟踪帖子和钱包。新代币会自动添加。您转出的代币会被移除。删除帖子，所有参与都会暂停，直到您再次发帖。",
          },
          automatedDrawings: {
            title: "自动抽奖",
            description: "智能合约在每次抽奖结束时立即奖励获奖者。",
          },
        },
      },
      whyItWorks: {
        title: "为什么有效",
        points: {
          builtInVirality: {
            title: "内置病毒性",
            description: "在X上发帖使每个玩家都成为推广者，推动有机曝光。",
          },
          marketingFlywheel: {
            title: "营销飞轮",
            description:
              "帖子 → 可见性 → 参与 → 流动性 → 更大的奖池。循环自我运行。",
          },
          tokenFlywheel: {
            title: "代币飞轮",
            description: "",
            details: {
              intro: "每笔交易都推动增长。每笔交易：",
              buybacks: "1%推动自动回购（供应下沉，价值上升）。",
              prizePool: "3%增长奖池。",
              team: "1%支持团队。",
            },
          },
          compoundingValue: {
            title: "复合价值",
            description:
              "每个帖子推动关注。每笔交易提升流动性。每个获奖者证明公平性。飞轮共同创造不可阻挡的动力。",
          },
        },
      },
      technology: {
        title: "技术",
        items: {
          erc404Tax: {
            title: "ERC-404税收标准",
            description:
              "首个自定义ERC-404税收合约。代币经济学直接构建到代币的核心逻辑中——回购、奖池和会计在协议层面进行，而不是后加的。",
          },
          lotteryContract: {
            title: "彩票合约",
            description:
              "完全自动化的抽奖生命周期。轮次、参与、随机性和支付都在链上处理，具有完整的审计跟踪。",
          },
          chainlinkVrf: {
            title: "Chainlink VRF",
            description:
              "加密可验证的随机性确保每次抽奖都是透明、不可预测和防篡改的。",
          },
          bscNetwork: {
            title: "BSC网络",
            description: "部署在BSC上，具有低费用、快速最终性和安全性。",
          },
          smartContracts: {
            title: "智能合约",
            description: "经过审计、确定性，设计用于无需人工干预的持续自动化。",
          },
        },
      },
      tokenomics: {
        title: "代币经济学",
        description:
          "Cookie使用在合约层面集成的5%税收模型。这确保每笔交易都为生态系统提供燃料：",
        breakdown: {
          buybacks: "1%回购 — 自动回购减少供应并加强价格动力。",
          prizePool: "3%奖池 — 直接扩大彩票奖励，使每次抽奖更大更有吸引力。",
          team: "1%团队 — 支持长期开发和生态系统增长。",
        },
        conclusion:
          "这种设计创造了自然飞轮：交易量推动奖池，回购支持代币价值，帖子产生可见性。每个玩家仅通过参与就为系统提供动力。",
      },
    },

    currentPool: {
      title: "当前奖池",
      subtitle: "查看当前奖池信息",
      totalPrizePool: "总奖池",
      liveCookiePool: "实时Cookie奖池",
      entries: "参与数",
      walletAddressPlaceholder: "输入钱包地址",
      validAddressPrompt: "请输入有效的钱包地址",
      noEntriesDetected: "未检测到参与。最近的帖子可能仍在同步中。",
      walletHasEntries: "钱包当前有",
      noNftsYet: "暂无NFT。等待推文中...",
      waitingForTweets: "等待推文中...",
    },

    enter: {
      title: "参与彩票",
    },

    results: {
      title: "结果",
    },

    language: {
      english: "EN",
      chinese: "中文",
      toggleLanguage: "切换语言",
    },
  },
};
