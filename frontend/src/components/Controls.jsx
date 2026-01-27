import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, PointerLockControls } from '@react-three/drei';
import * as THREE from 'three';

// Constants
const SPAWN_POINT = new THREE.Vector3(0, 1.6, 5); // Near entrance/front
const FLOOR_LEVEL = 0.5; // Minimum Y height to prevent falling through floor
const WALKING_SPEED = 1.6; // Human eye height approx

/**
 * Controls Component - Manages camera modes
 * ORBIT MODE: Blender-like rotation
 * WALK MODE: FPS-style with WASD + mouse look
 *
 * Strict Mode Locking: Only one control type is active at a time.
 */
export default function Controls({ mode }) {
    const orbitRef = useRef();
    const walkRef = useRef();
    const { camera } = useThree();

    // Mode Switch Logic: Handle transitions & Spawn Point
    useEffect(() => {
        if (mode === 'walk') {
            // TRANSITION TO WALK:
            // 1. Move camera to spawn point
            camera.position.copy(SPAWN_POINT);
            camera.lookAt(0, 1.6, 0); // Look straight ahead

            // 2. Lock pointer immediately
            if (walkRef.current) {
                walkRef.current.lock();
            }
        } else {
            // TRANSITION TO ORBIT:
            // 1. Unlock pointer if locked
            if (walkRef.current && walkRef.current.isLocked) {
                walkRef.current.unlock();
            }

            // TRANSITION TO ORBIT: Reset Camera to "Perfect" Orbit View
            // This ensures we won't get stuck in walls or weird angles
            camera.position.set(0, 5, 8);
            camera.lookAt(0, 0, 0);
            camera.up.set(0, 1, 0); // Reset roll if any happened
        }
    }, [mode, camera]);

    // Keyboard controls state
    const moveState = useRef({
        forward: false,
        backward: false,
        left: false,
        right: false
    });

    useEffect(() => {
        const handleKeyDown = (e) => {
            switch (e.code) {
                case 'KeyW': moveState.current.forward = true; break;
                case 'KeyS': moveState.current.backward = true; break;
                case 'KeyA': moveState.current.left = true; break;
                case 'KeyD': moveState.current.right = true; break;
            }
        };
        const handleKeyUp = (e) => {
            switch (e.code) {
                case 'KeyW': moveState.current.forward = false; break;
                case 'KeyS': moveState.current.backward = false; break;
                case 'KeyA': moveState.current.left = false; break;
                case 'KeyD': moveState.current.right = false; break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    // Active Frame Loop: Movement & Floor Clamping
    useFrame((state, delta) => {
        if (mode === 'walk') {
            // Movement Logic
            const speed = 5.0 * delta; // Adjust speed as needed
            const { forward, backward, left, right } = moveState.current;

            if (forward || backward || left || right) {
                const direction = new THREE.Vector3();
                const frontVector = new THREE.Vector3(
                    0,
                    0,
                    Number(backward) - Number(forward)
                );
                const sideVector = new THREE.Vector3(
                    Number(left) - Number(right),
                    0,
                    0
                );

                direction
                    .subVectors(frontVector, sideVector)
                    .normalize()
                    .multiplyScalar(speed)
                    .applyEuler(camera.rotation);

                // Apply movement but ignore Y (pitch) for "walking"
                // We want to move on the XZ plane primarily, but let the camera look where it wants
                // Standard FPS often flattens the movement vector if you don't want to fly
                // Here we'll just move in the direction we are looking for simplicity, 
                // but then clamp Y.

                camera.position.x += direction.x;
                camera.position.z += direction.z;
                // For simple walking, maybe don't change Y by movement, only gravity would
            }

            // Simple Floor Clamp - "Don't fall through floor"
            if (camera.position.y < FLOOR_LEVEL) {
                camera.position.y = FLOOR_LEVEL;
            }
        }
    });

    return (
        <>
            {mode === 'orbit' && (
                <OrbitControls
                    ref={orbitRef}
                    makeDefault // Gives this control priority
                    enablePan={true}
                    enableZoom={true}
                    enableRotate={true}
                    minDistance={2}
                    maxDistance={50}
                    target={[0, 0, 0]} // Explicit default target for "Rebase"
                />
            )}

            {mode === 'walk' && (
                <PointerLockControls
                    ref={walkRef}
                    selector="#root" // Lock to root element
                />
            )}
        </>
    );
}
