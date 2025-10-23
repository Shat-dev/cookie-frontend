"use client";

import Image from "next/image";
import { useState, memo } from "react";
// Option 3: Static import (preferred)
import CookieImage from "../../public/cookie.png";

const Cookie: React.FC = memo(() => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="relative w-130 h-160">
      {/* SVG Outline - Transparent, path only is interactive */}
      <div className="absolute inset-0 translate-x-11 translate-y-18.5"></div>

      {/* Cookie Image - Option 3 with Option 1 fallback */}
      <div
        id="Cookie-image"
        className="absolute inset-0 pointer-events-none mr-2.5 transition-transform duration-200 scale-80"
      >
        {!imageError ? (
          // Option 3: Static import (preferred)
          <Image
            src={CookieImage}
            alt="Cookie Machine"
            fill
            className="object-contain"
            priority
            onError={() => setImageError(true)}
          />
        ) : (
          // Option 1: Explicit dimensions fallback
          <Image
            src="/cookie.png"
            alt="Cookie Machine"
            width={1080}
            height={1400}
            className="object-contain w-full h-full"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
          />
        )}
      </div>
    </div>
  );
});

Cookie.displayName = "Cookie";

export default Cookie;
