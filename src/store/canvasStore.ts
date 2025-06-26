import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { 
  CanvasState, 
  DrawingElement, 
  StrokeElement, 
  ShapeElement, 
  TextElement, 
  ToolType, 
  Transform, 
  WorldPoint, 
  ScreenPoint,
  CanvasData 
} from '../types';
import { CoordinateTransformer } from '../utils/coordinates';

interface CanvasStore extends CanvasState {
  // Actions
  setTool: (tool: ToolType) => void;
  setColor: (color: string) => void;
  setStrokeWidth: (width: number) => void;
  setOpacity: (opacity: number) => void;
  setTransform: (transform: Transform) => void;
  zoomIn: (center?: ScreenPoint) => void;
  zoomOut: (center?: ScreenPoint) => void;
  resetZoom: () => void;
  pan: (deltaX: number, deltaY: number) => void;
  startDrawing: (point: WorldPoint, pressure?: number, tilt?: number) => void;
  continueDrawing: (point: WorldPoint, pressure?: number, tilt?: number) => void;
  endDrawing: () => void;
  addElement: (element: DrawingElement) => void;
  updateElement: (id: string, updates: Partial<DrawingElement>) => void;
  deleteElement: (id: string) => void;
  selectElement: (id: string) => void;
  deselectElement: (id: string) => void;
  clearSelection: () => void;
  selectElementsInRect: (rect: { x: number; y: number; width: number; height: number }) => void;
  moveSelectedElements: (deltaX: number, deltaY: number) => void;
  deleteSelectedElements: () => void;
  clearCanvas: () => void;
  saveCanvas: () => CanvasData;
  loadCanvas: (data: CanvasData) => void;
  exportCanvas: (format: 'svg' | 'png' | 'jpeg') => void;
  undo: () => void;
  redo: () => void;
  
  // Computed
  getCoordinateTransformer: () => CoordinateTransformer;
  getVisibleElements: (viewport: { x: number; y: number; width: number; height: number }) => DrawingElement[];
}

