import { CameraView } from "@ksassnowski/motion-canvas-camera";

import { makeScene2D } from "@motion-canvas/2d";
import { Circle } from "@motion-canvas/2d/lib/components";
import { createRef } from "@motion-canvas/core/lib/utils";

export default makeScene2D(function* (view) {
  const camera = createRef<CameraView>();
  const circle1 = createRef<Circle>();
  const circle2 = createRef<Circle>();

  const circleStyles = {
    width: 200,
    height: 200,
  };

  view.add(
    <CameraView ref={camera} width={"100%"} height={"100%"}>
      <Circle
        ref={circle1}
        fill={"hotpink"}
        position={[-200, 300]}
        {...circleStyles}
      />
      <Circle
        ref={circle2}
        fill={"steelblue"}
        position={[200, -300]}
        {...circleStyles}
      />
    </CameraView>,
  );

  yield* camera().zoomOnto(circle1(), 3, 100);
  yield* camera().zoomOnto(circle2(), 3, 10);
});
