export const TILE_SIZE = 32;
export const MAP_WIDTH = 20;
export const MAP_HEIGHT = 20;

// Enhanced map generation with better path clearing
export function generateMap() {
    const map = [];
    for (let y = 0; y < MAP_HEIGHT; y++) {
        const row = [];
        for (let x = 0; x < MAP_WIDTH; x++) {
            row.push(Math.random() < 0.25 ? 1 : 0); // 25% walls (reduced from 20%)
        }
        map.push(row);
    }

    // Ensure start and goal are always walkable
    map[1][1] = 0;                             // Player start
    map[MAP_HEIGHT - 2][MAP_WIDTH - 2] = 2;    // Goal tile (type 2)

    // Clear some paths to prevent impossible mazes
    for (let i = 0; i < 8; i++) {
        const x = Math.floor(Math.random() * MAP_WIDTH);
        const y = Math.floor(Math.random() * MAP_HEIGHT);
        if (map[y] && map[y][x] !== 2) {
            map[y][x] = 0;
        }
    }

    // Create a rough path from start to goal
    let currentX = 1, currentY = 1;
    const goalX = MAP_WIDTH - 2, goalY = MAP_HEIGHT - 2;

    while (currentX !== goalX || currentY !== goalY) {
        map[currentY][currentX] = 0;

        if (currentX < goalX && Math.random() > 0.4) currentX++;
        else if (currentX > goalX && Math.random() > 0.4) currentX--;
        else if (currentY < goalY) currentY++;
        else if (currentY > goalY) currentY--;

        // Ensure we don't go out of bounds
        currentX = Math.max(0, Math.min(MAP_WIDTH - 1, currentX));
        currentY = Math.max(0, Math.min(MAP_HEIGHT - 1, currentY));
    }

    return map;
}

export function drawMap(ctx, map) {
    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {
            const tile = map[y][x];
            if (tile === 1) {
                ctx.fillStyle = "#444"; // wall
            } else if (tile === 2) {
                ctx.fillStyle = "gold"; // goal
            } else {
                ctx.fillStyle = "#999"; // floor
            }
            ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);

            // Add some texture to walls
            if (tile === 1) {
                ctx.fillStyle = "#555";
                ctx.fillRect(x * TILE_SIZE + 2, y * TILE_SIZE + 2, TILE_SIZE - 4, TILE_SIZE - 4);
            }

            // Add subtle grid lines for floors
            if (tile === 0 || tile === 2) {
                ctx.strokeStyle = "#777";
                ctx.lineWidth = 0.5;
                ctx.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
        }
    }
}