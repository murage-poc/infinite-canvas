import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useCanvasStore } from '../store/canvasStore';
import { ToolType, ScreenPoint } from '../types';
import { CoordinateTransformer } from '../utils/coordinates';

interface CanvasProps {
  width: number;
  height: number;
}

export const Canvas: React.FC<CanvasProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState<ScreenPoint | null>(null);
  const [selectionRect, setSelectionRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  const {
    elements,
    selectedElements,
    transform,
    tool,
    isDrawing,
    zoomIn,
    zoomOut,
    pan,
    startDrawing,
    continueDrawing,
    endDrawing,
    selectElement,
    deselectElement,
    getCoordinateTransformer
  } = useCanvasStore();

  // Get coordinate transformer
  const coordinateTransformer = getCoordinateTransformer();

  // Drawing context setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Enable image smoothing for better quality
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
  }, [width, height]);

  // Render function
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Apply transform
    ctx.save();
    ctx.translate(transform.translateX, transform.translateY);
    ctx.scale(transform.scale, transform.scale);

    // Get viewport for culling
    const rawViewport = coordinateTransformer.getViewport(width, height);
    const viewport = {
      x: rawViewport.left,
      y: rawViewport.top,
      width: rawViewport.right - rawViewport.left,
      height: rawViewport.bottom - rawViewport.top
    };
    const visibleElements = elements.filter(element => {
      const bbox = CoordinateTransformer.getBoundingBox(element.points);
      return CoordinateTransformer.rectsIntersect(viewport, bbox);
    });

    // Render elements
    visibleElements.forEach(element => {
      const isSelected = selectedElements.includes(element.id);
      
      if (element.type === 'stroke') {
        renderStroke(ctx, element, isSelected);
      } else if (element.type === 'shape') {
        renderShape(ctx, element, isSelected);
      } else if (element.type === 'text') {
        renderText(ctx, element, isSelected);
      }
    });

    // Render selection rectangle
    if (selectionRect) {
      ctx.restore();
      ctx.save();
      ctx.strokeStyle = '#007acc';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(selectionRect.x, selectionRect.y, selectionRect.width, selectionRect.height);
      ctx.setLineDash([]);
    }

    ctx.restore();
  }, [elements, selectedElements, transform, width, height, selectionRect, coordinateTransformer]);

  // Render stroke element
  const renderStroke = (ctx: CanvasRenderingContext2D, element: any, isSelected: boolean) => {
    if (element.points.length < 2) return;

    ctx.beginPath();
    ctx.strokeStyle = element.color;
    ctx.globalAlpha = element.opacity;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const scale = transform.scale;
    ctx.lineWidth = element.strokeWidth / scale;

    ctx.moveTo(element.points[0].x, element.points[0].y);
    for (let i = 1; i < element.points.length; i++) {
      const point = element.points[i];
      ctx.lineTo(point.x, point.y);
    }

    ctx.stroke();

    // Render selection outline
    if (isSelected) {
      ctx.strokeStyle = '#007acc';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.globalAlpha = 1;
  };

  // Render shape element
  const renderShape = (ctx: CanvasRenderingContext2D, element: any, isSelected: boolean) => {
    if (element.points.length < 2) return;

    const startPoint = element.points[0];
    const endPoint = element.points[element.points.length - 1];
    
    ctx.strokeStyle = element.color;
    ctx.globalAlpha = element.opacity;
    const scale = transform.scale;
    ctx.lineWidth = element.strokeWidth / scale;

    if (element.isFilled && element.fillColor) {
      ctx.fillStyle = element.fillColor;
    }

    if (element.shapeType === 'rectangle') {
      const width = endPoint.x - startPoint.x;
      const height = endPoint.y - startPoint.y;
      
      if (element.isFilled) {
        ctx.fillRect(startPoint.x, startPoint.y, width, height);
      }
      ctx.strokeRect(startPoint.x, startPoint.y, width, height);
    } else if (element.shapeType === 'circle') {
      const radius = Math.sqrt(
        Math.pow(endPoint.x - startPoint.x, 2) + Math.pow(endPoint.y - startPoint.y, 2)
      );
      
      ctx.beginPath();
      ctx.arc(startPoint.x, startPoint.y, radius, 0, 2 * Math.PI);
      
      if (element.isFilled) {
        ctx.fill();
      }
      ctx.stroke();
    } else if (element.shapeType === 'line') {
      ctx.beginPath();
      ctx.moveTo(startPoint.x, startPoint.y);
      ctx.lineTo(endPoint.x, endPoint.y);
      ctx.stroke();
    }

    // Render selection outline
    if (isSelected) {
      ctx.strokeStyle = '#007acc';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.globalAlpha = 1;
  };

  // Render text element
  const renderText = (ctx: CanvasRenderingContext2D, element: any, isSelected: boolean) => {
    if (element.points.length === 0) return;

    const point = element.points[0];
    
    ctx.fillStyle = element.color;
    ctx.font = `${element.fontWeight} ${element.fontSize}px ${element.fontFamily}`;
    ctx.textAlign = element.textAlign as CanvasTextAlign;
    ctx.globalAlpha = element.opacity;

    ctx.fillText(element.text, point.x, point.y);

    // Render selection outline
    if (isSelected) {
      const metrics = ctx.measureText(element.text);
      const textWidth = metrics.width;
      const textHeight = element.fontSize;
      
      ctx.strokeStyle = '#007acc';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(point.x, point.y - textHeight, textWidth, textHeight);
      ctx.setLineDash([]);
    }

    ctx.globalAlpha = 1;
  };

  // Re-render when dependencies change
  useEffect(() => {
    render();
  }, [render]);

  // Mouse event handlers
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const screenPoint: ScreenPoint = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    const worldPoint = coordinateTransformer.screenToWorld(screenPoint);

    if (tool === ToolType.PAN && e.button === 0) {
      setIsPanning(true);
      setLastPanPoint(screenPoint);
      return;
    }

    if (e.button === 0) {
      if (tool === ToolType.PEN || tool === ToolType.BRUSH || tool === ToolType.RECTANGLE || tool === ToolType.CIRCLE || tool === ToolType.LINE || tool === ToolType.TEXT || tool === ToolType.ERASER) {
        startDrawing(worldPoint);
      }
    } else if (e.button === 1 || e.button === 2) {
      setIsPanning(true);
      setLastPanPoint(screenPoint);
    }
  }, [tool, elements, selectedElements, coordinateTransformer, startDrawing, selectElement, deselectElement]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const screenPoint: ScreenPoint = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    const worldPoint = coordinateTransformer.screenToWorld(screenPoint);

    if ((isPanning && lastPanPoint) || (tool === ToolType.PAN && isPanning && lastPanPoint)) {
      const deltaX = screenPoint.x - lastPanPoint.x;
      const deltaY = screenPoint.y - lastPanPoint.y;
      pan(deltaX, deltaY);
      setLastPanPoint(screenPoint);
      return;
    } else if (isDrawing) {
      continueDrawing(worldPoint);
    } else if (selectionRect) {
      setSelectionRect({
        x: selectionRect.x,
        y: selectionRect.y,
        width: screenPoint.x - selectionRect.x,
        height: screenPoint.y - selectionRect.y
      });
    }
  }, [isPanning, lastPanPoint, isDrawing, selectionRect, coordinateTransformer, pan, continueDrawing]);

  const handleMouseUp = useCallback(() => {
    if (isPanning) {
      setIsPanning(false);
      setLastPanPoint(null);
    }
    if (isDrawing) {
      endDrawing();
    }
    if (selectionRect) {
      setSelectionRect(null);
    }
  }, [isDrawing, isPanning, selectionRect, endDrawing]);

  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const center: ScreenPoint = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    if (e.deltaY < 0) {
      zoomIn(center);
    } else {
      zoomOut(center);
    }
  }, [zoomIn, zoomOut]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        // Delete selected elements
        console.log('Delete selected elements');
      } else if (e.key === 'Escape') {
        // Clear selection
        console.log('Clear selection');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      onContextMenu={(e) => e.preventDefault()}
      style={{
        cursor: tool === ToolType.PAN && isPanning ? 'grabbing' : tool === ToolType.PAN ? 'grab' : (tool === ToolType.PEN || tool === ToolType.BRUSH || tool === ToolType.RECTANGLE || tool === ToolType.CIRCLE || tool === ToolType.LINE || tool === ToolType.TEXT) ? 'crosshair' : 'default'
      }}
    />
  );
}; 