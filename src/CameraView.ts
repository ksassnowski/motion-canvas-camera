import {
  Layout,
  LayoutProps,
  Line,
  Node,
  NodeState,
} from "@motion-canvas/2d/lib/components";
import {
  computed,
  initial,
  signal,
  vector2Signal,
} from "@motion-canvas/2d/lib/decorators";
import { all, waitFor } from "@motion-canvas/core/lib/flow";
import { SignalValue, SimpleSignal } from "@motion-canvas/core/lib/signals";
import { ThreadGenerator } from "@motion-canvas/core/lib/threading";
import {
  TimingFunction,
  easeInOutCubic,
} from "@motion-canvas/core/lib/tweening";
import {
  BBox,
  PossibleBBox,
  PossibleVector2,
  Vector2,
  Vector2Signal,
} from "@motion-canvas/core/lib/types";

import { getFromCycled, wrapArray } from "./utils";

export interface TravelOptions {
  /**
   * How long each movement transition takes.
   *
   * If a single value is provided, the same duration will get used for all moves.
   *
   * If an array is provided, the duration that corresponds to the index  of the
   * current move will get used. For example, if the camera is moving from the first
   * node to the second node, the index will be `0` and so the first duration from
   * the array gets used. Note that this array gets cycled, meaning that if you
   * provide fewer durations than there are transitions, the array will wrap around
   * to the beginning.
   */
  duration: number | number[];

  /**
   * Whether the camera should zoom onto the target node.
   *
   * If a single value is provided, the same setting will get used for all moves.
   *
   * If an array is provided, the entry that corresponds to the index of the current
   * move will get used. For example, if the camera is moving from the first node to
   * the second node, the index will be `0` and so the first entry from the array
   * gets used. Note that this array gets cycled, meaning that if you provide fewer
   * entries than there are transitions, the array will wrap around to the beginning.
   */
  zoom: boolean | boolean[];

  /**
   * How long to wait before starting each move.
   *
   * If a single value is provided, the same delay will get used for all moves.
   *
   * If an array is provided, the entry that corresponds to the index of the current
   * move will get used. For example, if the camera is moving from the first node to
   * the second node, the index will be `0` and so the first entry from the array
   * gets used. Note that this array gets cycled, meaning that if you provide fewer
   * entries than there are transitions, the array will wrap around to the beginning.
   */
  buffer: number | number[];

  /**
   * How long to wait before starting each move.
   *
   * If a single value is provided, the same delay will get used for all moves.
   *
   * If an array is provided, the entry that corresponds to the index of the current
   * move will get used. For example, if the camera is moving from the first node to
   * the second node, the index will be `0` and so the first entry from the array
   * gets used. Note that this array gets cycled, meaning that if you provide fewer
   * entries than there are transitions, the array will wrap around to the beginning.
   */
  wait: number | number[];

  /**
   * The timing function used for the transitions of the move.
   *
   * If a single value is provided, the same timing function will get applied
   * for all moves.
   *
   * If an array is provided, the entry that corresponds to the index of the current
   * move will get used. For example, if the camera is moving from the first node to
   * the second node, the index will be `0` and so the first entry from the array
   * gets used. Note that this array gets cycled, meaning that if you provide fewer
   * entries than there are transitions, the array will wrap around to the beginning.
   */
  timing: TimingFunction | TimingFunction[];

  /**
   * Hook that gets called every time before the camera moves on to the next node.
   *
   * @param next - The animations for moving the camera to the next node.
   *               These animations should be part of the resulting ThreadGenerator
   *               that this callback returns. Otherwise, the camera won't continue
   *               on to the next node. The advantage is that you can compose the
   *               movement animations with any other animations that should get
   *               applied during the next move as well
   * @param target - The next node the camera will move to
   */
  onBeforeMove: (next: ThreadGenerator, target: Node) => ThreadGenerator;
}

export interface CameraViewProps
  extends Omit<LayoutProps, "scale" | "position"> {
  baseZoom?: SignalValue<number>;
  scene?: SignalValue<Node>;
  translation?: SignalValue<PossibleVector2>;
}

export class CameraView extends Layout {
  @initial(1)
  @signal()
  public declare readonly baseZoom: SimpleSignal<number, this>;

  @vector2Signal("translation")
  public declare readonly translation: Vector2Signal<this>;

  @initial(null)
  @signal()
  public declare readonly scene: SimpleSignal<Node | null, this>;

  public constructor(props: CameraViewProps) {
    super({
      clip: true,
      ...props,
      scale: props.baseZoom ?? 1,
      position: () => this.actualPosition(),
    });
  }

  @computed()
  private rotationMatrix(): DOMMatrix {
    const matrix = new DOMMatrix();
    matrix.rotateSelf(0, 0, this.rotation());
    return matrix;
  }

  @computed()
  private actualPosition() {
    return this.translation()
      .mul(this.scale())
      .transformAsPoint(this.rotationMatrix());
  }

