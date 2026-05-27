import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/NotoSerifSC";
import React from "react";

import { SiteScroll } from "./SiteScroll";
import { Cursor } from "./Cursor";

loadFont("normal", { weights: ["300", "400", "600"] });

/*
 ① Homepage  0–33s
    Hero → Rouyi → Gargantua → Articles 顶 → Articles 底(塔)
    末段光标 → 塔 卡片 → 点击 → 切场

 ② 塔 文章页  33–51s（18s）
    标题 → 工作 → 感受 → 滚回顶部
    末段光标 → 导航「关键词图谱」 → 点击 → 切场

 ③ 关键词图谱  51–61s（10s）
    标题 → 滑到图谱 → 停留观赏

 home-full.png：1920×6800（displayed 4533，max y=3813）
 tower-full.png：1920×4500（displayed 3000，max y=2280）
 keyword-graph-full.png：1920×2400（displayed 1600，max y=880）
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
            { sec: 0, y: 0 },          // Hero
            { sec: 5, y: 0 },           // 停 Hero
            { sec: 7, y: 720 },         // → Rouyi
            { sec: 12, y: 720 },        // 停 Rouyi
            { sec: 14, y: 1400 },       // → Gargantua
            { sec: 19, y: 1400 },       // 停 Gargantua
            { sec: 21, y: 2200 },       // → Articles 顶
            { sec: 25, y: 2200 },       // 停 Articles 顶
            { sec: 27, y: 3200 },       // → Articles 底（塔 居中）
            { sec: 33, y: 3200 },       // 停在塔卡片
          ]}
          fadeInSec={0.8}
          fadeOutSec={0.8}
        />

        {/* 光标 → 塔卡片（左下角第 4 行第 1 个）
            viewport y=2950 时，塔card 在 displayed y~3133-3433
            在 viewport 内：y 约 183-483，中心 333
            塔卡片 column 1 中心 x≈240 */}
        <Cursor
          from={{ x: 1180, y: 640 }}
          to={{ x: 240, y: 430 }}
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
            { sec: 0, y: 0 },          // 标题 + nav 可见
            { sec: 4, y: 0 },           // 停标题
            { sec: 6, y: 600 },         // → 工作
            { sec: 10, y: 600 },        // 停工作
            { sec: 12, y: 1500 },       // → 感受/末段
            { sec: 15, y: 1500 },       // 停感受
            { sec: 16.5, y: 0 },        // 滚回顶部（露出 nav）
            { sec: 18, y: 0 },          // 停在顶部
          ]}
          fadeInSec={0.8}
          fadeOutSec={0.6}
        />

        {/* 光标 → 导航「🧠 关键词图谱」
            导航在 displayed y≈40，关键词图谱菜单项 x≈880 */}
        <Cursor
          from={{ x: 640, y: 500 }}
          to={{ x: 880, y: 40 }}
          appearSec={16.5}
          moveDurSec={1.5}
          clickDelaySec={0.3}
          hideSec={17.9}
        />
      </Sequence>

      {/* ③ 关键词图谱 51–61s（10s） */}
      <Sequence
        from={s(51) - s(0.4)}
        durationInFrames={s(10) + s(0.4)}
        layout="none"
        name="③ 图谱"
      >
        <SiteScroll
          src="shots/keyword-graph-full.png"
          imageHeight={2400}
          keyframes={[
            { sec: 0, y: 0 },          // 标题
            { sec: 3, y: 0 },           // 停标题
            { sec: 5, y: 540 },         // → 图本身
            { sec: 10, y: 540 },        // 停在图上
          ]}
          fadeInSec={0.8}
          fadeOutSec={1.0}
        />
      </Sequence>
    </AbsoluteFill>
  );
};