const MIN_SCALE = 0.01;
const MAX_SCALE = 1e12;
const ZOOM_FACTOR = 1.05;

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  // Initial state
  elements: [],
  selectedElements: [],
  transform: {
    scale: 1,
    translateX: 0,
    translateY: 0
  },
  tool: ToolType.PEN,
  color: '#000000',
  strokeWidth: 2,
  opacity: 1,
  isDrawing: false,
  isPanning: false,
  lastMousePosition: null,

  // Actions
  setTool: (tool) => set({ tool }),
  
  setColor: (color) => set({ color }),
  
  setStrokeWidth: (strokeWidth) => set({ strokeWidth }),
  
  setOpacity: (opacity) => set({ opacity }),
  
  setTransform: (transform) => set({ transform }),
  
  zoomIn: (center) => {
    const { transform } = get();
    const newScale = Math.min(transform.scale * ZOOM_FACTOR, MAX_SCALE);
    
    if (center) {
      const scaleRatio = newScale / transform.scale;
      const newTranslateX = center.x - (center.x - transform.translateX) * scaleRatio;
      const newTranslateY = center.y - (center.y - transform.translateY) * scaleRatio;
      
      set({
        transform: {
          scale: newScale,
          translateX: newTranslateX,
          translateY: newTranslateY
        }
      });
    } else {
      set({
        transform: { ...transform, scale: newScale }
      });
    }
  },
  
  zoomOut: (center) => {
    const { transform } = get();
    const newScale = Math.max(transform.scale / ZOOM_FACTOR, MIN_SCALE);
    
    if (center) {
      const scaleRatio = newScale / transform.scale;
      const newTranslateX = center.x - (center.x - transform.translateX) * scaleRatio;
      const newTranslateY = center.y - (center.y - transform.translateY) * scaleRatio;
      
      set({
        transform: {
          scale: newScale,
          translateX: newTranslateX,
          translateY: newTranslateY
        }
      });
    } else {
      set({
        transform: { ...transform, scale: newScale }
      });
    }
  },
  
  resetZoom: () => set({
    transform: { scale: 1, translateX: 0, translateY: 0 }
  }),
  
  pan: (deltaX, deltaY) => {
    const { transform } = get();
    set({
      transform: {
        ...transform,
        translateX: transform.translateX + deltaX,
        translateY: transform.translateY + deltaY
      }
    });
  },
  
  startDrawing: (point, pressure = 1, tilt = 0) => {
    const { tool, color, strokeWidth, opacity } = get();
    const now = Date.now();
    
    // Debug log for color and opacity
    console.log('[startDrawing] color:', color, 'opacity:', opacity);
    
    if (tool === ToolType.PEN || tool === ToolType.BRUSH) {
      const strokeElement: StrokeElement = {
        id: uuidv4(),
        type: 'stroke',
        points: [point],
        color,
        strokeWidth,
        opacity,
        pressure: [pressure],
        tilt: [tilt],
        brushType: tool === ToolType.PEN ? 'pen' : 'brush',
        createdAt: now,
        updatedAt: now
      };
      set({
        elements: [...get().elements, strokeElement],
        isDrawing: true,
        lastMousePosition: point
      });
    } else if (
      tool === ToolType.RECTANGLE ||
      tool === ToolType.CIRCLE ||
      tool === ToolType.LINE
    ) {
      const shapeElement: ShapeElement = {
        id: uuidv4(),
        type: 'shape',
        points: [point, point], // start and end (will update end)
        color,
        strokeWidth,
        opacity,
        shapeType: tool === ToolType.RECTANGLE ? 'rectangle' : tool === ToolType.CIRCLE ? 'circle' : 'line',
        isFilled: false,
        createdAt: now,
        updatedAt: now
      };
      set({
        elements: [...get().elements, shapeElement],
        isDrawing: true,
        lastMousePosition: point
      });
    } else if (tool === ToolType.TEXT) {
      // Prompt for text input
      const text = window.prompt('Enter text:', '');
      if (text && text.trim() !== '') {
        const textElement: TextElement = {
          id: uuidv4(),
          type: 'text',
          points: [point],
          color,
          strokeWidth,
          opacity,
          text,
          fontSize: 24,
          fontFamily: 'Arial',
          fontWeight: 'normal',
          textAlign: 'left',
          createdAt: now,
          updatedAt: now
        };
        set({
          elements: [...get().elements, textElement],
          isDrawing: false,
          lastMousePosition: null
        });
      }
    } else if (tool === ToolType.ERASER) {
      // Remove any element under the cursor
      const { elements } = get();
      const hitElement = elements.find(el => {
        // For strokes and shapes, check if point is near any segment
        if (el.type === 'stroke' || el.type === 'shape') {
          return el.points.some(p => Math.hypot(p.x - point.x, p.y - point.y) < 10);
        }
        // For text, check if point is near the anchor
        if (el.type === 'text') {
          const p = el.points[0];
          return Math.hypot(p.x - point.x, p.y - point.y) < 20;
        }
        return false;
      });
      if (hitElement) {
        set({ elements: elements.filter(el => el.id !== hitElement.id) });
      }
    }
  },
  
  continueDrawing: (point, pressure = 1, tilt = 0) => {
    const { elements, isDrawing, tool } = get();
    if (!isDrawing || elements.length === 0) return;
    const lastElement = elements[elements.length - 1];
    if (lastElement.type === 'stroke' && (tool === ToolType.PEN || tool === ToolType.BRUSH)) {
      const updatedElement: StrokeElement = {
        ...lastElement,
        points: [...lastElement.points, point],
        pressure: [...(lastElement.pressure || []), pressure],
        tilt: [...(lastElement.tilt || []), tilt],
        updatedAt: Date.now()
      };
      set({
        elements: [...elements.slice(0, -1), updatedElement],
        lastMousePosition: point
      });
    } else if (lastElement.type === 'shape' && (
      tool === ToolType.RECTANGLE ||
      tool === ToolType.CIRCLE ||
      tool === ToolType.LINE
    )) {
      // Update the end point as the mouse moves
      const updatedElement: ShapeElement = {
        ...lastElement,
        points: [lastElement.points[0], point],
        updatedAt: Date.now()
      };
      set({
        elements: [...elements.slice(0, -1), updatedElement],
        lastMousePosition: point
      });
    } else if (tool === ToolType.ERASER) {
      // Remove any element under the cursor as you drag
      const { elements } = get();
      const hitElement = elements.find(el => {
        if (el.type === 'stroke' || el.type === 'shape') {
          return el.points.some(p => Math.hypot(p.x - point.x, p.y - point.y) < 10);
        }
        if (el.type === 'text') {
          const p = el.points[0];
          return Math.hypot(p.x - point.x, p.y - point.y) < 20;
        }
        return false;
      });
      if (hitElement) {
        set({ elements: elements.filter(el => el.id !== hitElement.id) });
      }
    }
  },
  
  endDrawing: () => set({ isDrawing: false, lastMousePosition: null }),
  
  addElement: (element) => set({
    elements: [...get().elements, element]
  }),
  
  updateElement: (id, updates) => set({
    elements: get().elements.map(el => 
      el.id === id ? { ...el, ...updates, updatedAt: Date.now() } as DrawingElement : el
    )
  }),
  
  deleteElement: (id) => set({
    elements: get().elements.filter(el => el.id !== id),
    selectedElements: get().selectedElements.filter(selectedId => selectedId !== id)
  }),
  
  selectElement: (id) => set({
    selectedElements: [...get().selectedElements, id]
  }),
  
  deselectElement: (id) => set({
    selectedElements: get().selectedElements.filter(selectedId => selectedId !== id)
  }),
  
  clearSelection: () => set({ selectedElements: [] }),
  
  selectElementsInRect: (rect) => {
    const { elements } = get();
    const selectedIds = elements
      .filter(element => {
        const bbox = CoordinateTransformer.getBoundingBox(element.points);
        return CoordinateTransformer.rectsIntersect(rect, bbox);
      })
      .map(element => element.id);
    
    set({ selectedElements: selectedIds });
  },
  
  moveSelectedElements: (deltaX, deltaY) => {
    const { elements, selectedElements } = get();
    
    const updatedElements = elements.map(element => {
      if (selectedElements.includes(element.id)) {
        return {
          ...element,
          points: element.points.map(point => ({
            x: point.x + deltaX,
            y: point.y + deltaY
          })),
          updatedAt: Date.now()
        } as DrawingElement;
      }
      return element;
    });
    
    set({ elements: updatedElements });
  },
  
  deleteSelectedElements: () => {
    const { elements, selectedElements } = get();
    set({
      elements: elements.filter(el => !selectedElements.includes(el.id)),
      selectedElements: []
    });
  },
  
  clearCanvas: () => set({
    elements: [],
    selectedElements: []
  }),
  
  saveCanvas: () => {
    const { elements } = get();
    return {
      version: '1.0.0',
      elements,
      metadata: {
        createdAt: Date.now(),
        updatedAt: Date.now(),
        name: 'Infinite Canvas Drawing',
        description: 'Drawing created with Infinite Canvas'
      }
    };
  },
  
  loadCanvas: (data) => set({
    elements: data.elements,
    selectedElements: []
  }),
  
  exportCanvas: (format) => {
    // Implementation for export functionality
    console.log(`Exporting canvas as ${format}`);
  },
  
  undo: () => {
    // Implementation for undo functionality
    console.log('Undo');
  },
  
  redo: () => {
    // Implementation for redo functionality
    console.log('Redo');
  },
  
  // Computed
  getCoordinateTransformer: () => {
    return new CoordinateTransformer(get().transform);
  },
  
  getVisibleElements: (viewport) => {
    const { elements } = get();
    return elements.filter(element => {
      const bbox = CoordinateTransformer.getBoundingBox(element.points);
      return CoordinateTransformer.rectsIntersect(viewport, bbox);
    });
  }
}));

// --- Auto-save and auto-load logic ---
const STORAGE_KEY = 'infinite-canvas-autosave';

// Auto-load on startup
const saved = localStorage.getItem(STORAGE_KEY);
if (saved) {
  try {
    const data = JSON.parse(saved);
    useCanvasStore.getState().loadCanvas(data);
  } catch (e) {
    console.warn('Failed to load autosave:', e);
  }
}

// Auto-save on elements change
useCanvasStore.subscribe((state: CanvasStore) => {
  const data = state.saveCanvas();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}); 