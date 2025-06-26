import React, { useState, useEffect } from 'react';
import { Canvas } from './components/Canvas';
import { Toolbar } from './components/Toolbar';
import { Minimap } from './components/Minimap';
import { ZoomIndicator } from './components/ZoomIndicator';
import { useCanvasStore } from './store/canvasStore';

function App() {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  const { deleteSelectedElements, clearSelection } = useCanvasStore();

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        deleteSelectedElements();
      } else if (e.key === 'Escape') {
        clearSelection();
      } else if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            if (e.shiftKey) {
              // Ctrl+Shift+Z or Cmd+Shift+Z for Redo
              console.log('Redo');
            } else {
              // Ctrl+Z or Cmd+Z for Undo
              console.log('Undo');
            }
            e.preventDefault();
            break;
          case 's':
            // Ctrl+S or Cmd+S for Save
            console.log('Save');
            e.preventDefault();
            break;
          case 'o':
            // Ctrl+O or Cmd+O for Open
            console.log('Open');
            e.preventDefault();
            break;
          case 'a':
            // Ctrl+A or Cmd+A for Select All
            console.log('Select All');
            e.preventDefault();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleteSelectedElements, clearSelection]);

  return (
    <div className="canvas-container">
      {/* Main Canvas */}
      <Canvas width={windowSize.width} height={windowSize.height} />
      
      {/* Toolbar */}
      <Toolbar />
      
      {/* Zoom Indicator */}
      <ZoomIndicator />
      
      {/* Minimap */}
      <Minimap width={200} height={150} />
      
      {/* Welcome Message (only show if no elements) */}
      <WelcomeMessage />
    </div>
  );
}

// Welcome message component
const WelcomeMessage: React.FC = () => {
  const { elements } = useCanvasStore();

  if (elements.length > 0) return null;

  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      textAlign: 'center',
      color: '#888',
      pointerEvents: 'none',
      userSelect: 'none'
    }}>
      <h2 style={{ marginBottom: '16px', fontSize: '24px' }}>
        Welcome to Infinite Canvas
      </h2>
      <div style={{ fontSize: '16px', lineHeight: '1.5' }}>
        <p>🎨 Start drawing with the pen or brush tool</p>
        <p>🔍 Use mouse wheel to zoom in and out</p>
        <p>🖱️ Middle/right click and drag to pan</p>
        <p>📐 Try different shapes and tools</p>
        <p>💾 Save your work when you're done</p>
      </div>
    </div>
  );
};

export default App; 