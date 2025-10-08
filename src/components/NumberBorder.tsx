import React from "react";

interface NumberBorderProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

const NumberBorder: React.FC<NumberBorderProps> = ({
  children,
  className = "",
  onClick,
  style = {},
}) => {
  return (
    <div className={`relative ${className}`} onClick={onClick} style={style}>
      <div className="relative z-10">{children}</div>
      <style jsx>{`
        div {
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: linear-gradient(
            -75deg,
            rgba(255, 255, 255, 0.05),
            rgba(255, 255, 255, 0.2),
            rgba(255, 255, 255, 0.05)
          );
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
        }
      `}</style>
    </div>
  );
};

export default NumberBorder;
