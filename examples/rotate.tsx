import { CameraView } from "@ksassnowski/motion-canvas-camera";

import { makeScene2D } from "@motion-canvas/2d";
import { Rect } from "@motion-canvas/2d/lib/components";
import { Vector2 } from "@motion-canvas/core/lib/types";
import { createRef } from "@motion-canvas/core/lib/utils";

export default makeScene2D(function* (view) {
  const camera = createRef<CameraView>();
  const rect = createRef<Rect>();

  const rectStyles = {
    width: 200,
    height: 200,
    radius: 14,
  };

  yield view.add(
    <CameraView ref={camera} width={"100%"} height={"100%"}>
      <Rect ref={rect} position={[200, 200]} fill={"crimson"} {...rectStyles} />
      <Rect position={[300, -200]} fill={"bisque"} {...rectStyles} />
      <Rect position={[-300, 300]} fill={"darksalmon"} {...rectStyles} />
      <Rect position={[-400, -320]} fill={"darkslategray"} {...rectStyles} />
    </CameraView>,
  );

  yield* camera().zoomOnto(rect(), 1.5, 300);
  yield* camera().rotate(45);
  yield* camera().shift(Vector2.right.scale(200));
  yield* camera().rotate(-20);
  yield* camera().rotate(90);
  yield* camera().resetZoom();
  yield* camera().reset();
});
