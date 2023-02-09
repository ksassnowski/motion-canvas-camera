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
  yield* camera().reset(1);
  yield* camera().shift(Vector2.right.scale(400));
  yield* camera().zoom(2.5, 2);
  yield* camera().reset(1);
});
```

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

#### `rotate`

#### `resetRotation`

#### `shift`

#### `centerOn`

#### `moveBetween`

#### `followPath`
