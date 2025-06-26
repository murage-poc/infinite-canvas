import React, { useRef, useEffect, useCallback } from 'react';
import { useCanvasStore } from '../store/canvasStore';

interface MinimapProps {
  width: number;
  height: number;
}

export const Minimap: React.FC<MinimapProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    elements,
    transform,
    setTransform,
    getCoordinateTransformer
  } = useCanvasStore();

  const coordinateTransformer = getCoordinateTransformer();

  // Render minimap
  const renderMinimap = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Set background
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(0, 0, width, height);

    if (elements.length === 0) return;

    // Calculate bounds of all elements
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    elements.forEach(element => {
      element.points.forEach(point => {
        minX = Math.min(minX, point.x);
        minY = Math.min(minY, point.y);
        maxX = Math.max(maxX, point.x);
        maxY = Math.max(maxY, point.y);
      });
    });

    // Add padding
    const padding = Math.max(maxX - minX, maxY - minY) * 0.1;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;

    const worldWidth = maxX - minX;
    const worldHeight = maxY - minY;

    // Calculate scale to fit in minimap
    const scaleX = width / worldWidth;
    const scaleY = height / worldHeight;
    const scale = Math.min(scaleX, scaleY);

    // Center the minimap
    const offsetX = (width - worldWidth * scale) / 2;
    const offsetY = (height - worldHeight * scale) / 2;

    // Draw elements
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    elements.forEach(element => {
      if (element.points.length === 0) return;

      ctx.strokeStyle = element.color;
      ctx.lineWidth = Math.max(1, element.strokeWidth * 0.1);
      ctx.globalAlpha = Math.min(0.8, element.opacity);

      if (element.type === 'stroke') {
        if (element.points.length < 2) return;
        
        ctx.beginPath();
        ctx.moveTo(element.points[0].x - minX, element.points[0].y - minY);
        
        for (let i = 1; i < element.points.length; i++) {
          ctx.lineTo(element.points[i].x - minX, element.points[i].y - minY);
        }
        
        ctx.stroke();
      } else if (element.type === 'shape') {
        const startPoint = element.points[0];
        const endPoint = element.points[element.points.length - 1];
        
        if (element.shapeType === 'rectangle') {
          const rectWidth = endPoint.x - startPoint.x;
          const rectHeight = endPoint.y - startPoint.y;
          
          ctx.strokeRect(
            startPoint.x - minX,
            startPoint.y - minY,
            rectWidth,
            rectHeight
          );
        } else if (element.shapeType === 'circle') {
          const radius = Math.sqrt(
            Math.pow(endPoint.x - startPoint.x, 2) + Math.pow(endPoint.y - startPoint.y, 2)
          );
          
          ctx.beginPath();
          ctx.arc(startPoint.x - minX, startPoint.y - minY, radius, 0, 2 * Math.PI);
          ctx.stroke();
        } else if (element.shapeType === 'line') {
          ctx.beginPath();
          ctx.moveTo(startPoint.x - minX, startPoint.y - minY);
          ctx.lineTo(endPoint.x - minX, endPoint.y - minY);
          ctx.stroke();
        }
      }
    });

    ctx.restore();

    // Draw viewport rectangle
    const viewport = coordinateTransformer.getViewport(window.innerWidth, window.innerHeight);
    const viewportX = (viewport.left - minX) * scale + offsetX;
    const viewportY = (viewport.top - minY) * scale + offsetY;
    const viewportWidth = (viewport.right - viewport.left) * scale;
    const viewportHeight = (viewport.bottom - viewport.top) * scale;

    ctx.strokeStyle = '#007acc';
    ctx.lineWidth = 2;
    ctx.setLineDash([3, 3]);
    ctx.strokeRect(viewportX, viewportY, viewportWidth, viewportHeight);
    ctx.setLineDash([]);

    // Draw viewport fill
    ctx.fillStyle = 'rgba(0, 122, 204, 0.1)';
    ctx.fillRect(viewportX, viewportY, viewportWidth, viewportHeight);
  }, [elements, transform, width, height, coordinateTransformer]);

  // Re-render when dependencies change
  useEffect(() => {
    renderMinimap();
  }, [renderMinimap]);

  // Handle minimap click for navigation
  const handleMinimapClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Calculate bounds of all elements (same as in render)
    if (elements.length === 0) return;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    elements.forEach(element => {
      element.points.forEach(point => {
        minX = Math.min(minX, point.x);
        minY = Math.min(minY, point.y);
        maxX = Math.max(maxX, point.x);
        maxY = Math.max(maxY, point.y);
      });
    });

    const padding = Math.max(maxX - minX, maxY - minY) * 0.1;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;

    const worldWidth = maxX - minX;
    const worldHeight = maxY - minY;

    const scaleX = width / worldWidth;
    const scaleY = height / worldHeight;
    const scale = Math.min(scaleX, scaleY);

    const offsetX = (width - worldWidth * scale) / 2;
    const offsetY = (height - worldHeight * scale) / 2;

    // Convert minimap click to world coordinates
    const worldX = (clickX - offsetX) / scale + minX;
    const worldY = (clickY - offsetY) / scale + minY;

    // Convert world coordinates to screen coordinates
    const screenX = worldX * transform.scale + transform.translateX;
    const screenY = worldY * transform.scale + transform.translateY;

    // Center the viewport on the clicked point
    const newTranslateX = window.innerWidth / 2 - screenX;
    const newTranslateY = window.innerHeight / 2 - screenY;

    setTransform({
      ...transform,
      translateX: newTranslateX,
      translateY: newTranslateY
    });
  }, [elements, transform, width, height, setTransform]);

  return (
    <div className="minimap">
      <div style={{ padding: '8px', fontSize: '12px', color: '#ccc', borderBottom: '1px solid #444' }}>
        Minimap
      </div>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onClick={handleMinimapClick}
        style={{
          cursor: 'pointer',
          display: 'block',
          width: '100%',
          height: 'calc(100% - 30px)'
        }}
        title="Click to navigate"
      />
    </div>
  );
}; 