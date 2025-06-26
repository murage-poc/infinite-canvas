import React from 'react';
import { useCanvasStore } from '../store/canvasStore';
import { ToolType } from '../types';

// Tool icons (simplified SVG icons)
const ToolIcons = {
  [ToolType.PEN]: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
    </svg>
  ),
  [ToolType.BRUSH]: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 14c-1.66 0-3 1.34-3 3 0 1.31-1.16 2-2 2 .92 1.22 2.49 2 4 2 2.21 0 4-1.79 4-4 0-1.66-1.34-3-3-3zm13.71-9.37-1.34-1.34c-.39-.39-1.02-.39-1.41 0L9 12.25 11.75 15l8.96-8.96c.39-.39.39-1.02 0-1.41z"/>
    </svg>
  ),
  [ToolType.ERASER]: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M15.14 3C14.63 2 13.87 1.5 13 1.5S11.37 2 10.86 3L3 10.86C2 11.37 1.5 12.13 1.5 13S2 14.63 3 15.14L10.86 23C11.37 24 12.13 24.5 13 24.5S14.63 24 15.14 23L23 15.14C24 14.63 24.5 13.87 24.5 13S24 11.37 23 10.86L15.14 3Z"/>
    </svg>
  ),
  [ToolType.PAN]: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M2 12c0-1.1.9-2 2-2h2V7c0-1.1.9-2 2-2s2 .9 2 2v3h1V5c0-1.1.9-2 2-2s2 .9 2 2v5h1V7c0-1.1.9-2 2-2s2 .9 2 2v10c0 2.21-1.79 4-4 4h-4c-2.21 0-4-1.79-4-4v-3H4c-1.1 0-2-.9-2-2z"/>
    </svg>
  ),
  [ToolType.RECTANGLE]: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 3h18v18H3V3zm16 16V5H5v14h14z"/>
    </svg>
  ),
  [ToolType.CIRCLE]: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="10"/>
    </svg>
  ),
  [ToolType.LINE]: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 13H5v-2h14v2z"/>
    </svg>
  ),
  [ToolType.TEXT]: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M2.5 4v3h5v12h3V7h5V4H2.5zM21.5 9h-9v3h3v7h3v-7h3V9z"/>
    </svg>
  )
};

export const Toolbar: React.FC = () => {
  const {
    tool,
    color,
    strokeWidth,
    opacity,
    setTool,
    setColor,
    setStrokeWidth,
    setOpacity,
    zoomIn,
    zoomOut,
    resetZoom,
    clearCanvas,
    saveCanvas,
    loadCanvas
  } = useCanvasStore();

  const handleFileLoad = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          loadCanvas(data);
        } catch (error) {
          console.error('Error loading file:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleSave = () => {
    const data = saveCanvas();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'infinite-canvas-drawing.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = (format: 'svg' | 'png' | 'jpeg') => {
    // Implementation for export functionality
    console.log(`Exporting as ${format}`);
  };

  return (
    <div className="toolbar">
      {/* Drawing Tools */}
      <div className="toolbar-row">
        <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#ccc' }}>Tools</h4>
      </div>
      <div className="toolbar-row">
        {[
          ToolType.PAN,
          ToolType.PEN,
          ToolType.BRUSH,
          ToolType.RECTANGLE,
          ToolType.CIRCLE,
          ToolType.LINE,
          ToolType.TEXT
        ].map((toolType) => (
          <button
            key={toolType}
            className={`tool-button ${tool === toolType ? 'active' : ''}`}
            onClick={() => setTool(toolType)}
            title={toolType.charAt(0).toUpperCase() + toolType.slice(1)}
          >
            {ToolIcons[toolType]}
          </button>
        ))}
      </div>

      {/* Color and Brush Settings */}
      <div className="toolbar-row">
        <h4 style={{ margin: '8px 0', fontSize: '12px', color: '#ccc' }}>Color & Brush</h4>
      </div>
      <div className="toolbar-row">
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="color-picker"
          title="Color"
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '10px', color: '#ccc' }}>Size</label>
          <input
            type="range"
            min="1"
            max="50"
            value={strokeWidth}
            onChange={(e) => setStrokeWidth(Number(e.target.value))}
            className="brush-size-slider"
          />
        </div>
      </div>
      <div className="toolbar-row">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '10px', color: '#ccc' }}>Opacity</label>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.1"
            value={opacity}
            onChange={(e) => setOpacity(Number(e.target.value))}
            className="brush-size-slider"
          />
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="toolbar-row">
        <h4 style={{ margin: '8px 0', fontSize: '12px', color: '#ccc' }}>Zoom</h4>
      </div>
      <div className="toolbar-row">
        <button className="btn" onClick={() => zoomIn()} title="Zoom In">+</button>
        <button className="btn" onClick={() => zoomOut()} title="Zoom Out">−</button>
        <button className="btn" onClick={resetZoom} title="Reset Zoom">⌂</button>
      </div>

      {/* File Operations */}
      <div className="toolbar-row">
        <h4 style={{ margin: '8px 0', fontSize: '12px', color: '#ccc' }}>File</h4>
      </div>
      <div className="toolbar-row">
        <button className="btn primary" onClick={handleSave} title="Save">
          💾
        </button>
        <label className="btn" title="Load" style={{ cursor: 'pointer', margin: 0 }}>
          📁
          <input
            type="file"
            accept=".json"
            onChange={handleFileLoad}
            style={{ display: 'none' }}
          />
        </label>
        <button className="btn" onClick={() => clearCanvas()} title="Clear">
          🗑️
        </button>
      </div>

      {/* Export Options */}
      <div className="toolbar-row">
        <h4 style={{ margin: '8px 0', fontSize: '12px', color: '#ccc' }}>Export</h4>
      </div>
      <div className="toolbar-row">
        <button className="btn" onClick={() => handleExport('svg')} title="Export as SVG">
          SVG
        </button>
        <button className="btn" onClick={() => handleExport('png')} title="Export as PNG">
          PNG
        </button>
        <button className="btn" onClick={() => handleExport('jpeg')} title="Export as JPEG">
          JPEG
        </button>
      </div>

      {/* Quick Actions */}
      <div className="toolbar-row">
        <h4 style={{ margin: '8px 0', fontSize: '12px', color: '#ccc' }}>Actions</h4>
      </div>
      <div className="toolbar-row">
      <button className="btn" onClick={() => clearCanvas()} title="Clear All">
          🗑️ Clear All
        </button>
        <button className="btn" onClick={() => console.log('Undo')} title="Undo (Ctrl+Z)">
          ↩️
        </button>
        <button className="btn" onClick={() => console.log('Redo')} title="Redo (Ctrl+Y)">
          ↪️
        </button>

      </div>

      {/* Instructions */}
      <div style={{ marginTop: '16px', fontSize: '10px', color: '#888', maxWidth: '200px' }}>
        <div><strong>Mouse:</strong> Draw, Pan (middle/right)</div>
        <div><strong>Wheel:</strong> Zoom in/out</div>
        <div><strong>Ctrl+Click:</strong> Multi-select</div>
        <div><strong>Delete:</strong> Remove selected</div>
      </div>
    </div>
  );
}; 