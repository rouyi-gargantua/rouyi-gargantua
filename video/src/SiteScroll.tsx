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

type Keyframe = {
  /** 在 Sequence 内的相对秒数 */
  sec: number;
  /** 视口在 displayed 图像上的 y 偏移 */
  y: number;
};

type Props = {
  src: string;
  /** 原始图像高度（px，1920 宽下） */
  imageHeight: number;
  /** 关键帧序列；至少 2 个。相邻关键帧之间用 ease 缓动，整体形成"停-移-停"节奏 */
  keyframes: Keyframe[];
  fadeInSec?: number;
  fadeOutSec?: number;
};

// 渲染宽度固定 1280（视频宽度）。displayed height = imageHeight * 1280/1920
export const SiteScroll: React.FC<Props> = ({
  src,
  imageHeight,
  keyframes,
  fadeInSec = 0.6,
  fadeOutSec = 0.6,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const inputFrames = keyframes.map((k) => k.sec * fps);
  const outputYs = keyframes.map((k) => k.y);

  const y = interpolate(frame, inputFrames, outputYs, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.45, 0, 0.45, 1),
  });

  const fadeInFrames = fadeInSec * fps;
  const fadeOutFrames = fadeOutSec * fps;

  const opacity = interpolate(
    frame,
    [0, fadeInFrames, durationInFrames - fadeOutFrames, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const displayedHeight = imageHeight * (1280 / 1920);

  return (
    <AbsoluteFill style={{ overflow: "hidden", opacity }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: -y,
          width: 1280,
          height: displayedHeight,
        }}
      >
        <Img
          src={staticFile(src)}
          style={{ width: 1280, height: displayedHeight, display: "block" }}
        />
      </div>
    </AbsoluteFill>
  );
};
