import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/NotoSerifSC";
import React from "react";

import { Opening } from "./Opening";
import { Finale } from "./Finale";
import { SiteScroll } from "./SiteScroll";
import { Subtitle } from "./Subtitle";

loadFont("normal", { weights: ["300", "400", "600"] });

// 60s @ 30fps
// 时间表（秒）：
//   0- 5    Opening
//   5-29   Homepage 长滚动（hero → Rouyi → Gargantua → Articles），24s
//  29-42   间隙 文章页滚动，13s
//  42-52   关键词图谱滚动，10s
//  52-60   Finale，8s
// 每段都有 0.6s 淡入 + 0.6s 淡出（在内部 sequence 里），所以衔接处自然交叉
export const TowerAndBlackhole: React.FC = () => {
  const { fps } = useVideoConfig();
  const s = (sec: number) => Math.round(sec * fps);

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a14" }}>
      {/* ① Opening 0-5s */}
      <Sequence from={s(0)} durationInFrames={s(5)} layout="none" name="① Opening">
        <Opening />
      </Sequence>

      {/* ② Homepage 滚动 5-29s（24s） */}
      <Sequence
        from={s(5) - s(0.4)}
        durationInFrames={s(24) + s(0.8)}
        layout="none"
        name="② Homepage"
      >
        <SiteScroll
          src="shots/home-full.png"
          imageHeight={5400}
          fromY={0}
          toY={2880}
          fadeInSec={0.6}
          fadeOutSec={0.6}
        />
        {/* 同步字幕：4 段切换 */}
        <Subtitle text="一座正在建造的塔 · 一个等待光子的黑洞" fromSec={0.5} toSec={6} />
        <Subtitle text="Rouyi · 建造塔楼的人" fromSec={6.5} toSec={11.5} />
        <Subtitle text="卡冈图雅 · 数字黑洞 · 弯曲时空，等待光子" fromSec={12} toSec={17.5} />
        <Subtitle text="文章 · 塔楼的砖石" fromSec={18} toSec={24} />
      </Sequence>

      {/* ③ 间隙 文章页 29-42s（13s） */}
      <Sequence
        from={s(29) - s(0.4)}
        durationInFrames={s(13) + s(0.8)}
        layout="none"
        name="③ 间隙"
      >
        <SiteScroll
          src="shots/gap-full.png"
          imageHeight={2800}
          fromY={0}
          toY={1100}
          fadeInSec={0.6}
          fadeOutSec={0.6}
        />
        <Subtitle
          text="塔之所以是塔，是因为砖石之间有缝。缝里有风。"
          fromSec={1}
          toSec={13}
          size={34}
        />
      </Sequence>

      {/* ④ 关键词图谱 42-52s（10s） */}
      <Sequence
        from={s(42) - s(0.4)}
        durationInFrames={s(10) + s(0.8)}
        layout="none"
        name="④ 图谱"
      >
        <SiteScroll
          src="shots/keyword-graph-full.png"
          imageHeight={2400}
          fromY={0}
          toY={880}
          fadeInSec={0.6}
          fadeOutSec={0.6}
        />
        <Subtitle
          text={"65 个节点 · 140 条连线\n一个人的思维网络"}
          fromSec={1}
          toSec={10}
          size={32}
        />
      </Sequence>

      {/* ⑤ Finale 52-60s（8s） */}
      <Sequence from={s(52) - s(0.4)} durationInFrames={s(8) + s(0.4)} layout="none" name="⑤ Finale">
        <Finale />
      </Sequence>
    </AbsoluteFill>
  );
};
