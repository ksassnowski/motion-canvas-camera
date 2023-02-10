import { CameraView } from "@ksassnowski/motion-canvas-camera";

import {
  Circle,
  CircleProps,
  Layout,
  Line,
  LineProps,
  Node,
  Rect,
  Text,
} from "@motion-canvas/2d/lib/components";
import { CodeBlock, edit } from "@motion-canvas/2d/lib/components/CodeBlock";
import { makeScene2D } from "@motion-canvas/2d/lib/scenes";
import {
  all,
  chain,
  delay,
  waitFor,
  waitUntil,
} from "@motion-canvas/core/lib/flow";
import { createSignal } from "@motion-canvas/core/lib/signals";
import {
  easeInOutBack,
  easeOutBack,
  linear,
} from "@motion-canvas/core/lib/tweening";
import { createRef, makeRef, range } from "@motion-canvas/core/lib/utils";

export default makeScene2D(function* (view) {
  const camera = createRef<CameraView>();
  const layout = createRef<Layout>();
  const rect = createRef<Rect>();
  const circles: Circle[] = [];
  const line = createRef<Line>();
  const code = createRef<CodeBlock>();
  const disclaimer = createRef<Text>();

  const circleProps: CircleProps[] = [
    { position: [-400, 200], width: 400, height: 400, fill: "hotpink" },
    { position: [400, -200], width: 120, height: 120, fill: "steelblue" },
    { position: [-300, -300], width: 60, height: 60, fill: "forestgreen" },
    { position: [150, 170], width: 40, height: 40, fill: "yellow" },
    { position: [150, 450], width: 40, height: 40, fill: "coral" },
    { position: [-190, 360], width: 40, height: 40, fill: "#bad455" },
    { position: [440, 360], width: 40, height: 40, fill: "blanchedalmond" },
    { position: [240, 340], width: 40, height: 40, fill: "blanchedalmond" },
  ];

  const cameraStyles = {
    clip: false,
    width: 1000,
    height: 720,
    layout: false,
    baseZoom: 0.6,
  };

  const rectStyles = {
    width: 1000,
    height: 720,
    fill: "#101010",
    clip: true,
    radius: 12,
  };

  const lineStyles: LineProps = {
    lineWidth: 16,
    lineDash: [28, 22],
    points: [
      [320, -200],
      [100, 0],
      [100, 70],
      [200, 120],
      [400, 300],
      [380, 380],
      [0, 420],
      [-400, 200],
    ],
  };

  const codeStyles = {
    marginTop: 20,
    fontSize: 48,
    lineHeight: 55,
    fontFamily: "Monogram",
  };

  const circlesSpawned = createSignal(0);

  yield view.add(
    <Layout
      ref={layout}
      alignItems={"center"}
      gap={60}
      padding={60}
      justifyContent={"space-between"}
      width={"100%"}
      layout
    >
      <CodeBlock
        ref={code}
        code={`yield* camera().zoomOnto(
    circles[0], 2, 100
  )`}
        opacity={0}
        grow={1}
        {...codeStyles}
      />

      <Rect ref={rect} {...rectStyles}>
        <CameraView ref={camera} {...cameraStyles}>
          <Line ref={line} stroke={"white"} opacity={0} {...lineStyles} />

          <Node
            spawner={() =>
              range(circlesSpawned()).map((i) => (
                <Circle ref={makeRef(circles, i)} {...circleProps[i]} />
              ))
            }
          />
        </CameraView>
      </Rect>
    </Layout>,
  );

  yield* rect().opacity(0, 0);
  yield* all(
    rect()
      .margin({ top: 300, left: 0, right: 0, bottom: 0 }, 0)
      .to(0, 1.2, easeInOutBack),
    rect().opacity(1, 1.2),
  );

  yield* circlesSpawned(0, 0).to(circleProps.length - 1, 3);

  yield* code().opacity(1, 1);
  yield* waitUntil("zoom-onto");

  yield* camera().zoomOnto(circles[0], 2, 100);

  yield* code().edit(1.8, false)`yield* camera().${edit(
    `zoomOnto(
    circles[0], 2, 100
  )`,
    "reset()",
  )}`;
  yield* waitUntil("reset");
  yield* camera().reset();

  yield* waitUntil("line-draw");
  view.add(
    <Text
      ref={disclaimer}
      fill={"a0a0a0"}
      fontFamily="Monogram"
      fontSize={30}
      text={"*Line not included. Additional charges may apply."}
      position={[200, 380]}
    />,
  );
  yield* all(
    line().opacity(1, 0),
    line().end(0, 0).to(1, 4),
    disclaimer().opacity(0, 0),
    delay(1, disclaimer().opacity(1, 1.5)),
  );
  yield* disclaimer().opacity(0, 1);
  disclaimer().remove();
  yield* waitUntil("code-1");

  yield* code().edit(1.8, false)`yield* camera().${edit(
    "reset()",
    `zoomOnto(
    [320, -200, 500, 500],
    2
  )`,
  )}`;
  yield* waitUntil("zoom-onto-2");

  yield* camera().zoomOnto([320, -200, 500, 500], 2);
  yield* waitUntil("code-2");

  yield* code().edit(1.8, false)`yield* ${edit(
    `camera().zoomOnto(
    [320, -200, 500, 500],
    2
  )`,
    `all(
    camera().followPath(line(), 5),
    camera().rotate(120, 5),
    chain(
      camera().zoom(5, 2, linear),
      camera().zoom(2.5, 3)
    ),
  )`,
  )}`;
  yield* waitUntil("path");

  yield* all(
    camera().followPath(line(), 5),
    camera().rotate(120, 5),
    chain(camera().zoom(5, 2, linear), camera().zoom(2.5, 3)),
  );

  yield* code().edit(1.8, false)`yield* ${edit(
    `all(
    camera().followPath(line(), 5),
    camera().rotate(120, 5),
    chain(
      camera().zoom(5, 2, linear),
      camera().zoom(2.5, 3)
    ),
  )`,
    `camera.reset(3, easeOutBack)`,
  )}`;
  yield* waitUntil("reset-2");

  yield* camera().reset(3, easeOutBack);
  yield* waitFor(1);
});
