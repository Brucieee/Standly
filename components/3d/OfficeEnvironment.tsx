import React from 'react';

export const OfficeEnvironment: React.FC = () => {
    return (
        <group>
            {/* Floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
                <planeGeometry args={[30, 30]} />
                <meshStandardMaterial color="#475569" roughness={0.8} /> {/* Lighter Dark Gray */}
            </mesh>

            {/* Rug removed or darkened to match */}

            {/* Walls (Back and Left) */}
            <mesh position={[0, 5, -10]} receiveShadow>
                <boxGeometry args={[30, 10, 1]} />
                <meshStandardMaterial color="#f8fafc" />
            </mesh>
            <mesh position={[-15, 5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
                <boxGeometry args={[30, 10, 1]} />
                <meshStandardMaterial color="#f8fafc" />
            </mesh>
            {/* Baseboards */}
            <mesh position={[0, 0.5, -9.4]}>
                <boxGeometry args={[30, 1, 0.2]} />
                <meshStandardMaterial color="#cbd5e1" />
            </mesh>
            <mesh position={[-14.4, 0.5, 0]} rotation={[0, Math.PI / 2, 0]}>
                <boxGeometry args={[30, 1, 0.2]} />
                <meshStandardMaterial color="#cbd5e1" />
            </mesh>

            {/* Desk Cluster 1: The '6-pack' (3x2 facing each other) */}
            <group position={[0, 0, 0]}>
                {/* Row 1 (Back, facing forward) */}
                {/* I I I */}
                {/* O O O */}
                {/* Desk width ~1.6 */}
                <Desk position={[-1.7, 0, 0.8]} rotation={[0, 0, 0]} />
                <Desk position={[0, 0, 0.8]} rotation={[0, 0, 0]} />
                <Desk position={[1.7, 0, 0.8]} rotation={[0, 0, 0]} />

                {/* Row 2 (Front, facing backward) */}
                {/* O O O */}
                {/* I I I */}
                <Desk position={[-1.7, 0, -0.8]} rotation={[0, Math.PI, 0]} />
                <Desk position={[0, 0, -0.8]} rotation={[0, Math.PI, 0]} />
                <Desk position={[1.7, 0, -0.8]} rotation={[0, Math.PI, 0]} />
            </group>

            {/* Desk Cluster 2: The '2-pack' (Side by side) - BEHIND the 6-pack (negative Z) */}
            <group position={[0, 0, -4]}>
                {/* I   I */}
                {/* O   O */}
                {/* Since they are behind, let's make them face forward too */}
                <Desk position={[-0.85, 0, 0]} rotation={[0, 0, 0]} />
                <Desk position={[0.85, 0, 0]} rotation={[0, 0, 0]} />
            </group>

            {/* Cabinets */}
            <Cabinet position={[-8, 0, -8]} rotation={[0, 0, 0]} />
            <Cabinet position={[8, 0, -8]} rotation={[0, 0, 0]} />
            <Cabinet position={[8, 0, 4]} rotation={[0, -Math.PI / 2, 0]} />



            {/* Lights overhead visual */}
            <mesh position={[0, 9, 0]}>
                <boxGeometry args={[2, 0.2, 8]} />
                <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
            </mesh>

        </group>
    );
};



const Desk: React.FC<{ position: [number, number, number]; rotation?: [number, number, number] }> = ({ position, rotation = [0, 0, 0] }) => {
    // ... (Desk component remains the same, I will use StartLine to skip it in replace_file_content if I could, but I need to replace Plant definition at the end)
    // Wait, replace_file_content replaces a chunk. I can just replace the Plant usage and the Plant definition separately or in one go if contiguous.
    // They are not contiguous. Plant usage is in OfficeEnvironment, Plant definition is at the end.
    // I will do two replaces or one big one?
    // The Desk component is in between.
    // I'll do two replaces. One for usage in OfficeEnvironment, one for definition at the end.
    // Actually, I can just replace the whole file content or use multi_replace.
    // Let's use multi_replace.
    // No, I'll use replace_file_content for the usage first, then another for definition.
    // Wait, I can't do multiple replace_file_content in one turn on the same file if they overlap or if I want to be safe.
    // I'll use multi_replace_file_content.
    // Actually, the tool definition says "Do NOT use this tool if you are only editing a single contiguous block".
    // Here I have two non-contiguous blocks: usage of Plant and definition of Plant.
    // So multi_replace is appropriate.
    // But I need to define Cabinet component. I'll replace Plant definition with Cabinet definition.
    // And replace Plant usage with Cabinet usage.

    // Usage is around line 61.
    // Definition is around line 141.

    // Let's use multi_replace_file_content.
    return (
        <group position={position} rotation={rotation}>
            {/* Table Top */}
            <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
                <boxGeometry args={[1.6, 0.05, 0.8]} />
                <meshStandardMaterial color="#d4b595" /> {/* Light Brown */}
            </mesh>

            {/* Drawer Unit */}
            <mesh position={[0.6, 0.35, 0]} castShadow>
                <boxGeometry args={[0.3, 0.65, 0.7]} />
                <meshStandardMaterial color="#a3a3a3" />
            </mesh>

            {/* Legs (Only left side needed) */}
            <mesh position={[-0.7, 0.35, -0.3]} castShadow>
                <boxGeometry args={[0.05, 0.7, 0.05]} />
                <meshStandardMaterial color="#525252" />
            </mesh>
            <mesh position={[-0.7, 0.35, 0.3]} castShadow>
                <boxGeometry args={[0.05, 0.7, 0.05]} />
                <meshStandardMaterial color="#525252" />
            </mesh>

            {/* Chair (Simple) */}
            <group position={[0, 0, 0.6]}>
                <mesh position={[0, 0.4, 0]} castShadow>
                    <boxGeometry args={[0.5, 0.05, 0.5]} />
                    <meshStandardMaterial color="#475569" />
                </mesh>
                <mesh position={[0, 0.2, 0]} castShadow>
                    <cylinderGeometry args={[0.05, 0.05, 0.4]} />
                    <meshStandardMaterial color="#334155" />
                </mesh>
                <mesh position={[0, 0.7, 0.23]} rotation={[0.1, 0, 0]} castShadow>
                    <boxGeometry args={[0.5, 0.6, 0.05]} />
                    <meshStandardMaterial color="#475569" />
                </mesh>
                {/* Chair Base */}
                <mesh position={[0, 0.05, 0]}>
                    <cylinderGeometry args={[0.3, 0.3, 0.05, 6]} />
                    <meshStandardMaterial color="#334155" />
                </mesh>
            </group>

            {/* Laptop */}
            <group position={[0, 0.73, 0]} rotation={[0, Math.random() * 0.2 - 0.1, 0]}>
                <mesh position={[0, 0.01, 0.1]}>
                    <boxGeometry args={[0.4, 0.02, 0.3]} />
                    <meshStandardMaterial color="#334155" />
                </mesh>
                <mesh position={[0, 0.15, -0.05]} rotation={[Math.PI / 12, 0, 0]}>
                    <boxGeometry args={[0.4, 0.3, 0.02]} />
                    <meshStandardMaterial color="#1e293b" />
                </mesh>
                {/* Screen glow */}
                <mesh position={[0, 0.15, -0.04]} rotation={[Math.PI / 12, 0, 0]}>
                    <planeGeometry args={[0.35, 0.25]} />
                    <meshBasicMaterial color="#60a5fa" />
                </mesh>
            </group>
        </group>
    );
}

const Cabinet: React.FC<{ position: [number, number, number]; rotation?: [number, number, number] }> = ({ position, rotation = [0, 0, 0] }) => {
    return (
        <group position={position} rotation={rotation}>
            <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
                <boxGeometry args={[2, 3, 1]} />
                <meshStandardMaterial color="#475569" />
            </mesh>
            {/* Doors split */}
            <mesh position={[0, 1.5, 0.51]}>
                <boxGeometry args={[0.05, 2.8, 0.02]} />
                <meshStandardMaterial color="#1e293b" />
            </mesh>
            {/* Handles */}
            <mesh position={[-0.2, 1.5, 0.52]}>
                <boxGeometry args={[0.05, 0.4, 0.05]} />
                <meshStandardMaterial color="#cbd5e1" />
            </mesh>
            <mesh position={[0.2, 1.5, 0.52]}>
                <boxGeometry args={[0.05, 0.4, 0.05]} />
                <meshStandardMaterial color="#cbd5e1" />
            </mesh>
        </group>
    )
}
