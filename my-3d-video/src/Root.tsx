import { AbsoluteFill, Composition, Sequence, staticFile } from "remotion";
import { Scene, myCompSchema } from "./Scene";
import { getMediaMetadata } from "./helpers/get-media-metadata";
import { Scene01Drop } from "./scenes/Scene01Drop";
import { Scene02AlwaysOn } from "./scenes/Scene02AlwaysOn";
import { Scene03SelfHeal } from "./scenes/Scene03SelfHeal";

// Chronixel "Glass Command Deck" — Claude Agents intro, scenes 1–3.
const W = 1920;
const H = 1080;
const FPS = 30;

// Beat durations (frames @30fps), from scenes/claude-agents.md
const S1 = 120; // 0.00–4.00
const S2 = 157; // 4.00–9.24
const S3 = 188; // 9.24–15.52

const Intro123: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#07080B" }}>
    <Sequence durationInFrames={S1}>
      <Scene01Drop />
    </Sequence>
    <Sequence from={S1} durationInFrames={S2}>
      <Scene02AlwaysOn />
    </Sequence>
    <Sequence from={S1 + S2} durationInFrames={S3}>
      <Scene03SelfHeal />
    </Sequence>
  </AbsoluteFill>
);

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* ---- Chronixel: Claude Agents intro ---- */}
      <Composition
        id="Chronixel-Scene1-Drop"
        component={Scene01Drop}
        durationInFrames={S1}
        fps={FPS}
        width={W}
        height={H}
      />
      <Composition
        id="Chronixel-Scene2-AlwaysOn"
        component={Scene02AlwaysOn}
        durationInFrames={S2}
        fps={FPS}
        width={W}
        height={H}
      />
      <Composition
        id="Chronixel-Scene3-SelfHeal"
        component={Scene03SelfHeal}
        durationInFrames={S3}
        fps={FPS}
        width={W}
        height={H}
      />
      <Composition
        id="Chronixel-Intro-1to3"
        component={Intro123}
        durationInFrames={S1 + S2 + S3}
        fps={FPS}
        width={W}
        height={H}
      />

      {/* ---- Original React Three Fiber starter composition ---- */}
      <Composition
        id="Scene"
        component={Scene}
        fps={30}
        durationInFrames={300}
        width={1280}
        height={720}
        schema={myCompSchema}
        defaultProps={{
          deviceType: "phone",
          phoneColor: "rgba(110, 152, 191, 0.00)" as const,
          baseScale: 1,
          mediaMetadata: null,
          videoSrc: null,
        }}
        calculateMetadata={async ({ props }) => {
          const videoSrc =
            props.deviceType === "phone"
              ? staticFile("phone.mp4")
              : staticFile("tablet.mp4");

          const mediaMetadata = await getMediaMetadata(videoSrc);

          return {
            props: {
              ...props,
              mediaMetadata,
              videoSrc,
            },
          };
        }}
      />
    </>
  );
};
