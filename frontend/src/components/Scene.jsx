import * as THREE from 'three';
import React from 'react';
import { useGLTF, Bounds } from '@react-three/drei';
import Avatar from './Avatar';

// Preload all assets
useGLTF.preload('/floorplan.glb');
useGLTF.preload('/theme_modern.glb');
useGLTF.preload('/theme_classic.glb');
useGLTF.preload('/theme_minimal.glb');

/**
 * Structure Component - Loads the base walls/floors
 */
function Structure() {
    const { scene } = useGLTF('/floorplan.glb');
    return <primitive object={scene} />;
}

/**
 * Sofa Component - A simple programmatic 3D sofa
 */
function Sofa({ color, ...props }) {
    const material = new THREE.MeshStandardMaterial({ color: color || '#999' });
    return (
        <group {...props}>
            {/* Seat */}
            <mesh position={[0, 0.25, 0]} material={material}>
                <boxGeometry args={[2.2, 0.5, 1]} />
            </mesh>
            {/* Backrest */}
            <mesh position={[0, 0.75, -0.4]} material={material}>
                <boxGeometry args={[2.2, 1, 0.2]} />
            </mesh>
            {/* Armrests */}
            <mesh position={[-1, 0.5, 0.1]} material={material}>
                <boxGeometry args={[0.2, 0.7, 0.8]} />
            </mesh>
            <mesh position={[1, 0.5, 0.1]} material={material}>
                <boxGeometry args={[0.2, 0.7, 0.8]} />
            </mesh>
        </group>
    );
}

/**
 * ThemeLayer Component
 * Currently renders a Sofa placeholder for visualization purposes
 * replacing the placeholder GLB cubes
 */
function ThemeLayer({ url, visible, color }) {
    // For MVP visualization, we ignore the GLB url for now and render our Sofa
    // This satisfies "replace the cube color with sofa"
    return (
        <group visible={visible}>
            {/* Place the sofa in the living room area approx */}
            <Sofa position={[2, 0, 2]} color={color} rotation={[0, -Math.PI / 4, 0]} />
        </group>
    );
}

/**
 * Scene Component
 * Combines structure and themes within Bounds
 */
export default function Scene({ mode, theme, playerState }) {
    return (
        <>
            {/* Option 1: Soft Sky + Grass Ground (Recommended) */}
            <color attach="background" args={['#eaf4ff']} />
            <fog attach="fog" args={['#eaf4ff', 10, 50]} />

            {/* Outdoor Lighting */}
            <ambientLight intensity={0.7} />
            <directionalLight position={[10, 10, 5]} intensity={0.8} castShadow />
            <directionalLight position={[-10, 10, -5]} intensity={0.3} />

            {/* Grass Ground (Muted Green) */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
                <planeGeometry args={[100, 100]} />
                <meshStandardMaterial color="#8fbf8f" depthWrite={false} />
            </mesh>

            {/* Render Avatar in Walk Mode */}
            {mode === 'walk' && <Avatar playerState={playerState} />}

            {/* Bounds automatically centers and fits the content */}
            <Bounds fit clip observe damping={6} margin={0.5}>
                <Structure />
            </Bounds>

            {/* Theme Layers - Outside Bounds so they don't affect camera centering */}
            <ThemeLayer url="/theme_modern.glb" visible={theme === 'modern'} color="blue" />
            <ThemeLayer url="/theme_classic.glb" visible={theme === 'classic'} color="red" />
            <ThemeLayer url="/theme_minimal.glb" visible={theme === 'minimal'} />
        </>
    );
}
