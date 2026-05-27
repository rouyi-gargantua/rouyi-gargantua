import "./index.css";
import { Composition } from "remotion";
import { TowerAndBlackhole } from "./Composition";

// 61s @ 30fps = 1830 frames
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="TowerAndBlackhole"
        component={TowerAndBlackhole}
        durationInFrames={1830}
        fps={30}
        width={1280}
        height={720}
      />
    </>
  );
};
