
import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, OrthographicCamera } from '@react-three/drei';
import { User, Standup, Deadline } from '../types';
import { Character } from './3d/Character';
import { OfficeEnvironment } from './3d/OfficeEnvironment';
import moment from 'moment-timezone';

interface OfficeVisualizerProps {
    users: User[];
    standups: Standup[];
    deadlines: Deadline[];
    onViewStandup: (standup: Standup) => void;
}

export const OfficeVisualizer: React.FC<OfficeVisualizerProps> = ({ users, standups, deadlines, onViewStandup }) => {
    const activeCharacters = useMemo(() => {
        const today = moment().format('YYYY-MM-DD');

        // Filter users who have submitted a standup today
        const activeUsers = users.filter(user => {
            return standups.some(s => s.userId === user.id && s.date.startsWith(today));
        });

        return activeUsers.map((user, index) => {
            // Find their standup
            const userStandup = standups.find(s => s.userId === user.id && s.date.startsWith(today));

            // Check if user has an urgent deadline (Worry Mode)
            const hasUrgentDeadline = deadlines.some(d => {
                if (d.status === 'Completed' || d.status === 'Completed Beyond Schedule') return false;
                const dueDate = moment(d.dueDate);
                const now = moment();
                const hoursUntilDue = dueDate.diff(now, 'hours');
                return (d.assigneeIds?.includes(user.id) || d.creatorId === user.id) && hoursUntilDue >= 0 && hoursUntilDue <= 24;
            });

            // Assign a consistent color based on name if not provided
            const colors = ['#f87171', '#fb923c', '#fbbf24', '#a3e635', '#4ade80', '#22d3ee', '#818cf8', '#c084fc', '#f472b6'];
            const colorIndex = user.name.length % colors.length;
            const color = user.avatarColor || colors[colorIndex];

            // Assign a starting position (spread them out)
            const angle = (index / activeUsers.length) * Math.PI * 2;
            const radius = 7; // Increased to be outside desks (3.5 bounds)
            // Handle case where there's only 1 user (center them)
            const x = activeUsers.length === 1 ? 0 : Math.cos(angle) * radius;
            const z = activeUsers.length === 1 ? 0 : Math.sin(angle) * radius;

            return {
                ...user,
                color,
                position: [x, 0, z] as [number, number, number],
                isPartying: true, // Since they posted a standup, they are partying/active
                isWorried: hasUrgentDeadline,
                canMove: true, // Everyone wanders
                standup: userStandup
            };
        });
    }, [users, standups, deadlines]);

    return (
        <div className="w-full h-[400px] bg-gradient-to-b from-indigo-50 to-white rounded-2xl overflow-hidden border border-slate-200 relative">

            {/* Remove shadows prop from Canvas for performance */}
            <Canvas>
                {/* Switch to PerspectiveCamera for easier FOV/Zoom control */}
                <PerspectiveCamera makeDefault position={[0, 10, 15]} fov={50} onUpdate={c => c.lookAt(0, 0, 0)} />

                {/* Lights - Simplified */}
                <ambientLight intensity={0.8} />
                <directionalLight
                    position={[10, 20, 10]}
                    intensity={0.6}
                /* Disabled shadows for performance */
                />

                {/* Environment */}
                <OfficeEnvironment />

                {/* Characters */}
                {activeCharacters.map(user => (
                    <Character
                        key={user.id}
                        position={user.position}
                        color={user.color}
                        name={user.name.split(' ')[0]} // First name only
                        isPartying={user.isPartying}
                        isWorried={user.isWorried}
                        canMove={user.canMove}
                        onClick={() => {
                            if (user.standup) {
                                onViewStandup(user.standup);
                            }
                        }}
                    />
                ))}

                {/* Controls (restricted) */}
                <OrbitControls
                    enableZoom={true}
                    minDistance={5}
                    maxDistance={20}
                    minPolarAngle={Math.PI / 4}
                    maxPolarAngle={Math.PI / 2.5}
                    enabled={true}
                />
            </Canvas>
        </div>
    );
};
