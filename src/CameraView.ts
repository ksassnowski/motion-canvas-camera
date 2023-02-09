import { castArray } from "lodash";

import {
  Layout,
  LayoutProps,
  Line,
  Node,
} from "@motion-canvas/2d/lib/components";
import { computed, initial, signal } from "@motion-canvas/2d/lib/decorators";
import { all, waitFor } from "@motion-canvas/core/lib/flow";
import { SimpleSignal } from "@motion-canvas/core/lib/signals";
import { ThreadGenerator } from "@motion-canvas/core/lib/threading";
import {
  TimingFunction,
  easeInOutCubic,
} from "@motion-canvas/core/lib/tweening";
import { PossibleRect, Rect, Vector2 } from "@motion-canvas/core/lib/types";
import { useLogger } from "@motion-canvas/core/lib/utils";

import cycle from "./cycle";

export interface TravelOptions {
  duration: number | number[];
  zoom: boolean | boolean[];
  buffer: number | number[];
  wait: number | number[];
  timing: TimingFunction | TimingFunction[];
  onBeforeMove: (next: ThreadGenerator, target: Node) => ThreadGenerator;
}

export interface CameraViewProps extends LayoutProps {
  baseZoom?: number;
}

export class CameraView extends Layout {
  @initial(1)
  @signal()
  public declare readonly baseZoom: SimpleSignal<number, this>;

  public constructor(props: CameraViewProps) {
    super({ clip: true, scale: props.baseZoom ?? 1, ...props });
  }

