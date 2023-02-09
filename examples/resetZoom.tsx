import { CameraView } from "@ksassnowski/motion-canvas-camera;

import { makeScene2D } from "@motion-canvas/2d";
import { Layout, Rect } from "@motion-canvas/2d/lib/components";
import { createRef } from "@motion-canvas/core/lib/utils";

export default makeScene2D(function* (view) {
  const camera = createRef<CameraView>();
  const rect = createRef<Rect>();

  yield view.add(
    <CameraView ref={camera} width={"100%"} height={"100%"}>
      <Rect
        gap={20}
        width={1024}
        height={768}
        padding={60}
        radius={14}
        fill={"#101010"}
        layout
      >
        <Rect grow={1} radius={14} fill={"crimson"} />
        <Layout direction={"column"} grow={1} gap={20} layout>
          <Rect grow={1} radius={14} fill={"bisque"} />
          <Rect ref={rect} grow={1} radius={14} fill={"darksalmon"} />
        </Layout>
        <Rect grow={1} radius={14} fill={"darkslategray"} />
      </Rect>
    </CameraView>,
  );

  yield* camera().zoomOnto(rect(), 1.5, 25);
  yield* camera().resetZoom();
  yield* camera().reset();
});
