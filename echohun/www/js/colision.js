// === SISTEMA DE COLISÃO ===

/**
 * Verifica se um ponto (x, y) está dentro de um círculo.
 * @param {number} x - Coordenada x do ponto a ser testado.
 * @param {number} y - Coordenada y do ponto a ser testado.
 * @param {{x: number, y: number, radius: number}} circle - Objeto círculo com centro (x1, y1) e raio r1.
 * @returns {boolean} true se o ponto está dentro ou na borda do círculo.
 */
function pointInCircle(x, y, circle) {
  // Calcula a diferença entre as coordenadas do ponto e do centro do círculo
  const dx = x - circle.x; // diferença em x
  const dy = y - circle.y; // diferença em y

  // Calcula a distância ao quadrado entre o ponto e o centro do círculo
  const distanceSquared = (dx * dx) + (dy * dy);

  // Calcula o raio ao quadrado do círculo
  const radiusSquared = circle.radius * circle.radius;

  // Se a distância ao quadrado for menor ou igual ao raio ao quadrado,
  // o ponto está dentro ou na borda do círculo
  return distanceSquared <= radiusSquared;
}

function pointInPolygon(px, py, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x,
      yi = polygon[i].y;
    const xj = polygon[j].x,
      yj = polygon[j].y;

    const intersect =
      yi > py !== yj > py &&
      px < ((xj - xi) * (py - yi)) / (yj - yi + 0.0001) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function isWallColliding(x, y, radius = 0) {
  if (radius === 0) {
    // Colisão pontual (original)
    for (const wall of game.map.walls) {
      if (pointInPolygon(x, y, wall)) return true;
    }
    return false;
  } else {
    // Colisão circular (perímetro + folga)
    // Checa múltiplos pontos ao redor do círculo
    const steps = 16;
    for (let i = 0; i < steps; i++) {
      const angle = (2 * Math.PI * i) / steps;
      const px = x + Math.cos(angle) * radius;
      const py = y + Math.sin(angle) * radius;
      for (const wall of game.map.walls) {
        if (pointInPolygon(px, py, wall)) return true;
      }
    }
    return false;
  }
}

function isPlayerColliding(_x, _y, _radius = 0) {
  return pointInCircle(game.player.x, game.player.y, {
    x: _x,
    y: _y,
    radius: _radius,
  });
}

function segmentsIntersect(p1, p2, q1, q2) {
  const det = (p2.x - p1.x) * (q2.y - q1.y) - (p2.y - p1.y) * (q2.x - q1.x);
  if (det === 0) return false; // paralelos

  const lambda =
    ((q2.y - q1.y) * (q2.x - p1.x) + (q1.x - q2.x) * (q2.y - p1.y)) / det;
  const gamma =
    ((p1.y - p2.y) * (q2.x - p1.x) + (p2.x - p1.x) * (q2.y - p1.y)) / det;

  return 0 < lambda && lambda < 1 && 0 < gamma && gamma < 1;
}
