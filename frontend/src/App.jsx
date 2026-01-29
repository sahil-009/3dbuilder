import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import Scene from './components/Scene';
import Controls from './components/Controls';
import Interface from './components/Interface';

/**
 * Main App Component
 * 
 * State Management:
 * - cameraMode: 'orbit' | 'walk'
 * - activeTheme: 'modern' | 'classic' | 'minimal'
 * - playerState: { position, rotation } for walk mode
 * 
 * Architecture:
 * - Scene: Contains 3D house structure with Bounds for auto-centering
 * - Controls: Manages camera (orbit or walk mode)
 * - Interface: UI buttons for switching camera modes
 */
function App() {
  const [cameraMode, setCameraMode] = useState('orbit');
  const [activeTheme, setActiveTheme] = useState('modern');
  const [playerState, setPlayerState] = useState(null);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* 3D Canvas */}
      <Canvas
        camera={{
          position: [0, 3, 8],
          fov: 60,
        }}
        gl={{ antialias: true }}
      >
        <Scene mode={cameraMode} theme={activeTheme} playerState={playerState} />
        <Controls mode={cameraMode} onPlayerStateChange={setPlayerState} />
      </Canvas>

      {/* UI Overlay */}
      <Interface
        cameraMode={cameraMode}
        onCameraModeChange={setCameraMode}
        activeTheme={activeTheme}
        onThemeChange={setActiveTheme}
      />
    </div>
  );
}

export default App;
