import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import React from "react";

export const Finale: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const logoIn = 0.4 * fps;
  const logoSettled = 1.6 * fps;
  const tagIn = 1.8 * fps;
  const tagSettled = 2.8 * fps;
  const urlIn = 3.2 * fps;
  const urlSettled = 4.2 * fps;
  const fadeOut = durationInFrames - 0.6 * fps;

  const logoOpacity = interpolate(
    frame,
    [logoIn, logoSettled, fadeOut, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) }
  );
  const logoScale = interpolate(
    frame,
    [logoIn, logoSettled],
    [0.88, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) }
  );
  const tagOpacity = interpolate(
    frame,
    [tagIn, tagSettled, fadeOut, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const urlOpacity = interpolate(
    frame,
    [urlIn, urlSettled, fadeOut, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // 中心呼吸光晕
  const haloI = 0.55 + Math.sin(frame / 40) * 0.1;

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
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at center, rgba(232,93,78,${0.18 * haloI * logoOpacity}) 0%, transparent 50%)`,
        }}
      />

      <div
        style={{
          opacity: logoOpacity,
          transform: `scale(${logoScale})`,
          fontFamily: "'Noto Serif SC', serif",
          fontSize: 86,
          fontWeight: 300,
          color: "#f5f0e8",
          letterSpacing: "0.28em",
          marginRight: "-0.28em",
          textShadow:
            "0 0 30px rgba(232,93,78,0.45), 0 0 60px rgba(232,93,78,0.25)",
        }}
      >
        🕳️ 塔与黑洞
      </div>

      <div
        style={{
          opacity: tagOpacity,
          marginTop: 36,
          fontFamily: "'Noto Serif SC', serif",
          fontSize: 22,
          fontWeight: 300,
          color: "#c0b4a8",
          letterSpacing: "0.12em",
          fontStyle: "italic",
          maxWidth: 900,
          textAlign: "center",
          lineHeight: 1.6,
        }}
      >
        塔楼在感受吹拂过塔楼的微风时，才开始呼吸
      </div>

      <div
        style={{
          opacity: urlOpacity,
          marginTop: 56,
          fontFamily: "'Inter', sans-serif",
          fontSize: 15,
          color: "rgba(232,93,78,0.9)",
          letterSpacing: "0.22em",
        }}
      >
        rouyi-gargantua.github.io/rouyi-gargantua
      </div>
    </AbsoluteFill>
  );
};
