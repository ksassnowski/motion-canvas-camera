# :movie_camera: Motion Canvas Camera

> [!IMPORTANT]
> Motion Canvas now has a [built-in camera component](https://motioncanvas.io/docs/camera) so this package is no longer necessary. It will probably continue to work but will not receive any further updates.

https://user-images.githubusercontent.com/5139098/218100233-fa3bde50-122b-4e21-8ecb-0817ae5ed76a.mp4

A camera component for [Motion Canvas](https://github.com/motion-canvas/motion-canvas) that allows you focus on elements, move the camera, follow paths and much more.

## Installation

To install, run the following command inside your Motion Canvas project.

```
npm install --save @ksassnowski/motion-canvas-camera
```

Or, if you're using Yarn:

```
yarn add @ksassnowski/motion-canvas-camera
```

## Basic Usage

```tsx
import { CameraView } from "@ksassnowski/motion-canvas-camera";

import { makeScene2D } from "@motion-canvas/2d";
import { Circle, Line, Rect } from "@motion-canvas/2d/lib/components";
import { easeInOutSine } from "@motion-canvas/core/lib/tweening";
import { createRef } from "@motion-canvas/core/lib/utils";

export default makeScene2D(function* (view) {
  const camera = createRef<CameraView>();
  const rect = createRef<Rect>();
  const circle = createRef<Rect>();
  const path = createRef<Line>();

  view.add(
    <CameraView ref={camera} width={"100%"} height={"100%"}>
      <Rect
        ref={rect}
        position={[-600, -300]}
        width={200}
        height={200}
        radius={14}
        fill={"steelblue"}
      />
    </CameraView>,
  );

  yield* camera().zoomOnto(rect(), 1.5, 200);

  // Make sure to add elements to the `camera`, not to the `view`
  // if you want them to be part of the camera's "field of view".
  camera().add(
    <Circle
      ref={circle}
      fill={"bisque"}
      width={60}
      height={60}
      position={[-200, -250]}
    />,
  );
  camera().add(
    <Line ref={path} points={[rect().position, circle().position, [0, 0]]} />,
  );

  yield* camera().rotate(35);
  yield* camera().followPath(path(), 4, easeInOutSine);
  yield* camera().reset(2);
});
```

**Result**

https://user-images.githubusercontent.com/5139098/217892986-96c1ff6c-b846-4b03-9fa8-d3d63bd3fa3c.mp4

Note that any node that isn't a child of the `CameraView` (either directly or transitively), will not be
affected by the camera's transformation.

> **Warning** <br>
> The camera updates its `position`, `scale` and `rotation` internally so you should **not** set or change these properties manually. If you want to position the camera in a different location of the screen, wrap it in a `Layout` node and position that node instead.

### Props

```ts
interface CameraViewProps extends LayoutProps {
  /**
   * Sets the camera's default zoom level. When calling the
   * `reset` or `resetZoom` methods, the camera will reset
   * to this zoom level.
   */
  baseZoom?: number;
}
```

### Method Reference

#### `reset`

Resets the camera's zoom, rotation and position back to the defaults.

**Method signature**

```ts
*reset(
    duration: number = 1,
    timing: TimingFunction = easeInOutCubic
): ThreadGenerator;
```

**Example**

```tsx
export default makeScene2D(function* (view) {
  const camera = createRef<CameraView>();
  const circle1 = createRef<Circle>();
  const circle2 = createRef<Circle>();

  view.add(
    <CameraView ref={camera} width={"100%"} height={"100%"}>
      <Circle
        ref={circle1}
        position={[-200, 300]}
        // style...
      />
      <Circle
        ref={circle2}
        position={[200, -300]}
        // style...
      />
    </CameraView>,
  );

  yield* camera().zoomOnto(circle1(), 2, 100);
  yield* camera().reset(1);
  yield* camera().zoomOnto(circle2(), 2, 100);
  yield* camera().reset(1);
});
```

https://user-images.githubusercontent.com/5139098/217865658-c08b2c38-700b-4849-943c-49c2b047bfb8.mp4

#### `zoom`

Zooms the camera in on the current position.

**Method signature**

```ts
*zoom(
    zoom: nummber,
    duration: number = 1,
    timing: TimingFunction = easeInOutCubic
): ThreadGenerator;
```

**Example**

```tsx
export default makeScene2D(function* (view) {
  const camera = createRef<CameraView>();

  yield view.add(
    <CameraView ref={camera} width={"100%"} height={"100%"}>
      <Rect
        width={1024}
        height={768}
        // style...
        layout
      >
        <Rect grow={1} radius={14} fill={"crimson"} />
        <Layout direction={"column"} grow={1} gap={20} layout>
          <Rect grow={1} radius={14} fill={"bisque"} />
          <Rect grow={1} radius={14} fill={"darksalmon"} />
        </Layout>
        <Rect grow={1} radius={14} fill={"darkslategray"} />
      </Rect>
    </CameraView>,
  );

  yield* camera().shift(Vector2.left.scale(200));
  yield* camera().zoom(2.5, 2);
  yield* camera().zoom(1);
  yield* camera().shift(Vector2.right.scale(400));
  yield* camera().zoom(2.5, 2);
  yield* camera().reset(1);
});
```

https://user-images.githubusercontent.com/5139098/217865846-af1ce5ef-ad02-4947-8270-da1c04c5a771.mp4

#### `zoomOnto`

Zooms the camera onto the provided area or node until it fills the viewport. When providing
a node, the node **must** be a child of the camera, although it doesn't have to be a direct child.
Areas should be provided in local space of the camera.

Can optionally apply `buffer` around the area and the viewport.

**Method signature**

```ts
*zoomOnto(
    area: Node | PossibleRect,
    duration: number = 1,
    buffer: number = 0,
    timing: TimingFunction = easeInOutCubic
): ThreadGenerator;
```

**Example**

```tsx
export default makeScene2D(function* (view) {
  const camera = createRef<CameraView>();
  const circle1 = createRef<Circle>();
  const circle2 = createRef<Circle>();

  view.add(
    <CameraView ref={camera} width={"100%"} height={"100%"}>
      <Circle
        ref={circle1}
        position={[-200, 300]}
        // styles...
      />
      <Circle
        ref={circle2}
        position={[200, -300]}
        // styles...
      />
    </CameraView>,
  );

  yield* camera().zoomOnto(circle1(), 3, 100);
  yield* camera().zoomOnto(circle2(), 3, 10);
});
```

https://user-images.githubusercontent.com/5139098/217832467-6c9c999a-d67e-42bd-8ed2-ad17bea8cc14.mp4

#### `resetZoom`

Resets the camera's zoom to `baseZoom` without changing the camera's position.

**Method signature**

```ts
*resetZoom(
    duration: number = 1,
    timing: TimingFunction = easeInOutCubic
): ThreadGenerator;
```

**Example**

```tsx
export default makeScene2D(function* (view) {
  const camera = createRef<CameraView>();
  const rect = createRef<Rect>();

  yield view.add(
    <CameraView ref={camera} width={"100%"} height={"100%"}>
      <Rect
        width={1024}
        height={768}
        // style...
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
```

https://user-images.githubusercontent.com/5139098/217866036-3e677a3f-9738-4ceb-a50b-de9d3123bb25.mp4

#### `rotate`

Rotates the camera around its current position. The angle is provided in degrees.

**Method Signature**

```ts
*rotate(
    angle: number,
    duration: number = 1,
    timing: TimingFunction = easeInOutCubic
): ThreadGenerator;
```

**Example**

```tsx
export default makeScene2D(function* (view) {
  const camera = createRef<CameraView>();
  const rect = createRef<Rect>();

  yield view.add(
    <CameraView ref={camera} width={"100%"} height={"100%"}>
      <Rect ref={rect} position={[200, 200]} fill={"crimson"} /* styles... */ />
      <Rect position={[300, -200]} fill={"bisque"} /* styles... */ />
      <Rect position={[-300, 300]} fill={"darksalmon"} /* styles... */ />
      <Rect position={[-400, -320]} fill={"darkslategray"} /* styles... */ />
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
```

https://user-images.githubusercontent.com/5139098/217883813-bbe1595e-501a-4b36-8dee-12f1cdeda57b.mp4

#### `resetRotation`

Resets the camera's rotation without changing it's scale or position.

**Method Signature**

```ts
*resetRotation(
    duration: number = 1,
    timing: TimingFunction = easeInOutCubic
): ThreadGenerator;
```

**Example**

```tsx
export default makeScene2D(function* (view) {
  const camera = createRef<CameraView>();

  yield view.add(
    <CameraView ref={camera} width={"100%"} height={"100%"}>
      <Rect position={[200, 200]} fill={"crimson"} /* styles... */ />
      <Rect position={[300, -200]} fill={"bisque"} /* styles... */ />
      <Rect position={[-300, 300]} fill={"darksalmon"} /* styles... */ />
      <Rect position={[-400, -320]} fill={"darkslategray"} /* styles... */ />
    </CameraView>,
  );

  yield* camera().zoom(1.5);
  yield* camera().shift(new Vector2(200, -100));
  yield* camera().resetZoom();
});
```

https://user-images.githubusercontent.com/5139098/218136179-81a3b3af-0a09-443b-8dea-12c1cb84931c.mp4

#### `shift`

Shifts the camera's position by the provided vector.

**Method Signature**

```ts
*shift(
    by: Vector2,
    duration: number = 1,
    timing: TimingFunction = easeInOutCubic
): ThreadGenerator;
```

**Example**

```tsx
export default makeScene2D(function* (view) {
  const camera = createRef<CameraView>();

  yield view.add(
    <CameraView ref={camera} width={"100%"} height={"100%"}>
      <Rect position={[200, 200]} fill={"crimson"} /* styles... */ />
      <Rect position={[300, -200]} fill={"bisque"} /* styles... */ />
      <Rect position={[-300, 300]} fill={"darksalmon"} /* styles... */ />
      <Rect position={[-400, -320]} fill={"darkslategray"} /* styles... */ />
    </CameraView>,
  );

  yield* camera().rotate(46);
  yield* camera().rotate(-10);
  yield* camera().resetRotation();
});
```

https://user-images.githubusercontent.com/5139098/218135450-dc6d0559-b239-4416-bc33-f6169beee5be.mp4

#### `centerOn`

Centers the camera viewport on the provided point, area or node without changing
it's rotation or zoom.

**Method Signature**

```ts
*centerOn(
    area: Vector2 | PossibleRect | Node,
    duration: number = 1,
    timing: TimingFunction = easeInOutCubic,
): ThreadGenerator;
```

**Example**

_coming soon_

#### `moveBetween`

Moves the camera the provided nodes, one after the other.

**Method Signature**

```ts
*moveBetween(
    nodes: Node[],
    duration: number,
    /**
     * If provided, this callback will get called before each
     * move starts.
     *
     * @param next - The animations for the next move. When providing this callback,
     *               you should yield these animations for the next move to start. Having
     *               access to these animations allows you to compose them together with
     *               other animations you might want to apply during a specific move.
     * @param node - The next node the camera will move to.
     *
     */
    onBeforeMove?: (next: ThreadGenerator, target: Node) => ThreadGenerator,
    timing?: TimingFunction = easeInOutCubic,
): ThreadGenerator;
```

**Example**

_coming soon_

#### `followPath`

Moves the camera along the provided path.

**Method Signature**

```ts
*followPath(
    path: Line,
    duration: number = 1,
    timing: TimingFunction = easeInOutCubic,
): ThreadGenerator;
```

**Example**

_coming soon_