  /**
   * Resets the camera's viewport to its original position, scale and rotation.
   *
   * @param duration The duration of the transition
   * @param timing The timing function to use for the transition
   */
  public *reset(
    duration: number = 1,
    timing: TimingFunction = easeInOutCubic,
  ): ThreadGenerator {
    yield* all(
      this.scale(this.baseZoom(), duration, timing),
      this.translation(Vector2.zero, duration, timing),
      this.rotation(0, duration, timing),
    );
  }

  /**
   * Zooms the camera onto the current position.
   *
   * @param zoom The zoom level that should get applied as a percentage of the base zoom level.
   *             1 means no zoom.
   * @param duration The duration of the transition
   * @param timing  The timing function used for the transition
   */
  public *zoom(
    zoom: number,
    duration: number = 1,
    timing: TimingFunction = easeInOutCubic,
  ): ThreadGenerator {
    yield* this.scale(zoom * this.baseZoom(), duration, timing);
  }

  /**
   * Resets the camera's zoom without changing it's position.
   *
   * @param duration - The duration of the transition
   * @param timing - The timing function to use for the transition
   */
  public *resetZoom(
    duration: number = 1,
    timing: TimingFunction = easeInOutCubic,
  ): ThreadGenerator {
    yield* this.scale(this.baseZoom(), duration, timing);
  }

  /**
   * Rotates the camera around its current position.
   *
   * @param angle - The rotation to apply in degrees
   * @param duration - The duration of the transition
   * @param timing - The timing function to use for the transition
   */
  public *rotate(
    angle: number,
    duration: number = 1,
    timing: TimingFunction = easeInOutCubic,
  ): ThreadGenerator {
    yield* this.rotation(this.rotation() + angle, duration, timing);
  }

  /**
   * Resets the camera's rotation.
   *
   * @param duration - The duration of the transition
   * @param timing - The timing function to use for the transition
   */
  public *resetRotation(
    duration: number = 1,
    timing: TimingFunction = easeInOutCubic,
  ): ThreadGenerator {
    yield* this.rotation(0, duration, timing);
  }

  /**
   * Shifts the camera into the provided direction.
   *
   * @param by - The amount and direction in which to shift the camera
   * @param duration - The duration of the transition
   * @param timing - The timing function used for the transition
   */
  public *shift(
    by: Vector2,
    duration: number = 1,
    timing: TimingFunction = easeInOutCubic,
  ): ThreadGenerator {
    yield* this.translation(this.translation().sub(by), duration, timing);
  }

  /**
   * Zooms the view onto the provided area until it fills out the viewport.
   * Can optionally apply a buffer around the node.
   *
   * @param area - The area on which to zoom onto. The position of the area needs to
   *               be in local space.
   * @param duration - The duration of the transition
   * @param buffer - The buffer to apply around the node and the viewport edges
   * @param timing - The timing function to use for the transition
   */
  public zoomOnto(
    area: PossibleBBox,
    duration?: number,
    buffer?: number,
    timing?: TimingFunction,
  ): ThreadGenerator;

  /**
   * Zooms the view onto the provided node until it fills out the viewport.
   * Can optionally apply a buffer around the node.
   *
   * @param node - The node to zoom onto. The node needs to either be a direct or
   *               transitive child of the camera node.
   * @param duration - The duration of the transition
   * @param buffer - The buffer to apply around the node and the viewport edges
   * @param timing - The timing function to use for the transition
   */
  public zoomOnto(
    node: Node,
    duration?: number,
    buffer?: number,
    timing?: TimingFunction,
  ): ThreadGenerator;

  public *zoomOnto(
    area: PossibleBBox | Node,
    duration: number = 1,
    buffer: number = 0,
    timing: TimingFunction = easeInOutCubic,
  ): ThreadGenerator {
    const rect = this.getRectFromInput(area);
    const scale = this.size().div(this.fitRectAroundArea(rect, buffer));

    yield* all(
      this.scale(scale, duration, timing),
      this.translation(rect.position.flipped, duration, timing),
    );
  }

  /**
   * Centers the camera view on the provided node without changing the zoom level.
   *
   * @param node - The node to center on. The node needs to either be a direct or
   *               transitive child of the camera node.
   * @param duration - The duration of the transition
   * @param timing - The timing function to use for the transition
   */
  public centerOn(
    node: Node,
    duration?: number,
    timing?: TimingFunction,
  ): ThreadGenerator;

  /**
   * Centers the camera view on the provided area without changing the zoom level.
   *
   * @param area - The area to center on. The position of the area should be in local space.
   * @param duration - The duration of the transition
   * @param timing - The timing function to use for the transition
   */
  public centerOn(
    area: PossibleBBox,
    duration?: number,
    timing?: TimingFunction,
  ): ThreadGenerator;
  public *centerOn(
    area: Vector2 | PossibleBBox | Node,
    duration: number = 1,
    timing: TimingFunction = easeInOutCubic,
  ): ThreadGenerator {
    yield* this.translation(
      this.getRectFromInput(area).position.flipped,
      duration,
      timing,
    );
  }

