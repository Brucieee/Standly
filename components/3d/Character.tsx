
import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Html } from '@react-three/drei';
import * as THREE from 'three';

interface CharacterProps {
    position: [number, number, number];
    color: string;
    name: string;
    isPartying?: boolean;
    isWorried?: boolean;
    canMove?: boolean;
    onClick?: () => void;
}

export const Character: React.FC<CharacterProps> = ({ position, color, name, isPartying, isWorried, canMove = false, onClick }) => {
    const group = useRef<THREE.Group>(null);
    const bodyMesh = useRef<THREE.Mesh>(null);
    const headMesh = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);

    // Jump only for 10 seconds when first appearing (mounting)
    const [isJumping, setIsJumping] = useState(true);
    React.useEffect(() => {
        const timer = setTimeout(() => {
            setIsJumping(false);
        }, 10000);
        return () => clearTimeout(timer);
    }, []);

    // Random offset for idle animation to make them look different
    const timeOffset = useMemo(() => Math.random() * 100, []);

    // Movement state
    const [targetPos, setTargetPos] = useState(new THREE.Vector3(...position));
    const [isMoving, setIsMoving] = useState(false);
    const speed = isPartying ? 3 : isWorried ? 1.5 : 2;

    // Room boundaries: 30x30 centered at 0 (x[-15, 15], z[-15, 15])
    // Collision Boxes (Approximate based on environment):
    // 1. Main Desk Cluster (6 desks): x[-3.5, 3.5], z[-1.5, 1.5]
    // 2. Back Desk Cluster (2 desks): x[-1.5, 1.5], z[-4.8, -3.2]
    // 3. Cabinets: 
    //    - Left Back: x[-9, -7], z[-8.5, -7.5]
    //    - Right Back: x[7, 9], z[-8.5, -7.5]
    //    - Right Front: x[7.5, 8.5], z[3, 5]
    // 4. Walls/Edges: x < -13 || x > 13 || z < -13 || z > 13
    const isColliding = (pos: THREE.Vector3) => {
        // Main Cluster
        if (pos.x > -3.5 && pos.x < 3.5 && pos.z > -1.5 && pos.z < 1.5) return true;
        // Back Cluster
        if (pos.x > -1.5 && pos.x < 1.5 && pos.z > -4.8 && pos.z < -3.2) return true;

        // Cabinets
        if (pos.x > -9 && pos.x < -7 && pos.z > -8.5 && pos.z < -7.5) return true;
        if (pos.x > 7 && pos.x < 9 && pos.z > -8.5 && pos.z < -7.5) return true;
        if (pos.x > 7.5 && pos.x < 8.5 && pos.z > 3 && pos.z < 5) return true;

        // Walls
        if (pos.x < -13 || pos.x > 13 || pos.z < -13 || pos.z > 13) return true;
        return false;
    };

    useFrame((state, delta) => {
        if (!group.current) return;

        const time = state.clock.getElapsedTime() + timeOffset;

        // Movement Logic (Always run, even if partying/worried)
        if (canMove && !isMoving && !hovered && Math.random() < 0.02) { // 2% chance per frame to start moving
            // Pick a new random spot
            let validTarget = false;
            let attempts = 0;
            let newTarget = new THREE.Vector3();

            while (!validTarget && attempts < 10) {
                // Room size is roughly 30x30, try to stay in bounds
                const newX = (Math.random() - 0.5) * 20;
                const newZ = (Math.random() - 0.5) * 20;
                newTarget.set(newX, 0, newZ);
                if (!isColliding(newTarget)) {
                    validTarget = true;
                }
                attempts++;
            }

            if (validTarget) {
                setTargetPos(newTarget);
                setIsMoving(true);
            }
        }

        if (isMoving && !hovered) {
            const currentPos = group.current.position.clone();
            const step = speed * delta;

            const dx = targetPos.x - currentPos.x;
            const dz = targetPos.z - currentPos.z;
            const dist = Math.sqrt(dx * dx + dz * dz);

            if (dist < 0.1) {
                setIsMoving(false);
            } else {
                const moveX = (dx / dist) * step;
                const moveZ = (dz / dist) * step;

                // Predict next position
                const nextPos = currentPos.clone();
                nextPos.x += moveX;
                nextPos.z += moveZ;

                // Check Collision on Path (Simple check of next step)
                if (!isColliding(nextPos)) {
                    group.current.position.x += moveX;
                    group.current.position.z += moveZ;

                    // Smoothly rotate to face movement direction
                    const targetRotation = Math.atan2(dx, dz);
                    let rotDiff = targetRotation - group.current.rotation.y;
                    while (rotDiff > Math.PI) rotDiff -= Math.PI * 2;
                    while (rotDiff < -Math.PI) rotDiff += Math.PI * 2;
                    group.current.rotation.y += rotDiff * 5 * delta;
                } else {
                    // Hit obstacle, stop moving
                    setIsMoving(false);
                }
            }
        }

        // Animation Logic (Blended)
        if (isPartying && isJumping) {
            // Party Mode: Jump ONLY when idle AND isJumping is true (first 10s)
            if (!isMoving) {
                // Standing Idle Jump (High energy)
                group.current.position.y = Math.abs(Math.sin(time * 8)) * 0.5;
            } else {
                // Moving: Slide/Glide (No jump)
                group.current.position.y = 0;
            }

            // Wiggle head always if active
            if (headMesh.current) {
                headMesh.current.rotation.z = Math.sin(time * 15) * 0.15;
            }
        }
        else if (isWorried) {
            // Shaky "Nervous" Walk
            group.current.position.x += (Math.random() - 0.5) * 0.05; // Jitter
            if (isMoving) {
                group.current.position.y = 0; // consistent ground level
            }
            // Look around nervously
            if (headMesh.current) {
                headMesh.current.rotation.y = Math.sin(time * 5) * 0.5;
            }
        }
        else {
            // Normal "Idle" Walk
            if (isMoving) {
                // Smooth Glide for walk
                group.current.position.y = 0;
            } else {
                // Breathing while standing
                group.current.position.y = Math.sin(time * 2) * 0.02;
            }
            if (headMesh.current) {
                headMesh.current.rotation.y = Math.sin(time * 0.5) * 0.1; // Slow look around
            }
        }

        // Hover effect scale
        if (group.current) {
            const targetScale = hovered ? 1.2 : 1;
            group.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
        }
    });

    return (
        <group ref={group} position={position}>
            {/* Name Tag */}
            <Html position={[0, 1.8, 0]} center distanceFactor={10} zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
                <div className="bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full text-xs font-bold text-slate-700 whitespace-nowrap shadow-sm border border-slate-200">
                    {name}
                </div>
            </Html>

            {/* Body */}
            <mesh
                ref={bodyMesh}
                position={[0, 0.6, 0]}
                castShadow
                receiveShadow
                onClick={(e) => {
                    e.stopPropagation();
                    console.log('Clicked character:', name);
                    onClick?.();
                }}
                onPointerOver={(e) => {
                    e.stopPropagation();
                    document.body.style.cursor = 'pointer';
                    setHovered(true);
                }}
                onPointerOut={(e) => {
                    e.stopPropagation();
                    document.body.style.cursor = 'auto';
                    setHovered(false);
                }}
            >
                <capsuleGeometry args={[0.3, 0.6, 4, 8]} />
                <meshStandardMaterial color={color} />
            </mesh>

            {/* Head */}
            <mesh
                ref={headMesh}
                position={[0, 1.25, 0]}
                castShadow
                onClick={(e) => {
                    e.stopPropagation();
                    onClick?.();
                }}
                onPointerOver={(e) => {
                    e.stopPropagation();
                    document.body.style.cursor = 'pointer';
                    setHovered(true);
                }}
                onPointerOut={(e) => {
                    e.stopPropagation();
                    document.body.style.cursor = 'auto';
                    setHovered(false);
                }}
            >
                <sphereGeometry args={[0.35, 16, 16]} />
                <meshStandardMaterial color="#ffdec7" /> {/* Skin tone default */}
            </mesh>

            {/* Eyes (Simple formatting) */}
            <mesh position={[0.12, 1.3, 0.28]}>
                <sphereGeometry args={[0.04, 8, 8]} />
                <meshStandardMaterial color="black" />
            </mesh>
            <mesh position={[-0.12, 1.3, 0.28]}>
                <sphereGeometry args={[0.04, 8, 8]} />
                <meshStandardMaterial color="black" />
            </mesh>
        </group>
    );
};
