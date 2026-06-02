import {
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import React from "react";

import { Cursor } from "./Cursor";

// 焦点节点位置（落在视觉中心略右下，对应图谱中的一个大节点区域）
const FOCAL = { x: 700, y: 380 };
const NODE_NAME = "能量";

// 周围 6 个连接节点（按相对极坐标分布在焦点四周）
const CONNECTIONS: { word: string; x: number; y: number }[] = [
  { word: "共振", x: 700, y: 180 },
  { word: "参考系", x: 925, y: 270 },
  { word: "关系", x: 970, y: 420 },
  { word: "黑洞", x: 890, y: 555 },
  { word: "当下", x: 560, y: 555 },
  { word: "心", x: 460, y: 270 },
];

export const GraphHover: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // 阶段：
  // 0–0.9s   光标进入并落到节点
  // 0.9–1.6s 焦点高亮 + 中心标签淡入
  // 1.6–4s   连线依次画出 + 标签依次浮起
  // 4s–end   保持

  const focalOpacity = interpolate(
    frame,
    [0.9 * fps, 1.6 * fps, durationInFrames - 12, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // 焦点呼吸（轻微脉动）
  const pulse = 1 + Math.sin(frame / 14) * 0.06;

  // 暗化非焦点区（径向 vignette）
  const dimOpacity = interpolate(
    frame,
    [0.9 * fps, 1.6 * fps, durationInFrames - 12, durationInFrames],
    [0, 0.6, 0.6, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <>
      {/* 径向暗化（突出焦点） */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at ${FOCAL.x}px ${FOCAL.y}px, transparent 110px, rgba(10,10,20,0.78) 360px)`,
          opacity: dimOpacity,
          pointerEvents: "none",
        }}
      />

      {/* 连接虚线（SVG） */}
      <svg
        width={1280}
        height={720}
        viewBox="0 0 1280 720"
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      >
        {CONNECTIONS.map((c, i) => {
          const start = 1.8 + i * 0.2;
          const end = start + 0.55;
          const lineP = interpolate(
            frame,
            [start * fps, end * fps],
            [0, 1],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.35, 0, 0.25, 1),
            }
          );
          const x2 = FOCAL.x + (c.x - FOCAL.x) * lineP;
          const y2 = FOCAL.y + (c.y - FOCAL.y) * lineP;
          return (
            <line
              key={c.word}
              x1={FOCAL.x}
              y1={FOCAL.y}
              x2={x2}
              y2={y2}
              stroke="rgba(255,138,122,0.85)"
              strokeWidth={1.8}
              strokeDasharray="5 4"
              style={{ filter: "blur(0.3px)" }}
            />
          );
        })}
      </svg>

      {/* 焦点节点 glow 圆环 */}
      <div
        style={{
          position: "absolute",
          left: FOCAL.x - 32 * pulse,
          top: FOCAL.y - 32 * pulse,
          width: 64 * pulse,
          height: 64 * pulse,
          borderRadius: "50%",
          border: "3px solid #ff8a7a",
          boxShadow:
            "0 0 40px rgba(232,93,78,0.95), inset 0 0 18px rgba(255,138,122,0.4)",
          background:
            "radial-gradient(circle, rgba(232,93,78,0.35) 0%, rgba(232,93,78,0.05) 70%, transparent 100%)",
          opacity: focalOpacity,
          pointerEvents: "none",
        }}
      />

      {/* 焦点节点中心标签（在圆环下方） */}
      <div
        style={{
          position: "absolute",
          left: FOCAL.x - 80,
          top: FOCAL.y + 50,
          width: 160,
          textAlign: "center",
          fontFamily: "'Noto Serif SC', serif",
          fontSize: 32,
          fontWeight: 500,
          color: "#ff8a7a",
          textShadow:
            "0 2px 12px rgba(0,0,0,0.95), 0 0 24px rgba(232,93,78,0.6)",
          letterSpacing: "0.1em",
          opacity: focalOpacity,
          pointerEvents: "none",
        }}
      >
        {NODE_NAME}
      </div>

      {/* 连接节点标签 */}
      {CONNECTIONS.map((c, i) => {
        const start = 2.0 + i * 0.2;
        const end = start + 0.5;
        const labelOpacity = interpolate(
          frame,
          [start * fps, end * fps, durationInFrames - 12, durationInFrames],
          [0, 1, 1, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );
        const labelDy = interpolate(
          frame,
          [start * fps, end * fps],
          [12, 0],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }
        );
        return (
          <div
            key={c.word}
            style={{
              position: "absolute",
              left: c.x - 60,
              top: c.y - 20 + labelDy,
              width: 120,
              textAlign: "center",
              opacity: labelOpacity,
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                display: "inline-block",
                padding: "6px 20px",
                fontFamily: "'Noto Serif SC', serif",
                fontSize: 22,
                fontWeight: 400,
                color: "#f5f0e8",
                background: "rgba(18,18,28,0.92)",
                border: "1.5px solid rgba(255,138,122,0.55)",
                borderRadius: 22,
                textShadow: "0 2px 6px rgba(0,0,0,0.6)",
                letterSpacing: "0.08em",
              }}
            >
              {c.word}
            </div>
          </div>
        );
      })}

      {/* 光标：从右上飞到焦点，hover 不点击 */}
      <Cursor
        from={{ x: 1200, y: 80 }}
        to={FOCAL}
        appearSec={0}
        moveDurSec={0.9}
        clickDelaySec={999}
        hideSec={durationInFrames / fps + 1}
      />
    </>
  );
};
