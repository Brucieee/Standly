# 3D Office Visualizer & Interactions Implementation Plan

## Goal Description
Implement a "Cute 3D Virtual Office" on the dashboard.
- **Aesthetic**: "Cute", low-poly, bright colors. Procedurally generated using Three.js primitives to avoid asset loading issues.
- **Environment**: Office setting with desks, plants, and a floor.
- **Interactions**:
    - **Happy/Party**: Characters jump/dance when a standup is submitted.
    - **Worried**: Characters shake/pace when a deadline is imminent (< 24h).
    - **Idle**: Random wandering.
- **Layout**: Prominent placement on the Dashboard, reducing margins of other widgets to make space.

## Proposed Changes

### [NEW] Components

#### [NEW] `components/OfficeVisualizer.tsx`
- **Scene**: `Canvas` with soft lighting (Ambient + Directional with shadows).
- **Camera**: Orthographic or Isometric perspective for that "cute rpg" look.
- **State Integration**: Listen to `standups` and `deadlines` props to trigger animations.

#### [NEW] `components/3d/Character.tsx`
- **Geometry**:
    - Head: Sphere (low poly)
    - Body: Capsule/Cylinder (chunky proportions)
    - Accessories: Simple glasses or hats (optional, random).
- **Animations**:
    - `useFrame` for procedural animation.
    - `jump()` function for standups.
    - `shake()` / `worry()` for deadlines.
- **Floater**: Name tag floating above head (Billboard).

#### [NEW] `components/3d/OfficeEnvironment.tsx`
- **Furniture**: Simple desks (Boxes), Chairs, Potted Plants (Cylinder + Dodecahedron leaves).
- **Floor**: Grid or tile texture.

### [MODIFY] `components/Dashboard.tsx`
- **Layout**:
    - Insert `OfficeVisualizer` at the top, `col-span-full`.
    - Adjust margins (`p-6` -> `p-4`) on existing widgets to save space.
- **Props**: Pass `standups` (for party trigger) and `deadlines` (for worry trigger) to the visualizer.

### [MODIFY] `types.ts`
- Add `avatarColor` to `User` interface (optional, can derive from name hash if not present).

## Verification Plan

### Manual Verification
1.  **Visuals**:
    - Check if "Cute" characters render with correct colors.
    - Check if Office furniture renders.
2.  **Interactions**:
    - **Party**: Submit a new standup -> Verify ALL or specific character jumps.
    - **Worry**: Create a deadline due tomorrow -> Verify character looks "worried" (shaking/red particles).
3.  **Performance**:
    - Ensure `Canvas` doesn't cause lag on the dashboard.
