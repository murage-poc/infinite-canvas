// Coordinate system types
export interface Point {
  x: number;
  y: number;
}

export interface WorldPoint extends Point {
  // High precision coordinates for infinite canvas
}

export interface ScreenPoint extends Point {
  // Screen pixel coordinates
}

// Transform matrix for zoom and pan
export interface Transform {
  scale: number;
  translateX: number;
  translateY: number;
}

// Drawing tools
export enum ToolType {
  PAN = 'pan',
  PEN = 'pen',
  BRUSH = 'brush',
  ERASER = 'eraser',
  RECTANGLE = 'rectangle',
  CIRCLE = 'circle',
  LINE = 'line',
  TEXT = 'text'
}

// Drawing element types
export interface BaseElement {
  id: string;
  type: string;
  points: WorldPoint[];
  color: string;
  strokeWidth: number;
  opacity: number;
  createdAt: number;
  updatedAt: number;
}

export interface StrokeElement extends BaseElement {
  type: 'stroke';
  pressure?: number[];
  tilt?: number[];
  brushType: 'pen' | 'brush' | 'marker';
}

export interface ShapeElement extends BaseElement {
  type: 'shape';
  shapeType: 'rectangle' | 'circle' | 'line';
  width?: number;
  height?: number;
  fillColor?: string;
  isFilled: boolean;
}

export interface TextElement extends BaseElement {
  type: 'text';
  text: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  textAlign: 'left' | 'center' | 'right';
}

export type DrawingElement = StrokeElement | ShapeElement | TextElement;

// Canvas state
export interface CanvasState {
  elements: DrawingElement[];
  selectedElements: string[];
  transform: Transform;
  tool: ToolType;
  color: string;
  strokeWidth: number;
  opacity: number;
  isDrawing: boolean;
  isPanning: boolean;
  lastMousePosition: ScreenPoint | null;
}

// Brush settings
export interface BrushSettings {
  type: ToolType;
  color: string;
  strokeWidth: number;
  opacity: number;
  pressure: boolean;
  tilt: boolean;
}

// Viewport for culling
export interface Viewport {
  left: number;
  top: number;
  right: number;
  bottom: number;
  scale: number;
}

// Tile system for performance
export interface Tile {
  x: number;
  y: number;
  zoom: number;
  elements: DrawingElement[];
}

// Export formats
export enum ExportFormat {
  SVG = 'svg',
  PNG = 'png',
  JPEG = 'jpeg',
  JSON = 'json'
}

// Save/Load data structure
export interface CanvasData {
  version: string;
  elements: DrawingElement[];
  metadata: {
    createdAt: number;
    updatedAt: number;
    name: string;
    description?: string;
  };
} 