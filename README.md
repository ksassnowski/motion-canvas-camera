# Motion Canvas Camera

A camera component for [Motion Canvas] that allows you focus on elements, move the camera, follow paths and much more.

## Installation

To install, run the following command inside your Motion Canvas project.

```
npm install @ksassnowski/motion-canvas-camera
```

Or, if you're using Yarn:

```
yarn add @ksassnowski/motion-canvas-camera
```

## Basic Usage

- add camera to view
- put any nodes you want part of camera as child of camera
- grab reference to camera
- make sure to add new nodes to camera, not view

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

_coming soon_

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

_coming soon_

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
*centerOn(
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
