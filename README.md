# Infinite Canvas - Drawing Application

A powerful, infinite zoom drawing canvas built with React, TypeScript, and HTML5 Canvas. This application provides a seamless drawing experience with unlimited zoom levels, smooth panning, and a comprehensive set of drawing tools.

## ✨ Features

### 🎨 Core Drawing Features
- **Infinite Zoom**: Zoom in and out with smooth transitions (0.01x to 100x scale)
- **Infinite Panning**: Pan in all directions across the infinite canvas
- **Multiple Drawing Tools**: Pen, brush, eraser, shapes (rectangle, circle, line), text, and selection tools
- **Pressure Sensitivity**: Support for pressure-sensitive drawing tablets
- **High Precision**: Floating-point coordinate system for precise positioning at any zoom level

### 🖱️ User Interface
- **Intuitive Controls**: Mouse wheel for zoom, middle/right click for panning
- **Toolbar**: Complete set of drawing tools and settings
- **Color Picker**: Full color selection with opacity control
- **Brush Settings**: Adjustable stroke width and opacity
- **Zoom Indicator**: Real-time zoom percentage and position display
- **Minimap**: Overview of the entire canvas with click-to-navigate functionality

### 🚀 Performance & Optimization
- **Viewport Culling**: Only renders visible elements for optimal performance
- **Level of Detail (LOD)**: Adjusts rendering complexity based on zoom level
- **Efficient Rendering**: Optimized Canvas 2D rendering with smooth animations
- **Memory Management**: Efficient handling of large numbers of drawing elements

### 💾 Persistence & Export
- **Save/Load**: Save drawings as JSON files and load them back
- **Export Options**: Export to SVG, PNG, or JPEG formats
- **Auto-save**: Automatic saving of canvas state (planned feature)

### ⌨️ Keyboard Shortcuts
- `Delete` / `Backspace`: Delete selected elements
- `Escape`: Clear selection
- `Ctrl+Z` / `Cmd+Z`: Undo (planned)
- `Ctrl+Shift+Z` / `Cmd+Shift+Z`: Redo (planned)
- `Ctrl+S` / `Cmd+S`: Save (planned)
- `Ctrl+O` / `Cmd+O`: Open (planned)
- `Ctrl+A` / `Cmd+A`: Select all (planned)

## 🛠️ Technology Stack

- **Frontend**: React 18 with TypeScript
- **State Management**: Zustand
- **Build Tool**: Vite
- **Styling**: CSS with modern design patterns
- **Canvas**: HTML5 Canvas 2D API
- **Development**: ESLint, TypeScript strict mode

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup
1. Clone the repository:
```bash
git clone <repository-url>
cd infinite-canvas
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

## 🎯 Usage Guide

### Getting Started
1. **Select a Tool**: Choose from the toolbar on the left side
   - **Pen**: Precise drawing tool
   - **Brush**: Smooth, artistic strokes
   - **Eraser**: Remove drawn elements
   - **Select**: Select and move elements
   - **Shapes**: Rectangle, circle, and line tools
   - **Text**: Add text elements

2. **Drawing**:
   - Left click and drag to draw
   - Use the color picker to change colors
   - Adjust brush size and opacity with the sliders

3. **Navigation**:
   - **Zoom**: Use mouse wheel to zoom in/out
   - **Pan**: Middle or right click and drag to pan
   - **Reset**: Click the home button (⌂) to reset zoom

4. **Selection**:
   - Click on elements to select them
   - Ctrl/Cmd+click for multi-selection
   - Drag to create a selection rectangle
   - Delete selected elements with Delete key

5. **Saving**:
   - Click the save button (💾) to download your drawing
   - Use the load button (📁) to open saved drawings

### Advanced Features

#### Minimap Navigation
- The minimap in the bottom-right shows an overview of your entire canvas
- Click anywhere on the minimap to navigate to that area
- The blue rectangle shows your current viewport

#### Zoom Controls
- Use the zoom indicator in the bottom-left for precise zoom control
- The indicator shows current zoom percentage and position
- Quick zoom buttons for zoom in (+), zoom out (-), and reset (⌂)

#### Export Options
- **SVG**: Vector format for scalable graphics
- **PNG**: High-quality raster format with transparency
- **JPEG**: Compressed format for web use

## 🏗️ Project Structure

```
src/
├── components/          # React components
│   ├── Canvas.tsx      # Main drawing canvas
│   ├── Toolbar.tsx     # Drawing tools and controls
│   ├── Minimap.tsx     # Navigation minimap
│   └── ZoomIndicator.tsx # Zoom level display
├── store/              # State management
│   └── canvasStore.ts  # Zustand store for canvas state
├── types/              # TypeScript type definitions
│   └── index.ts        # Core types and interfaces
├── utils/              # Utility functions
│   └── coordinates.ts  # Coordinate transformation utilities
├── App.tsx             # Main application component
├── main.tsx            # Application entry point
└── index.css           # Global styles
```

## 🔧 Development

### Available Scripts
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint
- `npm run type-check`: Run TypeScript type checking

### Key Implementation Details

#### Coordinate System
The application uses a high-precision coordinate system that maps between:
- **Screen Coordinates**: Pixel positions on the display
- **World Coordinates**: Infinite canvas coordinates with floating-point precision

#### Rendering Pipeline
1. **Viewport Calculation**: Determine visible area based on current transform
2. **Element Culling**: Filter elements outside the viewport
3. **Coordinate Transformation**: Convert world coordinates to screen coordinates
4. **Rendering**: Draw elements with appropriate styling and selection indicators

#### State Management
- **Zustand Store**: Centralized state for all canvas operations
- **Immutable Updates**: All state changes are immutable for performance
- **Optimized Re-renders**: Components only re-render when necessary

## 🚀 Performance Optimizations

1. **Viewport Culling**: Only render elements visible in the current viewport
2. **Efficient Rendering**: Use Canvas 2D API for optimal performance
3. **Debounced Updates**: Smooth zoom and pan operations
4. **Memory Management**: Efficient handling of large numbers of elements
5. **Level of Detail**: Adjust rendering complexity based on zoom level

## 🔮 Future Enhancements

- [ ] Undo/Redo functionality
- [ ] Layer system
- [ ] Advanced brush types and textures
- [ ] Real-time collaboration
- [ ] Cloud storage integration
- [ ] Advanced export options (PDF, etc.)
- [ ] Touch and stylus support for mobile devices
- [ ] Plugin system for custom tools
- [ ] Performance profiling and optimization tools

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern web technologies for optimal performance
- Inspired by professional drawing applications
- Designed for both casual and professional use

---

**Happy Drawing! 🎨** 