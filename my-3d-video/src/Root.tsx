import { AbsoluteFill, Composition, Sequence, staticFile } from "remotion";
import { Scene, myCompSchema } from "./Scene";
import { getMediaMetadata } from "./helpers/get-media-metadata";
import { Scene01Drop } from "./scenes/Scene01Drop";
import { Scene02AlwaysOn } from "./scenes/Scene02AlwaysOn";
import { Scene03SelfHeal } from "./scenes/Scene03SelfHeal";
import { Scene04EndsToday } from "./scenes/Scene04EndsToday";
import { Scene05Cover } from "./scenes/Scene05Cover";
import { Scene06Host } from "./scenes/Scene06Host";
import { Scene07Channel } from "./scenes/Scene07Channel";
import { Scene08Bridge } from "./scenes/Scene08Bridge";

// Claude Agents intro.
// Scenes 1–3: "Glass Command Deck" direction. Scenes 4–8: "Kinetic Editorial" direction.
const W = 1920;
const H = 1080;
const FPS = 30;

// Beat durations (frames @30fps), from scenes/claude-agents.md
const S1 = 120; // 0.00–4.00   The Drop
const S2 = 157; // 4.00–9.24   Always On
const S3 = 188; // 9.24–15.52  Self-Deploy, Self-Heal
const S4 = 166; // 15.52–21.04 That Ends Today
const S5 = 266; // 21.04–29.92 What We'll Cover
const S6 = 143; // 29.92–34.68 Host
const S7 = 60; //  34.68–36.6  Channel & Go
const S8 = 66; //  bonus       Bridge into main content

const seq = (items: Array<[number, React.FC]>) => {
  let at = 0;
  return items.map(([dur, Comp], i) => {
    const from = at;
    at += dur;
    return (
      <Sequence key={i} from={from} durationInFrames={dur}>
        <Comp />
      </Sequence>
    );
  });
};

const Intro123: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#F4F1EA" }}>
    {seq([
      [S1, Scene01Drop],
      [S2, Scene02AlwaysOn],
      [S3, Scene03SelfHeal],
    ])}
  </AbsoluteFill>
);

const Intro4to8: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#F4F1EA" }}>
    {seq([
      [S4, Scene04EndsToday],
      [S5, Scene05Cover],
      [S6, Scene06Host],
      [S7, Scene07Channel],
      [S8, Scene08Bridge],
    ])}
  </AbsoluteFill>
);

const IntroFull: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#F4F1EA" }}>
    {seq([
      [S1, Scene01Drop],
      [S2, Scene02AlwaysOn],
      [S3, Scene03SelfHeal],
      [S4, Scene04EndsToday],
      [S5, Scene05Cover],
      [S6, Scene06Host],
      [S7, Scene07Channel],
      [S8, Scene08Bridge],
    ])}
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

      {/* ---- Kinetic Editorial: scenes 4–8 ---- */}
      <Composition
        id="Editorial-Scene4-EndsToday"
        component={Scene04EndsToday}
        durationInFrames={S4}
        fps={FPS}
        width={W}
        height={H}
      />
      <Composition
        id="Editorial-Scene5-Cover"
        component={Scene05Cover}
        durationInFrames={S5}
        fps={FPS}
        width={W}
        height={H}
      />
      <Composition
        id="Editorial-Scene6-Host"
        component={Scene06Host}
        durationInFrames={S6}
        fps={FPS}
        width={W}
        height={H}
      />
      <Composition
        id="Editorial-Scene7-Channel"
        component={Scene07Channel}
        durationInFrames={S7}
        fps={FPS}
        width={W}
        height={H}
      />
      <Composition
        id="Editorial-Scene8-Bridge"
        component={Scene08Bridge}
        durationInFrames={S8}
        fps={FPS}
        width={W}
        height={H}
      />
      <Composition
        id="Editorial-Intro-4to8"
        component={Intro4to8}
        durationInFrames={S4 + S5 + S6 + S7 + S8}
        fps={FPS}
        width={W}
        height={H}
      />
      <Composition
        id="Chronixel-Intro-Full"
        component={IntroFull}
        durationInFrames={S1 + S2 + S3 + S4 + S5 + S6 + S7 + S8}
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
