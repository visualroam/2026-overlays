import React, { useRef } from "react";

interface HexPatternProps {
  size?: number;
  gap?: number;
  strokeWidth?: number;
  strokeColor?: string;
  fillColor?: string;
  opacity?: number;
  className?: string;
}

const SQRT3 = Math.sqrt(3);
let HEX_PATTERN_COUNTER = 0;

const HexPattern: React.FC<HexPatternProps> = ({
  size = 10,
  gap = 0,
  strokeWidth = 1,
  strokeColor = "rgba(255,255,255,0.4)",
  fillColor = "none",
  opacity = 0.85,
  className,
}) => {
  const idRef = useRef<string | null>(null);
  if (idRef.current === null) {
    HEX_PATTERN_COUNTER += 1;
    idRef.current = `hex-${HEX_PATTERN_COUNTER}`;
  }
  const patternId = idRef.current;

  const w = size * SQRT3;
  const tw = w + gap;
  const dy = 1.5 * size + (gap * SQRT3) / 2;
  const th = 2 * dy;
  const hw = w / 2;
  const hs = size / 2;

  const hex = (cx: number, cy: number) =>
    [
      [cx, cy - size],
      [cx + hw, cy - hs],
      [cx + hw, cy + hs],
      [cx, cy + size],
      [cx - hw, cy + hs],
      [cx - hw, cy - hs],
    ]
      .map((p) => p.join(","))
      .join(" ");

  const polyProps = {
    fill: fillColor,
    stroke: strokeColor,
    strokeWidth,
  };

  return (
    <div
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: "inherit",
        overflow: "hidden",
        opacity,
        pointerEvents: "none",
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        preserveAspectRatio="none"
      >
        <defs>
          <pattern
            id={patternId}
            patternUnits="userSpaceOnUse"
            width={tw}
            height={th}
          >
            <polygon points={hex(tw / 2, size)} {...polyProps} />
            <polygon points={hex(0, size + dy)} {...polyProps} />
            <polygon points={hex(tw, size + dy)} {...polyProps} />
            <polygon points={hex(0, size - dy)} {...polyProps} />
            <polygon points={hex(tw, size - dy)} {...polyProps} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
    </div>
  );
};

export default HexPattern;