  /**
   * Move the camera between the provided nodes, one after the other.
   *
   * @param nodes - The nodes to move between
   * @param options - The options describing each itinerary of the transitions.
   *                  See @see{TravelOptions} for move information about what
   *                  each of the options does.
   */
  public moveBetween(
    nodes: Node[],
    options: Partial<TravelOptions>,
  ): ThreadGenerator;

  /**
   * Move the camera between the provided nodes, one after the other.
   *
   * @param nodes - The nodes to move between
   * @param duration - The duration of the transition
   * @param onBeforeMove - Callback that gets called before starting each itinerary
   * @param timing - The timing function used for the transition
   */
  public moveBetween(
    nodes: Node[],
    duration: number,
    onBeforeMove?: (next: ThreadGenerator, target: Node) => ThreadGenerator,
    timing?: TimingFunction,
  ): ThreadGenerator;

  public *moveBetween(
    nodes: Node[],
    options: number | Partial<TravelOptions> = 1,
    onBeforeMove?: (next: ThreadGenerator, target: Node) => ThreadGenerator,
    timing: TimingFunction = easeInOutCubic,
  ): ThreadGenerator {
    let defaults: TravelOptions = {
      duration: 1,
      buffer: 0,
      wait: 0.25,
      zoom: false,
      timing,
      onBeforeMove:
        onBeforeMove ??
        function* (next) {
          yield* next;
        },
    };

    if (typeof options === "number") {
      defaults.duration = options;
    } else {
      defaults = Object.assign({}, defaults, options);
    }

    defaults.duration = wrapArray(defaults.duration);
    defaults.buffer = wrapArray(defaults.buffer);
    defaults.wait = wrapArray(defaults.wait);
    defaults.zoom = wrapArray(defaults.zoom);
    defaults.timing = wrapArray(defaults.timing);

    for (let i = 0; i < nodes.length; i++) {
      const zoom = getFromCycled(defaults.zoom, i);
      const node = getFromCycled(nodes, i);
      const duration = getFromCycled(defaults.duration, i);
      const wait = getFromCycled(defaults.wait, i);
      const timing = getFromCycled(defaults.timing, i);

      let transition: ThreadGenerator;

      if (zoom) {
        transition = this.zoomOnto(node, duration, defaults.buffer[i], timing);
      } else {
        transition = all(
          this.resetZoom(duration, timing),
          this.centerOn(node, duration, timing),
        );
      }

      yield* defaults.onBeforeMove(transition, node);
      yield* waitFor(wait);
    }
  }

  /**
   * Make the camera follow the provided path.
   *
   * @param path - The path to follow
   * @param duration - The duration of the transition
   * @param timing  - The timing function used for the transition
   */
  public *followPath(
    path: Line,
    duration: number = 1,
    timing: TimingFunction = easeInOutCubic,
  ): ThreadGenerator {
    const transformPoint = (point: Vector2): Vector2 =>
      point
        .transformAsPoint(path.localToWorld())
        .transformAsPoint(this.worldToLocal()).flipped;

    const destination = transformPoint(path.getPointAtPercentage(1).position);

    yield* this.translation(destination, duration, timing, (from, to, value) =>
      transformPoint(path.getPointAtPercentage(value).position),
    );
  }

  private getRectFromInput(area: Node | PossibleBBox): BBox {
    if (area instanceof Node) {
      return new BBox(
        area.absolutePosition().transformAsPoint(this.worldToLocal()),
        area.cacheBBox().size,
      );
    }

    return new BBox(area);
  }

  /**
   * Calculates the size of a rectangle that encloses the provided area
   * while maintaining the same aspect ratio as the camera view.
   *
   * @param area - The node that the rectangle should be fitted around
   * @param buffer - Buffer to apply around the node and the edges of the rectangle
   */
  private fitRectAroundArea(area: BBox, buffer: number): Vector2 {
    const aspectRatio = this.size().height / this.size().width;
    const areaAspectRatio = area.height / area.width;

    let size: Vector2;

    if (areaAspectRatio === aspectRatio) {
      size = area.size;
    } else if (areaAspectRatio > aspectRatio) {
      size = new Vector2(area.height / aspectRatio, area.height);
    } else {
      size = new Vector2(area.width, area.width * aspectRatio);
    }

    const xScaleFactor = (size.x + buffer) / size.x;
    const yScaleFactor = (size.y + buffer) / size.y;
    const scaleFactor = Math.max(xScaleFactor, yScaleFactor);

    return size.scale(scaleFactor);
  }

  public override getState(): NodeState {
    return {
      translation: this.translation(),
      rotation: this.rotation(),
      scale: this.scale(),
    };
  }

  public override hit(position: Vector2): Node | null {
    return this.scene()?.hit(position) ?? super.hit(position);
  }

  protected override draw(context: CanvasRenderingContext2D): void {
    super.draw(context);
    this.scene()?.render(context);
  }
}
