import React, { useEffect, useRef } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, PointerLockControls, useGLTF } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// Map theme names to GLB file paths (ensure files exist in public/)
const themeMap = {
    modern: '/house.glb',  // User's custom house model
    classic: '/theme_classic.glb',
    minimal: '/theme_minimal.glb',
    dummy: '/dummy_structure.glb',
};

// Preload all themes
Object.values(themeMap).forEach((url) => {
    useGLTF.preload(url);
});

// Scale map for specific themes
const scaleMap = {
    modern: 1,      // Reset scale for the user's house model
    classic: 1,
    minimal: 1,
    dummy: 1,
};

function Model({ theme }) {
    const path = themeMap[theme] || themeMap['dummy'];
    const scale = scaleMap[theme] || 1;
    const { scene } = useGLTF(path);
    return <primitive object={scene} scale={[scale, scale, scale]} />;
}

export default function Viewer({ walkMode, theme }) {
    const controlsRef = useRef();

    // When walk mode toggles, enable or disable pointer lock controls
    useEffect(() => {
        if (walkMode && controlsRef.current) {
            controlsRef.current.lock();
        } else if (controlsRef.current) {
            controlsRef.current.unlock();
        }
    }, [walkMode]);

    return (
        <Canvas camera={{ position: [0, 2, 5], fov: 60 }}>
            {/* Basic lighting */}
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 10, 7]} intensity={0.8} />

            {/* Ground plane for reference */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[100, 100]} />
                <meshStandardMaterial color="#888" />
            </mesh>

            {/* 3D model */}
            <Model theme={theme} />

            {/* Controls */}
            {walkMode ? (
                <PointerLockControls ref={controlsRef} />
            ) : (
                <OrbitControls enablePan={false} />
            )}
        </Canvas>
    );
}
