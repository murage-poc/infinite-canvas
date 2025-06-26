import { Point, WorldPoint, ScreenPoint, Transform } from '../types';

// High precision coordinate transformation utilities
export class CoordinateTransformer {
  private transform: Transform;

  constructor(transform: Transform) {
    this.transform = transform;
  }

  // Convert screen coordinates to world coordinates
  screenToWorld(screenPoint: ScreenPoint): WorldPoint {
    const { scale, translateX, translateY } = this.transform;

    return {
      x: (screenPoint.x - translateX) / scale,
      y: (screenPoint.y - translateY) / scale
    };
  }

  // Convert world coordinates to screen coordinates
  worldToScreen(worldPoint: WorldPoint): ScreenPoint {
    const { scale, translateX, translateY } = this.transform;

    return {
      x: worldPoint.x * scale + translateX,
      y: worldPoint.y * scale + translateY
    };
  }

  // Get the current viewport in world coordinates
  getViewport(screenWidth: number, screenHeight: number) {
    const topLeft = this.screenToWorld({ x: 0, y: 0 });
    const bottomRight = this.screenToWorld({ x: screenWidth, y: screenHeight });

    return {
      left: Math.min(topLeft.x, bottomRight.x),
      top: Math.min(topLeft.y, bottomRight.y),
      right: Math.max(topLeft.x, bottomRight.x),
      bottom: Math.max(topLeft.y, bottomRight.y),
      scale: this.transform.scale
    };
  }

  // Update transform
  updateTransform(transform: Transform) {
    this.transform = transform;
  }

  // Get current transform
  getTransform(): Transform {
    return this.transform;
  }

  // Calculate distance between two points in world coordinates
  static distance(p1: Point, p2: Point): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // Calculate angle between two points
  static angle(p1: Point, p2: Point): number {
    return Math.atan2(p2.y - p1.y, p2.x - p1.x);
  }

  // Interpolate between two points
  static interpolate(p1: Point, p2: Point, t: number): Point {
    return {
      x: p1.x + (p2.x - p1.x) * t,
      y: p1.y + (p2.y - p1.y) * t
    };
  }

  // Smooth a path using Catmull-Rom spline
  static smoothPath(points: Point[],): Point[] {
    if (points.length < 3) return points;

    const smoothed: Point[] = [];

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = i > 0 ? points[i - 1] : points[i];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = i < points.length - 2 ? points[i + 2] : p2;

      // Catmull-Rom spline interpolation
      for (let t = 0; t <= 1; t += 0.1) {
        const t2 = t * t;
        const t3 = t2 * t;

        const x = 0.5 * (
          (2 * p1.x) +
          (-p0.x + p2.x) * t +
          (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
          (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3
        );

        const y = 0.5 * (
          (2 * p1.y) +
          (-p0.y + p2.y) * t +
          (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
          (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3
        );

        smoothed.push({ x, y });
      }
    }

    return smoothed;
  }

  // Check if a point is within a rectangle
  static pointInRect(point: Point, rect: { x: number; y: number; width: number; height: number }): boolean {
    return point.x >= rect.x &&
      point.x <= rect.x + rect.width &&
      point.y >= rect.y &&
      point.y <= rect.y + rect.height;
  }

  // Get bounding box of points
  static getBoundingBox(points: Point[]): { x: number; y: number; width: number; height: number } {
    if (points.length === 0) return { x: 0, y: 0, width: 0, height: 0 };

    let minX = points[0].x;
    let minY = points[0].y;
    let maxX = points[0].x;
    let maxY = points[0].y;

    for (const point of points) {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    }

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  }

  // Check if two rectangles intersect
  static rectsIntersect(
    rect1: { x: number; y: number; width: number; height: number },
    rect2: { x: number; y: number; width: number; height: number }
  ): boolean {
    return rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y;
  }
} 