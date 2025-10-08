import React from "react";

interface GlassmorphismDivProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
  borderRadius?: string;
  disableOnMobile?: boolean; // New prop to disable glassmorphism on mobile
}

const GlassmorphismDiv: React.FC<GlassmorphismDivProps> = ({
  children,
  className = "",
  onClick,
  style = {},
  borderRadius,
  disableOnMobile = false,
}) => {
  // If disableOnMobile is true, render simple div on mobile
  if (disableOnMobile) {
    return (
      <>
        {/* Mobile version - simple background */}
        <div
          className={`sm:hidden ${className}`}
          onClick={onClick}
          style={style}
        >
          {children}
        </div>

        {/* Desktop version - full glassmorphism */}
        <div
          className={`hidden sm:block glassmorphism-container ${className}`}
          onClick={onClick}
          style={style}
        >
          <div className="glassmorphism-shadow"></div>
          <div className="glassmorphism-content">{children}</div>
          <GlassmorphismStyles borderRadius={borderRadius} onClick={onClick} />
        </div>
      </>
    );
  }

  // Standard glassmorphism for all screens
  return (
    <div
      className={`glassmorphism-container ${className} `}
      onClick={onClick}
      style={style}
    >
      <div className="glassmorphism-shadow"></div>
      <div className="glassmorphism-content">{children}</div>
      <GlassmorphismStyles borderRadius={borderRadius} onClick={onClick} />
    </div>
  );
};

