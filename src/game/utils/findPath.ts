import PF from 'pathfinding';

/**
 * @param gridMatrix  二维数组, 0表示可走,1表示障碍
 * @param sx 起点网格X (列)
 * @param sy 起点网格Y (行)
 * @param ex 终点网格X (列)
 * @param ey 终点网格Y (行)
 * @returns 方向字符串数组 [ 'right', 'right', 'down', 'left' ... ]
 */
export function findPath(
  gridMatrix: number[][],
  sx: number,
  sy: number,
  ex: number,
  ey: number
): string[] {
  const grid = new PF.Grid(gridMatrix);
  const finder = new PF.AStarFinder({ 
    //diagonalMovement: PF.DiagonalMovement.OnlyWhenNoObstacles
  });
  const rawPath = finder.findPath(sx, sy, ex, ey, grid);

  if (rawPath.length < 2) {
    return [];
  }

  const directions: string[] = [];

  for (let i = 0; i < rawPath.length - 1; i++) {
    const [cx, cy] = rawPath[i];
    const [nx, ny] = rawPath[i + 1];
    const dx = nx - cx; 
    const dy = ny - cy; 

    if (dx > 0) {
      directions.push('right');
    } else if (dx < 0) {
      directions.push('left');
    } else if (dy > 0) {
      directions.push('down');
    } else if (dy < 0) {
      directions.push('up');
    }
  }  return directions;
}
