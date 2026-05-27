import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import React from "react";

type Props = {
  text: string;
  fromSec?: number;
  toSec?: number;
  fadeSec?: number;
  position?: "bottom" | "center";
  size?: number;
};

export const Subtitle: React.FC<Props> = ({
  text,
  fromSec = 0,
  toSec,
  fadeSec = 0.6,
  position = "bottom",
  size = 38,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fromFrame = fromSec * fps;
  const toFrame =
    (toSec === undefined ? durationInFrames / fps : toSec) * fps;
  const fadeFrames = fadeSec * fps;

  const opacity = interpolate(
    frame,
    [fromFrame, fromFrame + fadeFrames, toFrame - fadeFrames, toFrame],
    [0, 1, 1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    }
  );

  const y = interpolate(
    frame,
    [fromFrame, fromFrame + fadeFrames],
    [12, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    }
  );

  // 底部暗化渐变：随字幕可见度淡入，让字幕底部有一层 cinematic 的"低三分之一"
  const bandOpacity = opacity * 0.85;

  return (
    <>
      {/* 底部暗化条 */}
      {position === "bottom" && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 220,
            background:
              "linear-gradient(180deg, rgba(8,8,16,0) 0%, rgba(8,8,16,0.55) 55%, rgba(8,8,16,0.85) 100%)",
            opacity: bandOpacity,
            pointerEvents: "none",
          }}
        />
      )}

      <div
        style={{
          position: "absolute",
          left: "50%",
          opacity,
          ...(position === "center"
            ? {
                top: "50%",
                transform: `translate(-50%, calc(-50% + ${y}px))`,
              }
            : {
                bottom: 64,
                transform: `translateX(-50%) translateY(${y}px)`,
              }),
          fontFamily: "'Noto Serif SC', serif",
          fontSize: size,
          fontWeight: 300,
          color: "#f5f0e8",
          letterSpacing: "0.1em",
          textAlign: "center",
          textShadow:
            "0 2px 14px rgba(0,0,0,0.95), 0 0 30px rgba(0,0,0,0.7)",
          maxWidth: 1100,
          lineHeight: 1.55,
          padding: "0 60px",
          whiteSpace: "pre-wrap",
        }}
      >
        {text}
      </div>
    </>
  );
};
