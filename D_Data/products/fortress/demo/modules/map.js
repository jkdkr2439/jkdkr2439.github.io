/**
 * FORTRESS - Map Module
 * Defines the 16x12 grid and snaking path from left to right.
 * Pure logic — no DOM access.
 */

export const COLS = 16;
export const ROWS = 12;

// Tile types
export const TILE_GRASS = 0;
export const TILE_PATH = 1;

/**
 * Generate the snaking path waypoints.
 * Path enters from left (col 0) and exits right (col 15),
 * snaking vertically through the grid.
 */
export function generatePath() {
  const waypoints = [];

  // Entry point
  waypoints.push({ col: 0, row: 2 });
  waypoints.push({ col: 3, row: 2 });
  waypoints.push({ col: 3, row: 5 });
  waypoints.push({ col: 6, row: 5 });
  waypoints.push({ col: 6, row: 1 });
  waypoints.push({ col: 9, row: 1 });
  waypoints.push({ col: 9, row: 7 });
  waypoints.push({ col: 5, row: 7 });
  waypoints.push({ col: 5, row: 10 });
  waypoints.push({ col: 10, row: 10 });
  waypoints.push({ col: 10, row: 4 });
  waypoints.push({ col: 13, row: 4 });
  waypoints.push({ col: 13, row: 9 });
  waypoints.push({ col: 15, row: 9 });

  return waypoints;
}

/**
 * Build the complete set of path cells by interpolating between waypoints.
 */
export function buildPathCells(waypoints) {
  const cells = new Set();

  for (let i = 0; i < waypoints.length - 1; i++) {
    const from = waypoints[i];
    const to = waypoints[i + 1];

    if (from.col === to.col) {
      // Vertical segment
      const minRow = Math.min(from.row, to.row);
      const maxRow = Math.max(from.row, to.row);
      for (let r = minRow; r <= maxRow; r++) {
        cells.add(`${from.col},${r}`);
      }
    } else {
      // Horizontal segment
      const minCol = Math.min(from.col, to.col);
      const maxCol = Math.max(from.col, to.col);
      for (let c = minCol; c <= maxCol; c++) {
        cells.add(`${c},${from.row}`);
      }
    }
  }

  return cells;
}

/**
 * Create a 2D grid array. 0 = grass, 1 = path.
 */
export function createGrid(pathCells) {
  const grid = [];
  for (let r = 0; r < ROWS; r++) {
    const row = [];
    for (let c = 0; c < COLS; c++) {
      row.push(pathCells.has(`${c},${r}`) ? TILE_PATH : TILE_GRASS);
    }
    grid.push(row);
  }
  return grid;
}

/**
 * Convert waypoints from grid coords to pixel coords (center of tile).
 */
export function waypointsToPixels(waypoints, tileSize) {
  return waypoints.map(wp => ({
    x: wp.col * tileSize + tileSize / 2,
    y: wp.row * tileSize + tileSize / 2
  }));
}

/**
 * Check if a grid cell is buildable (grass, not path, not occupied).
 */
export function isBuildable(grid, col, row, towers) {
  if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return false;
  if (grid[row][col] !== TILE_GRASS) return false;
  // Check if tower already exists there
  for (const t of towers) {
    if (t.col === col && t.row === row) return false;
  }
  return true;
}
