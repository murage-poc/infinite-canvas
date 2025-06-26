import React from 'react';
import { useCanvasStore } from '../store/canvasStore';

export const ZoomIndicator: React.FC = () => {
  const { transform, zoomIn, zoomOut, resetZoom } = useCanvasStore();

  const zoomPercentage = Math.round(transform.scale * 100);

  return (
    <div className="zoom-indicator">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          className="btn"
          onClick={() => zoomOut()}
          style={{ padding: '4px 8px', fontSize: '12px' }}
          title="Zoom Out"
        >
          −
        </button>
        
        <span style={{ fontSize: '12px', minWidth: '50px', textAlign: 'center' }}>
          {zoomPercentage}%
        </span>
        
        <button
          className="btn"
          onClick={() => zoomIn()}
          style={{ padding: '4px 8px', fontSize: '12px' }}
          title="Zoom In"
        >
          +
        </button>
        
        <button
          className="btn"
          onClick={resetZoom}
          style={{ padding: '4px 8px', fontSize: '12px' }}
          title="Reset Zoom"
        >
          ⌂
        </button>
      </div>
      
      <div style={{ marginTop: '4px', fontSize: '10px', color: '#888' }}>
        <div>Scale: {transform.scale.toFixed(2)}x</div>
        <div>Position: ({Math.round(transform.translateX)}, {Math.round(transform.translateY)})</div>
      </div>
    </div>
  );
}; 