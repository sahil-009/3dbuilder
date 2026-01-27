import React, { useRef, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { OrbitControls, PointerLockControls } from '@react-three/drei';

/**
 * Controls Component - Manages camera modes
 * ORBIT MODE: Blender-like rotation (default) - works with Bounds for auto-centering
 * WALK MODE: FPS-style with WASD + mouse look
 * 
 * Only ONE control is active at a time
 * Note: Bounds component automatically handles centering in orbit mode
 */
export default function Controls({ mode }) {
    const orbitRef = useRef();
    const walkRef = useRef();
    const { camera } = useThree();

    // Set camera height for walk mode (human eye level)
    useEffect(() => {
        if (mode === 'walk') {
            camera.position.y = 1.6; // Human eye height
            if (walkRef.current) {
                walkRef.current.lock();
            }
        } else {
            if (walkRef.current && walkRef.current.isLocked) {
                walkRef.current.unlock();
            }
        }
    }, [mode, camera]);

    // Prevent camera going below floor in walk mode
    useEffect(() => {
        if (mode === 'walk') {
            const interval = setInterval(() => {
                if (camera.position.y < 0.5) {
                    camera.position.y = 0.5;
                }
            }, 100);
            return () => clearInterval(interval);
        }
    }, [mode, camera]);

    return (
        <>
            {mode === 'orbit' && (
                <OrbitControls
                    ref={orbitRef}
                    enablePan={true}
                    enableZoom={true}
                    enableRotate={true}
                    minDistance={2}
                    maxDistance={50}
                />
            )}

            {mode === 'walk' && (
                <PointerLockControls
                    ref={walkRef}
                    selector="#root"
                />
            )}
        </>
    );
}
