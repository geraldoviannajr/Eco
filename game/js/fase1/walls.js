// === PAREDES ===
const walls = [
  // Parede superior
  [
    { x: 0, y: 0 }, // Parte do zero
    { x: corridorWidth, y: 0 }, // Vai até o topo à direita
    { x: corridorWidth, y: canvas.height / 2 - 50 }, // na direita, desce até metade -50
    { x: (corridorWidth / 4) * 3, y: canvas.height / 2 - 50 }, // vem pro 3/4 do mapa mas permanece na metade -50        
    { x: (corridorWidth / 4) * 3, y: canvas.height / 2 - 150 }, // permanece no 3/4 do mapa e vai a metade -150    
    { x: corridorWidth / 4, y: canvas.height / 2 - 150 }, // vai a 1/4 do mapa e permanece na metade -150    
    { x: corridorWidth / 4, y: canvas.height / 2 - 50 }, // no 1/4 do mapa vai até a metade - 50
    { x: 0, y: canvas.height / 2 - 50 } // fecha bo zero x, mas ainda está na metade -50
    // Ao fechar vai ao zero
  ],
  // Parede inferior
  [
    { x: 0, y: canvas.height / 2 + 50 }, // Parte do zero e metade + 50
    { x: corridorWidth / 4, y: canvas.height / 2 + 50 }, //vai até 1/4 do mapa mas permanece na metade + 50 
    { x: corridorWidth / 4, y: canvas.height / 2 + 150 }, //em 1/4 do mapa desce até metade +150     
    { x: (corridorWidth / 4) * 3, y: canvas.height / 2 + 150 }, //vai a 3/4 do mapa mas permanece na metade +150 
    { x: (corridorWidth / 4) * 3, y: canvas.height / 2 + 50 }, //em 3/4 do mapa desce até a metade +50     
    { x: corridorWidth, y: canvas.height / 2 + 50 }, //vai até à direita mas permanece em metade +50
    { x: corridorWidth, y: canvas.height }, // Na direita, desce até o ponto mais baixo
    { x: 0, y: canvas.height } // Volta para esquerda no ponto mais baixo
    // Ao fechar vai ao zero e metade + 50
  ]
];

// === PORTA ===
const exitDoor = {
  x: corridorWidth - 5,
  y: canvas.height / 2 - 50,
  width: 5,
  height: 100,
  visible: false,
  touchingLines: 0
};
