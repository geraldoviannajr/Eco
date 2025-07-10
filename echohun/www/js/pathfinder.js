/**
 * A função heuristic calcula uma estimativa da distância entre dois pontos (a e b) na grid.
 * Ela é usada pelo algoritmo A* (findPath) para priorizar quais nós explorar primeiro.
 * 
 * No contexto do A*, a heuristic serve para "adivinhar" o custo restante do caminho até o destino,
 * ajudando o algoritmo a ser mais eficiente e encontrar o caminho mais curto rapidamente.
 * 
 * Neste caso, é usada a distância de Manhattan (|dx| + |dy|), que funciona bem para grids onde
 * o movimento é permitido nas direções ortogonais e diagonais.
 */
function heuristic(a, b) {
  // Distância de Manhattan
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

/**
 * Busca o caminho do ponto inicial ao final usando A*.
 * Se não houver caminho para o destino, tenta encontrar um caminho para uma célula vizinha livre.
 * @param {Object} start - {x, y} em coordenadas de célula.
 * @param {Object} end - {x, y} em coordenadas de célula.
 * @param {number[][]} navGrid - Matriz de navegação (0 = livre, 1 = bloqueado).
 * @param {int} cellSize - Tamanho da célula em pixels.
 * @returns {Array} Array de {x, y} do caminho ou [] se não houver caminho.
 */
function findPath(start, end, navGrid) {
  const rows = navGrid.length;
  const cols = navGrid[0].length;
  const openSet = [];
  const cameFrom = {};
  const gScore = Array.from({ length: rows }, () => Array(cols).fill(Infinity));
  const fScore = Array.from({ length: rows }, () => Array(cols).fill(Infinity));

  function nodeKey(node) {
    return `${node.x},${node.y}`;
  }

  openSet.push(start);
  gScore[start.y][start.x] = 0;
  fScore[start.y][start.x] = heuristic(start, end);

  while (openSet.length > 0) {
    // Pega o nó com menor fScore
    let currentIdx = 0;
    for (let i = 1; i < openSet.length; i++) {
      const n = openSet[i];
      if (fScore[n.y][n.x] < fScore[openSet[currentIdx].y][openSet[currentIdx].x]) {
        currentIdx = i;
      }
    }
    var current = openSet.splice(currentIdx, 1)[0];

    // Chegou ao destino
    if (current.x === end.x && current.y === end.y) {
      // Reconstrói o caminho
      const path = [];
      let currKey = nodeKey(current);
      while (cameFrom[currKey]) {
        path.push(current);
        current = cameFrom[currKey];
        currKey = nodeKey(current);
      }
      path.push(start);
      path.reverse();
      return path;
    }

    // Vizinhos (8 direções)
    const neighbors = [
      { x: current.x + 1, y: current.y, cost: 1 },
      { x: current.x - 1, y: current.y, cost: 1 },
      { x: current.x, y: current.y + 1, cost: 1 },
      { x: current.x, y: current.y - 1, cost: 1 },
      { x: current.x + 1, y: current.y + 1, cost: Math.SQRT2 },
      { x: current.x - 1, y: current.y + 1, cost: Math.SQRT2 },
      { x: current.x + 1, y: current.y - 1, cost: Math.SQRT2 },
      { x: current.x - 1, y: current.y - 1, cost: Math.SQRT2 },
    ];

    for (const neighbor of neighbors) {
      // Fora dos limites
      if (
        neighbor.x < 0 || neighbor.x >= cols ||
        neighbor.y < 0 || neighbor.y >= rows
      ) continue;
      // Bloqueado na grid
      if (navGrid[neighbor.y][neighbor.x] !== 0) continue;

      // (Opcional) Evita atravessar cantos de paredes:
      if (neighbor.cost > 1) {
        // Se qualquer célula ortogonal adjacente for bloqueada, não permite diagonal
        const dx = neighbor.x - current.x;
        const dy = neighbor.y - current.y;
        if (
          navGrid[current.y][current.x + dx] !== 0 ||
          navGrid[current.y + dy][current.x] !== 0
        ) continue;
      }

      const tentativeG = gScore[current.y][current.x] + neighbor.cost;
      if (tentativeG < gScore[neighbor.y][neighbor.x]) {
        cameFrom[nodeKey(neighbor)] = current;
        gScore[neighbor.y][neighbor.x] = tentativeG;
        fScore[neighbor.y][neighbor.x] = tentativeG + heuristic(neighbor, end);

        if (!openSet.some(n => n.x === neighbor.x && n.y === neighbor.y)) {
          openSet.push({ x: neighbor.x, y: neighbor.y });
        }
      }
    }
  }

  /*
  // Se chegou até aqui não encontrou caminho para o destino
  // Tenta encontrar um caminho para uma célula vizinha livre do destino

  const neighborOffsets = [
    { dx: 1, dy: 0 }, { dx: -1, dy: 0 },
    { dx: 0, dy: 1 }, { dx: 0, dy: -1 },
    { dx: 1, dy: 1 }, { dx: -1, dy: 1 },
    { dx: 1, dy: -1 }, { dx: -1, dy: -1 }
  ];

  let altPath = [];
  
  for (const offset of neighborOffsets) {
    const nx = end.x + offset.dx;
    const ny = end.y + offset.dy;
    if (
      nx >= 0 && nx < cols &&
      ny >= 0 && ny < rows &&
      navGrid[ny][nx] === 0
    ) {
      // Tenta encontrar caminho para o vizinho livre
      altPath = findPath(start, { x: nx, y: ny }, navGrid);
      if (altPath.length > 0) { return altPath; }
    }
  }
  */

  return []; // Retorna vazio se não encontrar caminho  
}

/**
 * Converte coordenadas do mundo para coordenadas de célula da grid.
 */
function convertToCellCoordinates(x, y) {
  return {
    x: Math.floor(x / config.CELL_SIZE),
    y: Math.floor(y / config.CELL_SIZE)
  };
}

/**
 * Converte coordenadas de célula da grid para coordenadas do mundo.
 */
function convertToWorldCoordinates(cell) {
  return {
    x: (cell.x * config.CELL_SIZE) + (config.CELL_SIZE / 2),
    y: (cell.y * config.CELL_SIZE) + (config.CELL_SIZE / 2)
  };
}

function getRandomFreeNeighborCell(currentCell, navGrid) {
  const neighbors = [
    { x: currentCell.x + 1, y: currentCell.y },
    { x: currentCell.x - 1, y: currentCell.y },
    { x: currentCell.x, y: currentCell.y + 1 },
    { x: currentCell.x, y: currentCell.y - 1 },
    { x: currentCell.x + 1, y: currentCell.y + 1 },
    { x: currentCell.x - 1, y: currentCell.y + 1 },
    { x: currentCell.x + 1, y: currentCell.y - 1 },
    { x: currentCell.x - 1, y: currentCell.y - 1 },
  ];

  // Filtra apenas as células livres e dentro dos limites
  const freeNeighbors = neighbors.filter(n =>
    n.x >= 0 && n.x < navGrid[0].length &&
    n.y >= 0 && n.y < navGrid.length &&
    navGrid[n.y][n.x] === 0
  );

  if (freeNeighbors.length > 0) {
    // Retorna uma célula aleatória do array de livres
    return freeNeighbors[Math.floor(Math.random() * freeNeighbors.length)];
  }
  // Se não encontrar, retorna a própria célula
  return currentCell;
}