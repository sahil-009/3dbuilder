import React from 'react';
import { useGLTF, Bounds } from '@react-three/drei';

// Preload the 3D floorplan
useGLTF.preload('/floorplan.glb');

/**
 * Structure Component - Loads the house model
 * Now wrapped with Bounds for automatic centering
 */
function Structure() {
    const { scene } = useGLTF('/floorplan.glb');
    return <primitive object={scene} />;
}

/**
 * Scene Component - Contains the 3D house with automatic centering via Bounds
 * The Bounds component automatically calculates bounding box and provides centering utilities
 */
export default function Scene() {
    return (
        <>
            {/* Basic lighting - no shadows for performance */}
            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 10, 5]} intensity={0.8} />

            {/* Bounds automatically centers and fits the content */}
            <Bounds fit clip observe damping={6} margin={0.5}>
                <Structure />
            </Bounds>
        </>
    );
}
