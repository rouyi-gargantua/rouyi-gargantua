import {
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import React from "react";

type Point = { x: number; y: number };

type Props = {
  from: Point;
  to: Point;
  /** 出现时间（秒） */
  appearSec: number;
  /** 移动用时（秒） */
  moveDurSec: number;
  /** 移动结束后到点击的延迟（秒） */
  clickDelaySec?: number;
  /** 隐藏时间（秒） */
  hideSec?: number;
};

export const Cursor: React.FC<Props> = ({
  from,
  to,
  appearSec,
  moveDurSec,
  clickDelaySec = 0.25,
  hideSec,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const startF = appearSec * fps;
  const moveEndF = startF + moveDurSec * fps;
  const clickF = moveEndF + clickDelaySec * fps;
  const hideF =
    hideSec !== undefined ? hideSec * fps : durationInFrames;

  // 出场/消失
  const opacity = interpolate(
    frame,
    [startF - 3, startF + 6, hideF - 6, hideF + 3],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // 移动
  const x = interpolate(frame, [startF, moveEndF], [from.x, to.x], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.35, 0.05, 0.25, 1),
  });
  const y = interpolate(frame, [startF, moveEndF], [from.y, to.y], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.35, 0.05, 0.25, 1),
  });

  // 点击抖动：scale 0.85 → 1，6 帧
  const clickScale = interpolate(
    frame,
    [clickF, clickF + 3, clickF + 8],
    [1, 0.82, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.4, 0, 0.4, 1),
    }
  );

  // 波纹：从点击位置扩散
  const rippleProgress = interpolate(
    frame,
    [clickF, clickF + 22],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const rippleSize = rippleProgress * 100;
  const rippleOpacity = (1 - rippleProgress) * 0.85;

  return (
    <>
      {/* 点击波纹 */}
      {frame >= clickF && frame < clickF + 25 && (
        <div
          style={{
            position: "absolute",
            left: to.x - rippleSize / 2,
            top: to.y - rippleSize / 2,
            width: rippleSize,
            height: rippleSize,
            borderRadius: "50%",
            border: "2px solid rgba(232, 93, 78, 0.95)",
            opacity: rippleOpacity,
            pointerEvents: "none",
            boxShadow: "0 0 16px rgba(232,93,78,0.5)",
          }}
        />
      )}

      {/* 光标 SVG */}
      <div
        style={{
          position: "absolute",
          left: x,
          top: y,
          opacity,
          transform: `scale(${clickScale})`,
          transformOrigin: "0 0",
          pointerEvents: "none",
          filter:
            "drop-shadow(0 2px 4px rgba(0,0,0,0.55))",
        }}
      >
        <svg width="26" height="32" viewBox="0 0 26 32">
          <path
            d="M2 2 L2 24 L8 19 L11.5 28 L14.5 26.7 L11 18 L18 18 Z"
            fill="#ffffff"
            stroke="#000000"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </>
  );
};
