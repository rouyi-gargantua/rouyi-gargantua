import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import React from "react";

type Props = {
  src: string;
  // 图片自然高度（px）
  imageHeight: number;
  // 起始/终止可视区的 y 偏移（0=图片顶部，imageHeight - 720=图片底部）
  fromY: number;
  toY: number;
  // 入场/出场淡入淡出（秒）
  fadeInSec?: number;
  fadeOutSec?: number;
  // 滚动缓动模式
  easing?: "linear" | "ease";
};

// 在画面里以 1280 宽展示，全高扫过
export const SiteScroll: React.FC<Props> = ({
  src,
  imageHeight,
  fromY,
  toY,
  fadeInSec = 0.6,
  fadeOutSec = 0.6,
  easing = "ease",
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeInFrames = fadeInSec * fps;
  const fadeOutFrames = fadeOutSec * fps;

  const easingFn =
    easing === "linear"
      ? (t: number) => t
      : Easing.bezier(0.4, 0, 0.4, 1);

  const y = interpolate(
    frame,
    [0, durationInFrames],
    [fromY, toY],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: easingFn,
    }
  );

  const opacity = interpolate(
    frame,
    [
      0,
      fadeInFrames,
      durationInFrames - fadeOutFrames,
      durationInFrames,
    ],
    [0, 1, 1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  return (
    <AbsoluteFill style={{ overflow: "hidden", opacity }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: -y,
          width: 1280,
          height: imageHeight * (1280 / 1920),
        }}
      >
        <Img
          src={staticFile(src)}
          style={{
            width: 1280,
            height: imageHeight * (1280 / 1920),
            display: "block",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
