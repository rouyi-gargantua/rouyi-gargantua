import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/NotoSerifSC";
import React from "react";

import { SiteScroll } from "./SiteScroll";
import { Cursor } from "./Cursor";
import { GraphHover } from "./GraphHover";

loadFont("normal", { weights: ["300", "400", "600"] });

/*
 ① Homepage    0–33s   末段光标 → 塔卡片「阅读全文」→ 点击
 ② 塔 文章页   33–51s   末段光标 → 导航「关键词图谱」→ 点击
 ③ 关键词图谱  51–65s   标题 → 滑到图谱 → 末段光标 hover 在「能量」节点上，展开关系
*/

export const TowerAndBlackhole: React.FC = () => {
  const { fps } = useVideoConfig();
  const s = (sec: number) => Math.round(sec * fps);

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a14" }}>
      {/* ① Homepage 0–33s */}
      <Sequence
        from={s(0)}
        durationInFrames={s(33.4)}
        layout="none"
        name="① Homepage"
      >
        <SiteScroll
          src="shots/home-full.png"
          imageHeight={6800}
          keyframes={[
            { sec: 0, y: 0 },
            { sec: 5, y: 0 },
            { sec: 7, y: 720 },
            { sec: 12, y: 720 },
            { sec: 14, y: 1400 },
            { sec: 19, y: 1400 },
            { sec: 21, y: 2200 },
            { sec: 25, y: 2200 },
            { sec: 27, y: 3200 },
            { sec: 33, y: 3200 },
          ]}
          fadeInSec={0.8}
          fadeOutSec={0.8}
        />

        {/* 光标 → 塔卡片「阅读全文 →」链接（卡片底部红字） */}
        {/* viewport y=3200 时塔卡片在 y≈300-510；阅读全文链接在卡片底部，x≈180, y≈505 */}
        <Cursor
          from={{ x: 1180, y: 640 }}
          to={{ x: 180, y: 505 }}
          appearSec={28}
          moveDurSec={2.5}
          clickDelaySec={0.3}
          hideSec={33.3}
        />
      </Sequence>

      {/* ② 塔 文章页 33–51s（18s） */}
      <Sequence
        from={s(33) - s(0.4)}
        durationInFrames={s(18) + s(0.8)}
        layout="none"
        name="② 塔"
      >
        <SiteScroll
          src="shots/tower-full.png"
          imageHeight={4500}
          keyframes={[
            { sec: 0, y: 0 },
            { sec: 4, y: 0 },
            { sec: 6, y: 600 },
            { sec: 10, y: 600 },
            { sec: 12, y: 1500 },
            { sec: 15, y: 1500 },
            { sec: 16.5, y: 0 },
            { sec: 18, y: 0 },
          ]}
          fadeInSec={0.8}
          fadeOutSec={0.6}
        />

        {/* 光标 → 导航「🧠 关键词图谱」 */}
        <Cursor
          from={{ x: 640, y: 500 }}
          to={{ x: 880, y: 40 }}
          appearSec={16.5}
          moveDurSec={1.5}
          clickDelaySec={0.3}
          hideSec={17.9}
        />
      </Sequence>

      {/* ③ 关键词图谱 51–65s（14s） */}
      <Sequence
        from={s(51) - s(0.4)}
        durationInFrames={s(14) + s(0.4)}
        layout="none"
        name="③ 图谱"
      >
        <SiteScroll
          src="shots/keyword-graph-full.png"
          imageHeight={2400}
          keyframes={[
            { sec: 0, y: 0 },
            { sec: 3, y: 0 },
            { sec: 5, y: 540 },
            { sec: 14, y: 540 },
          ]}
          fadeInSec={0.8}
          fadeOutSec={1.0}
        />

        {/* hover 效果：从 7s 起在图上展开关系 */}
        <Sequence from={s(7)} durationInFrames={s(7)} layout="none" name="hover">
          <GraphHover />
        </Sequence>
      </Sequence>
    </AbsoluteFill>
  );
};
