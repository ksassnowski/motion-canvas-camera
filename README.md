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

## Animation Reference

### `zoomOnto`

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
