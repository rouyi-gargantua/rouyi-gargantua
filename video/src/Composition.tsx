import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/NotoSerifSC";
import React from "react";

import { SiteScroll } from "./SiteScroll";
import { Subtitle } from "./Subtitle";

loadFont("normal", { weights: ["300", "400", "600"] });

// 47s @ 30fps
// ① Homepage 0-24s：4 个 section 各停 3s + 中间过渡 3s
// ② 间隙 24-37s
// ③ 关键词图谱 37-47s
//
// Homepage 截图原始 1920x5400 → 显示宽 1280，高 3600，视口 720
// 4 个 section anchor（displayed y，视口顶部）：
//   Hero:      0     (Hero 占 0–720)
//   Rouyi:     720   (Rouyi 占 ~720–1400)
//   Gargantua: 1400  (Gargantua 占 ~1400–2160)
//   Articles:  2400  (Articles 占 ~2100–3600，y=2400 露中部)

export const TowerAndBlackhole: React.FC = () => {
  const { fps } = useVideoConfig();
  const s = (sec: number) => Math.round(sec * fps);

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a14" }}>
      {/* ① Homepage 0-24s */}
      <Sequence from={s(0)} durationInFrames={s(24) + s(0.4)} layout="none" name="① Homepage">
        <SiteScroll
          src="shots/home-full.png"
          imageHeight={5400}
          keyframes={[
            { sec: 0, y: 0 },         // Hero 入场
            { sec: 4.5, y: 0 },        // 停在 Hero
            { sec: 7, y: 720 },        // 过渡到 Rouyi
            { sec: 10.5, y: 720 },     // 停在 Rouyi
            { sec: 13, y: 1400 },      // 过渡到 Gargantua
            { sec: 16.5, y: 1400 },    // 停在 Gargantua
            { sec: 19, y: 2400 },      // 过渡到 Articles
            { sec: 24, y: 2400 },      // 停在 Articles
          ]}
          fadeInSec={0.8}
          fadeOutSec={0.6}
        />
        {/* 字幕严格对齐 section 停留窗口 */}
        <Subtitle text="建造塔楼的人 · 与吹过塔楼的风" fromSec={0.8} toSec={5.5} />
        <Subtitle text="工作 · 归因 · 感受" fromSec={7.3} toSec={11.5} />
        <Subtitle text="弯曲时空 · 等待光子" fromSec={13.3} toSec={17.5} />
        <Subtitle
          text="塔楼正在生长"
          fromSec={19.5}
          toSec={23.8}
        />
      </Sequence>

      {/* ② 间隙文章 24-37s（13s） */}
      <Sequence
        from={s(24) - s(0.4)}
        durationInFrames={s(13) + s(0.8)}
        layout="none"
        name="② 间隙"
      >
        <SiteScroll
          src="shots/gap-full.png"
          imageHeight={2800}
          keyframes={[
            { sec: 0, y: 0 },       // 文章标题
            { sec: 3, y: 0 },       // 停在标题/lead
            { sec: 6, y: 460 },     // 过渡到正文中段（一、神经元的不应期）
            { sec: 9, y: 460 },     // 停在正文
            { sec: 13, y: 1100 },   // 滑到文章末尾的金句区
          ]}
          fadeInSec={0.6}
          fadeOutSec={0.6}
        />
        <Subtitle
          text="塔之所以是塔，是因为砖石之间有缝。缝里有风。"
          fromSec={1}
          toSec={12.5}
          size={34}
        />
      </Sequence>

      {/* ③ 关键词图谱 37-47s（10s） */}
      <Sequence
        from={s(37) - s(0.4)}
        durationInFrames={s(10) + s(0.8)}
        layout="none"
        name="③ 图谱"
      >
        <SiteScroll
          src="shots/keyword-graph-full.png"
          imageHeight={2400}
          keyframes={[
            { sec: 0, y: 0 },       // Hero 区
            { sec: 2.5, y: 0 },     // 停顿
            { sec: 5, y: 540 },     // 滑到「交互式知识网络」图本身
            { sec: 10, y: 540 },    // 一直停在图上
          ]}
          fadeInSec={0.6}
          fadeOutSec={0.8}
        />
        <Subtitle
          text={"65 个节点 · 140 条连线\n一个人的思维网络"}
          fromSec={5.5}
          toSec={9.5}
          size={32}
        />
      </Sequence>
    </AbsoluteFill>
  );
};
