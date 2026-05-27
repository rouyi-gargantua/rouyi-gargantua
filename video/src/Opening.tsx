import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import React from "react";

export const Opening: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // 0-1s: 标题渐入
  // 1.5-2.5s: 副标题渐入
  // last 0.6s: 双双淡出
  const titleIn = 0;
  const titleSettled = 1 * fps;
  const subIn = 1.4 * fps;
  const subSettled = 2.4 * fps;
  const fadeOut = durationInFrames - 0.6 * fps;

  const titleOpacity = interpolate(
    frame,
    [titleIn, titleSettled, fadeOut, durationInFrames],
    [0, 1, 1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    }
  );

  const titleY = interpolate(
    frame,
    [titleIn, titleSettled],
    [22, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    }
  );

  const subOpacity = interpolate(
    frame,
    [subIn, subSettled, fadeOut, durationInFrames],
    [0, 1, 1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    }
  );

  const subY = interpolate(
    frame,
    [subIn, subSettled],
    [16, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    }
  );

  return (
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(135deg, #0a0a14 0%, #14141e 50%, #1a1828 100%)",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      {/* 微光晕 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, rgba(232,93,78,0.08) 0%, transparent 55%)",
        }}
      />

      <div
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          fontFamily: "'Noto Serif SC', serif",
          fontSize: 116,
          fontWeight: 300,
          color: "#f5f0e8",
          letterSpacing: "0.32em",
          marginRight: "-0.32em",
        }}
      >
        塔与黑洞
      </div>

      <div
        style={{
          opacity: subOpacity,
          transform: `translateY(${subY}px)`,
          marginTop: 38,
          fontFamily: "'Noto Serif SC', serif",
          fontSize: 22,
          fontWeight: 300,
          color: "#a8a0b8",
          letterSpacing: "0.18em",
        }}
      >
        建造塔楼的人 · 与吹过塔楼的风
      </div>
    </AbsoluteFill>
  );
};
