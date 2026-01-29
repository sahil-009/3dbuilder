import React from 'react';

/**
 * Interface Component - UI buttons for camera mode switching and theme selection
 * Clean, simple buttons with clear labels
 */
export default function Interface({ cameraMode, onCameraModeChange, activeTheme, onThemeChange }) {
    const buttonStyle = {
        padding: '10px 20px',
        margin: '5px',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontWeight: '500',
        transition: 'all 0.2s',
    };

    const activeButtonStyle = {
        ...buttonStyle,
        background: '#4f46e5',
        color: 'white',
    };

    const inactiveButtonStyle = {
        ...buttonStyle,
        background: '#e5e7eb',
        color: '#374151',
    };

    return (
        <div style={{
            position: 'absolute',
            top: 20,
            left: 20,
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
        }}>
            {/* Camera Mode Buttons */}
            <div style={{ background: 'rgba(255,255,255,0.9)', padding: '10px', borderRadius: '8px' }}>
                <div style={{ marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>Camera Mode</div>
                <button
                    style={cameraMode === 'orbit' ? activeButtonStyle : inactiveButtonStyle}
                    onClick={() => onCameraModeChange('orbit')}
                >
                    Orbit View
                </button>
                <button
                    style={cameraMode === 'walk' ? activeButtonStyle : inactiveButtonStyle}
                    onClick={() => onCameraModeChange('walk')}
                >
                    Walk View
                </button>
            </div>

            {/* Theme Selection Buttons */}
            <div style={{ background: 'rgba(255,255,255,0.9)', padding: '10px', borderRadius: '8px' }}>
                <div style={{ marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>Design Theme</div>
                <button
                    style={activeTheme === 'modern' ? activeButtonStyle : inactiveButtonStyle}
                    onClick={() => onThemeChange('modern')}
                >
                    Modern
                </button>
                <button
                    style={activeTheme === 'classic' ? activeButtonStyle : inactiveButtonStyle}
                    onClick={() => onThemeChange('classic')}
                >
                    Classic
                </button>
                <button
                    style={activeTheme === 'minimal' ? activeButtonStyle : inactiveButtonStyle}
                    onClick={() => onThemeChange('minimal')}
                >
                    Minimal
                </button>
            </div>

            {/* Instructions for walk mode */}
            {cameraMode === 'walk' && (
                <div style={{
                    background: 'rgba(0,0,0,0.8)',
                    color: 'white',
                    padding: '10px',
                    borderRadius: '8px',
                    fontSize: '12px',
                }}>
                    <div>WASD: Move</div>
                    <div>Mouse Drag: Rotate</div>
                    <div>Third-person view</div>
                </div>
            )}
        </div>
    );
}