// Extracted styles component to avoid duplication
const GlassmorphismStyles: React.FC<{
  borderRadius?: string;
  onClick?: () => void;
}> = ({ borderRadius, onClick }) => (
  <style jsx>{`
    /* Defs */
    @property --angle-1 {
      syntax: "<angle>";
      inherits: false;
      initial-value: -75deg;
    }

    @property --angle-2 {
      syntax: "<angle>";
      inherits: false;
      initial-value: -45deg;
    }

    :root {
      --global--size: clamp(2rem, 4vw, 5rem);
      --anim--hover-time: 2000ms;
      --anim--hover-ease: cubic-bezier(0.25, 1, 0.5, 1);
    }

    .glassmorphism-container {
      position: relative;
      z-index: 2;
      background: transparent;
      transition: all var(--anim--hover-time) var(--anim--hover-ease);
      cursor: ${onClick ? "pointer" : "default"};
      /* No pointer-events here! */
    }

    .glassmorphism-shadow {
      --shadow-cuttoff-fix: 2em;
      position: absolute;
      width: calc(100% + var(--shadow-cuttoff-fix));
      height: calc(100% + var(--shadow-cuttoff-fix));
      top: calc(0% - var(--shadow-cuttoff-fix) / 2);
      left: calc(0% - var(--shadow-cuttoff-fix) / 2);
      filter: blur(clamp(2px, 0.125em, 12px));
      -webkit-filter: blur(clamp(2px, 0.125em, 12px));
      -moz-filter: blur(clamp(2px, 0.125em, 12px));
      -ms-filter: blur(clamp(2px, 0.125em, 12px));
      overflow: visible;
      pointer-events: auto;
      border-radius: ${borderRadius || "inherit"};
    }

    .glassmorphism-shadow::after {
      content: "";
      position: absolute;
      z-index: 0;
      inset: 0;
      border-radius: ${borderRadius || "inherit"}; /* Add this line */
      background: linear-gradient(
        180deg,
        rgba(0, 0, 0, 0.2),
        rgba(0, 0, 0, 0.1)
      );
      width: calc(100% - var(--shadow-cuttoff-fix) - 0.25em);
      height: calc(100% - var(--shadow-cuttoff-fix) - 0.25em);
      top: calc(var(--shadow-cuttoff-fix) - 0.7em);
      left: calc(var(--shadow-cuttoff-fix) - 0.875em);
      padding: 0.125em;
      box-sizing: border-box;
      mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
      mask-composite: exclude;
      transition: all var(--anim--hover-time) var(--anim--hover-ease);
      overflow: visible;
      opacity: 1;
    }

    .glassmorphism-content {
      --border-width: clamp(1px, 0.0625em, 4px);
      position: relative;
      -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
      pointer-events: auto;
      z-index: 3;
      cursor: ${onClick ? "pointer" : "default"};
      border-radius: ${borderRadius || "inherit"};
      background: linear-gradient(
        -75deg,
        rgba(255, 255, 255, 0.05),
        rgba(255, 255, 255, 0.2),
        rgba(255, 255, 255, 0.05)
      );
      box-shadow: inset 0em 0.125em 0.125em rgba(0, 0, 0, 0.05),
        inset 0 0.125em 0.125em rgba(255, 255, 255, 0.5),
        0 0.25em 0.125em -0.125em rgba(0, 0, 0, 0.2),
        0 0 0.1em 0.25em inset rgba(255, 255, 255, 0.05),
        0 0 0 0 rgba(255, 255, 255, 1);
      backdrop-filter: blur(clamp(1px, 0.125em, 4px));
      -webkit-backdrop-filter: blur(clamp(1px, 0.125em, 4px));
      -moz-backdrop-filter: blur(clamp(1px, 0.125em, 4px));
      -ms-backdrop-filter: blur(clamp(1px, 0.125em, 4px));
      transition: all var(--anim--hover-time) var(--anim--hover-ease);
    }

    .glassmorphism-content::before {
      content: "";
      display: block;
      position: absolute;
      z-index: 1;
      width: calc(100% - var(--border-width));
      height: calc(100% - var(--border-width));
      top: calc(0% + var(--border-width) / 2);
      left: calc(0% + var(--border-width) / 2);
      box-sizing: border-box;
      pointer-events: none;
      overflow: clip;
      border-radius: ${borderRadius || "inherit"};
      background: linear-gradient(
        var(--angle-2),
        rgba(255, 255, 255, 0) 0%,
        rgba(255, 255, 255, 0.5) 30% 0%,
        rgba(255, 255, 255, 0) 55%
      );
      mix-blend-mode: screen;
      background-size: 200% 200%;
      background-position: 0% 50%;
      background-repeat: no-repeat;
      transition: background-position calc(var(--anim--hover-time) * 1.25)
          var(--anim--hover-ease),
        --angle-2 calc(var(--anim--hover-time) * 1.25) var(--anim--hover-ease);
    }

    @media (hover: none) and (pointer: coarse) {
      .glassmorphism-content::before,
      .glassmorphism-content:active::before {
        --angle-2: -45deg;
      }
    }

    .glassmorphism-content::after {
      content: "";
      position: absolute;
      z-index: 1;
      inset: 0;
      width: calc(100% + var(--border-width));
      height: calc(100% + var(--border-width));
      top: calc(0% - var(--border-width) / 2);
      left: calc(0% - var(--border-width) / 2);
      padding: var(--border-width);
      box-sizing: border-box;
      pointer-events: none;
      border-radius: ${borderRadius || "inherit"};
      background: conic-gradient(
          from var(--angle-1) at 50% 50%,
          rgba(0, 0, 0, 0.5),
          rgba(0, 0, 0, 0) 5% 40%,
          rgba(0, 0, 0, 0.5) 50%,
          rgba(0, 0, 0, 0) 60% 95%,
          rgba(0, 0, 0, 0.5)
        ),
        linear-gradient(
          180deg,
          rgba(255, 255, 255, 0.5),
          rgba(255, 255, 255, 0.5)
        );
      mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
      mask-composite: exclude;
      transition: all var(--anim--hover-time) var(--anim--hover-ease),
        --angle-1 1000ms ease;
      box-shadow: inset 0 0 0 calc(var(--border-width) / 2)
        rgba(255, 255, 255, 0.5);
    }

    @media (hover: none) and (pointer: coarse) {
      .glassmorphism-content::after,
      .glassmorphism-content:hover::after,
      .glassmorphism-content:active::after {
        --angle-1: -75deg;
      }
    }
  `}</style>
);

export default GlassmorphismDiv;
