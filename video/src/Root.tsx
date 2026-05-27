import "./index.css";
import { Composition } from "remotion";
import { TowerAndBlackhole } from "./Composition";

// 60s @ 30fps = 1800 frames
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="TowerAndBlackhole"
        component={TowerAndBlackhole}
        durationInFrames={1800}
        fps={30}
        width={1280}
        height={720}
      />
    </>
  );
};
