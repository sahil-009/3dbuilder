import React, { useRef, useEffect, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Constants
const EYE_HEIGHT = 1.6; // Human eye level
const CAMERA_DISTANCE = 2.0; // Closer for FPS-like feel
const FLOOR_Y = 0.0; // Floor level for player feet
const PLAYER_RADIUS = 0.3; // Collision radius
const MOVE_SPEED = 5.0; // Movement speed

// Simple wall boundaries (hardcoded for MVP)
// Format: { min: Vector3, max: Vector3 }
const WALLS = [
    // Example walls - adjust based on your house model
    { min: new THREE.Vector3(-10, 0, -10), max: new THREE.Vector3(-9, 3, 10) }, // Left wall
    { min: new THREE.Vector3(9, 0, -10), max: new THREE.Vector3(10, 3, 10) },   // Right wall
    { min: new THREE.Vector3(-10, 0, -10), max: new THREE.Vector3(10, 3, -9) }, // Back wall
    { min: new THREE.Vector3(-10, 0, 9), max: new THREE.Vector3(10, 3, 10) },   // Front wall
];

/**
 * Check if a circle (player) collides with an axis-aligned box (wall)
 */
function circleBoxCollision(circlePos, radius, boxMin, boxMax) {
    // Find the closest point on the box to the circle center
    const closestX = Math.max(boxMin.x, Math.min(circlePos.x, boxMax.x));
    const closestZ = Math.max(boxMin.z, Math.min(circlePos.z, boxMax.z));

    // Calculate distance from circle center to closest point
    const distX = circlePos.x - closestX;
    const distZ = circlePos.z - closestZ;
    const distanceSquared = distX * distX + distZ * distZ;

    return distanceSquared < (radius * radius);
}

/**
 * Check if position collides with any wall
 */
function checkWallCollision(position, radius) {
    for (const wall of WALLS) {
        if (circleBoxCollision(position, radius, wall.min, wall.max)) {
            return true;
        }
    }
    return false;
}

/**
 * Controls Component - Manages camera modes
 * ORBIT MODE: Blender-like rotation
 * WALK MODE: FPS-style with camera at head level + mouse look up/down
 */
export default function Controls({ mode, onPlayerStateChange }) {
    const orbitRef = useRef();
    const { camera } = useThree();

    // Player state (separate from camera)
    const playerPosition = useRef(new THREE.Vector3(0, FLOOR_Y, 5));
    const playerRotation = useRef(0); // Y-axis rotation (yaw)
    const cameraPitch = useRef(0); // X-axis rotation (pitch - look up/down)

    // Keyboard state
    const moveState = useRef({
        forward: false,
        backward: false,
        left: false,
        right: false,
        up: false,
        down: false
    });

    // Mouse rotation state
    const mouseState = useRef({
        isDragging: false,
        lastX: 0,
        lastY: 0
    });

    // Mode transition
    useEffect(() => {
        if (mode === 'walk') {
            // Initialize player position
            playerPosition.current.set(0, FLOOR_Y, 5);
            playerRotation.current = 0;
            cameraPitch.current = 0;

            // Position camera for FPS view
            updateCamera();
        } else {
            // Reset to orbit view
            camera.position.set(0, 5, 8);
            camera.lookAt(0, 0, 0);
            camera.up.set(0, 1, 0);
        }
    }, [mode, camera]);

    // Update camera based on player position - FPS style at head level
    const updateCamera = () => {
        const headHeight = EYE_HEIGHT; // Camera at eye/head level

        // Camera position - at the head, slightly behind
        camera.position.set(
            playerPosition.current.x + Math.sin(playerRotation.current) * 0.3,
            playerPosition.current.y + headHeight,
            playerPosition.current.z + Math.cos(playerRotation.current) * 0.3
        );

        // Look direction with pitch (up/down) and yaw (left/right)
        const lookDistance = 10;
        const lookTarget = new THREE.Vector3(
            playerPosition.current.x - Math.sin(playerRotation.current) * lookDistance,
            playerPosition.current.y + headHeight + Math.tan(cameraPitch.current) * lookDistance,
            playerPosition.current.z - Math.cos(playerRotation.current) * lookDistance
        );

        camera.lookAt(lookTarget);
    };

    // Keyboard and mouse event handlers
    useEffect(() => {
        const handleKeyDown = (e) => {
            switch (e.code) {
                case 'KeyW': moveState.current.forward = true; break;
                case 'KeyS': moveState.current.backward = true; break;
                case 'KeyA': moveState.current.left = true; break;
                case 'KeyD': moveState.current.right = true; break;
                case 'KeyQ': moveState.current.up = true; break;
                case 'KeyE': moveState.current.down = true; break;
            }
        };

        const handleKeyUp = (e) => {
            switch (e.code) {
                case 'KeyW': moveState.current.forward = false; break;
                case 'KeyS': moveState.current.backward = false; break;
                case 'KeyA': moveState.current.left = false; break;
                case 'KeyD': moveState.current.right = false; break;
                case 'KeyQ': moveState.current.up = false; break;
                case 'KeyE': moveState.current.down = false; break;
            }
        };

        const handleMouseDown = (e) => {
            if (mode === 'walk') {
                mouseState.current.isDragging = true;
                mouseState.current.lastX = e.clientX;
                mouseState.current.lastY = e.clientY;
            }
        };

        const handleMouseUp = () => {
            mouseState.current.isDragging = false;
        };

        const handleMouseMove = (e) => {
            if (mode === 'walk' && mouseState.current.isDragging) {
                // Horizontal rotation (yaw)
                const deltaX = e.clientX - mouseState.current.lastX;
                playerRotation.current -= deltaX * 0.005;

                // Vertical rotation (pitch - look up/down)
                const deltaY = e.clientY - mouseState.current.lastY;
                cameraPitch.current += deltaY * 0.005;

                // Clamp pitch to prevent looking too far up or down
                const maxPitch = Math.PI / 3; // 60 degrees
                cameraPitch.current = Math.max(-maxPitch, Math.min(maxPitch, cameraPitch.current));

                mouseState.current.lastX = e.clientX;
                mouseState.current.lastY = e.clientY;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [mode]);

    // Movement and camera update loop
    useFrame((state, delta) => {
        if (mode === 'walk') {
            const { forward, backward, left, right, up, down } = moveState.current;

            // Movement
            if (forward || backward || left || right || up || down) {
                const moveVector = new THREE.Vector3();

                // Forward/backward movement (FIXED: W forward, S backward)
                const forwardAmount = (backward ? 1 : 0) - (forward ? 1 : 0);
                const sideAmount = (right ? 1 : 0) - (left ? 1 : 0);
                const verticalAmount = (up ? 1 : 0) - (down ? 1 : 0);

                // Calculate movement in player's local space
                moveVector.x = Math.sin(playerRotation.current) * forwardAmount +
                    Math.cos(playerRotation.current) * sideAmount;
                moveVector.z = Math.cos(playerRotation.current) * forwardAmount -
                    Math.sin(playerRotation.current) * sideAmount;
                moveVector.y = verticalAmount;

                moveVector.normalize().multiplyScalar(MOVE_SPEED * delta);

                // Calculate next position
                const nextPosition = playerPosition.current.clone().add(moveVector);

                // Clamp height (Fly Mode logic) - min: floor, max: 10m high
                nextPosition.y = Math.max(FLOOR_Y, Math.min(10.0, nextPosition.y));

                // Check collision
                if (!checkWallCollision(nextPosition, PLAYER_RADIUS)) {
                    playerPosition.current.copy(nextPosition);
                }
            }

            // Update camera to follow player
            updateCamera();

            // Notify parent of player state (for Avatar component)
            if (onPlayerStateChange) {
                onPlayerStateChange({
                    position: playerPosition.current.clone(),
                    rotation: playerRotation.current
                });
            }
        }
    });

    return (
        <>
            {mode === 'orbit' && (
                <OrbitControls
                    ref={orbitRef}
                    makeDefault
                    enablePan={true}
                    enableZoom={true}
                    enableRotate={true}
                    minDistance={2}
                    maxDistance={50}
                    target={[0, 0, 0]}
                />
            )}
        </>
    );
}
