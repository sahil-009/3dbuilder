import React, { useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

export default function Avatar({ playerState }) {
    const { scene } = useGLTF('/skeleton.glb');
    const avatarRef = useRef();

    useFrame(() => {
        if (avatarRef.current && playerState) {
            // Position skeleton at player position (feet on floor)
            avatarRef.current.position.copy(playerState.position);

            // Rotate skeleton to face player direction
            avatarRef.current.rotation.y = playerState.rotation;
        }
    });

    return (
        <primitive
            ref={avatarRef}
            object={scene}
            scale={4.0}
        />
    );
}