  /**
   * Resets the camera's viewport to its original position, scale and rotation.
   *
   * @param duration The duration of the transition
   * @param timing The timing function to use for the transition
   */
  public reset(
    duration: number = 1,
    timing: TimingFunction = easeInOutCubic,
  ): ThreadGenerator {
    return all(
      this.scale(this.baseZoom(), duration, timing),
      this.position(Vector2.zero, duration, timing),
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
  public zoom(
    zoom: number,
    duration: number = 1,
    timing: TimingFunction = easeInOutCubic,
  ): ThreadGenerator {
    return all(
      this.scale(zoom * this.baseZoom(), duration, timing),
      this.position(this.position().scale(zoom), duration, timing),
    );
  }

  /**
   * Resets the camera's zoom without changing it's position.
   *
   * @param duration - The duration of the transition
   * @param timing - The timing function to use for the transition
   */
  public resetZoom(
    duration: number = 1,
    timing: TimingFunction = easeInOutCubic,
  ): ThreadGenerator {
    return this.scale(1, duration, timing);
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
    const rotation = this.rotation() + angle;
    yield* this.rotation(rotation, duration, timing);
  }

  /**
   * Resets the camera's rotation.
   *
   * @param duration - The duration of the transition
   * @param timing - The timing function to use for the transition
   */
  public resetRotation(
    duration: number = 1,
    timing: TimingFunction = easeInOutCubic,
  ): ThreadGenerator {
    return this.rotation(0, duration, timing);
  }

  public shift(
    by: Vector2,
    duration: number = 1,
    timing: TimingFunction = easeInOutCubic,
  ): ThreadGenerator {
    const target = this.position()
      .add(by)
      .mul(this.scale())
      .transformAsPoint(this.rotationMatrix());

    return this.position(target, duration, timing);
  }

  public zoomOnto(
    area: PossibleRect,
    duration?: number,
    buffer?: number,
    timing?: TimingFunction,
  ): ThreadGenerator;
  public zoomOnto(
    node: Node,
    duration?: number,
    buffer?: number,
    timing?: TimingFunction,
  ): ThreadGenerator;
  /**
   * Zooms the view onto the provided node or area until it fills out the viewport.
   * Can optionally apply a buffer around the node.
   *
   * @param area - The node or area on which to zoom onto. Areas should be provided
   *               in local space. Nodes must be a child of the camera view, although
   *               they don't have to be a direct child.
   * @param duration - The duration of the transition
   * @param buffer - The buffer to apply around the node and the viewport edges
   * @param timing - The timing function to use for the transition
   */
  public *zoomOnto(
    area: PossibleRect | Node,
    duration: number = 1,
    buffer: number = 0,
    timing: TimingFunction = easeInOutCubic,
  ): ThreadGenerator {
    if (area instanceof Node) {
      if (!this.isPartOfSceneTree(area)) {
        useLogger().error(
          "Trying to zoom onto a node that is not a child of the camera view",
        );
        return;
      }

      area = new Rect(
        area.absolutePosition().transformAsPoint(this.worldToLocal()),
        area.cacheRect().size,
      );
    }

    const rect = new Rect(area);
    const scale = this.size().div(this.fitRectAroundArea(rect, buffer));
    const targetPosition = this.calculateOffsetToCenterOntoArea(rect, scale);

    yield* all(
      this.scale(scale, duration, timing),
      this.position(targetPosition, duration, timing, (from, to, value) => {
        // We need to provide a custom interpolation function here
        // because we need to account for any rotation that might
        // have also been applied to the camera.
        const matrix = new DOMMatrix();
        matrix.rotateSelf(0, 0, this.rotation());
        return from.lerp(to.transformAsPoint(matrix), value);
      }),
    );
  }

  public centerOn(
    node: Node,
    duration?: number,
    timing?: TimingFunction,
  ): ThreadGenerator;
  public centerOn(
    area: PossibleRect,
    duration?: number,
    timing?: TimingFunction,
  ): ThreadGenerator;
  /**
   * Centers the camera view on the provided node without
   * changing the zoom level.
   *
   * @param node - The node to center on
   * @param duration - The duration of the transition
   * @param timing - The timing function to use for the transition
   */
  public *centerOn(
    area: Vector2 | PossibleRect | Node,
    duration: number = 1,
    timing: TimingFunction = easeInOutCubic,
  ): ThreadGenerator {
    if (area instanceof Node) {
      if (!this.isPartOfSceneTree(area)) {
        useLogger().error(
          "Trying to zoom onto a node that is not a child of the camera view",
        );
        return;
      }

      area = this.getRectFromNode(area);
    }

    yield* this.position(
      this.calculateOffsetToCenterOntoArea(new Rect(area), this.scale()),
      duration,
      timing,
    );
  }

  public moveBetween(
    nodes: Node[],
    options: Partial<TravelOptions>,
  ): ThreadGenerator;
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

    defaults.duration = cycle(castArray(defaults.duration));
    defaults.buffer = cycle(castArray(defaults.buffer));
    defaults.wait = cycle(castArray(defaults.wait));
    defaults.zoom = cycle(castArray(defaults.zoom));
    defaults.timing = cycle(castArray(defaults.timing));

    nodes = nodes.filter((node) => {
      const result = this.isPartOfSceneTree(node);
      if (!result) {
        useLogger().warn(
          "Node is not part of the camera's scene tree. It will get ignored during the transition",
        );
      }
      return result;
    });

    for (let i = 0; i < nodes.length; i++) {
      const zoom = defaults.zoom[i];
      const node = nodes[i];
      const duration = defaults.duration[i];
      const wait = defaults.wait[i];
      const timing = defaults.timing[i];

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

  public *followPath(
    path: Line,
    duration: number = 1,
    timing: TimingFunction = easeInOutCubic,
  ): ThreadGenerator {
    const transformPoint = (point: Vector2): Vector2 =>
      point
        .transformAsPoint(path.localToWorld())
        .transformAsPoint(this.worldToLocal())
        .transformAsPoint(this.rotationMatrix())
        .mul(this.scale()).flipped;

    const destination = transformPoint(path.parsedPoints().at(-1)!);

    yield* this.position(destination, duration, timing, (from, to, value) =>
      transformPoint(path.getPointAtPercentage(value).position),
    );
  }

  @computed()
  private rotationMatrix(): DOMMatrix {
    const matrix = new DOMMatrix();
    matrix.rotateSelf(0, 0, this.rotation());
    return matrix;
  }

  private calculateOffsetToCenterOntoArea(
    area: Rect,
    scale: Vector2 = Vector2.one,
  ): Vector2 {
    return area.position.mul(scale).flipped;
  }

  /**
   * Recursively checks if the provided node is a child of the
   * camera view.
   *
   * @param node - The node to check
   */
  private isPartOfSceneTree(node: Node): boolean {
    let parent = node.parent();

    while (parent) {
      if (parent === this) {
        return true;
      }
      node = parent;
      parent = parent.parent();
    }

    return false;
  }

  private getRectFromNode(node: Node): Rect {
    return new Rect(
      node.absolutePosition().transformAsPoint(this.worldToLocal()),
      node.cacheRect().size,
    );
  }

  /**
   * Calculates the size of a rectangle that encloses the provided area
   * while maintaining the same aspect ratio as the camera view.
   *
   * @param area - The node that the rectangle should be fitted around
   * @param buffer - Buffer to apply around the node and the edges of the rectangle
   */
  private fitRectAroundArea(area: Rect, buffer: number): Vector2 {
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
}
