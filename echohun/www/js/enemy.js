class Enemy {
  x = 0;
  y = 0;
  name = "Inimigo"; // Nome do inimigo
  type = "echo"; // Tipo do inimigo, pode ser 'echo' ou 'radar'
  waveCount = 90; // Contagem de ondas para o efeito de radar
  waveAmplitude = 2; // Amplitude da onda para o efeito de radar
  radius = 20; // Tamanho do inimigo
  speed = 0.4; // Velocidade de movimento do inimigo
  miliSecBetweenEchos = 1000; // Intervalo entre os ecos
  chasing = false; // Indica se o inimigo está perseguindo o jogador
  visible = false; // Indica se o inimigo está visível
  touchingLines = 0; // Contador de linhas tocadas pelo inimigo
  bodyColor = `rgba(0,0,0,1)`; // Cor do corpo do inimigo
  echoColor = [255, 0, 0, 0.8]; // Cor do eco do inimigo
  expansionSpeed = 4; // Velocidade de expansão do eco
  duration = 1300; // Duração do eco
  lineCount = 24; // Número de linhas no efeito de eco  
  chasingPoint = {x: 0, y : 0}; // Último ponto de perseguição do inimigo
  lastEcho = Date.now(); // Último eco emitido pelo inimigo
  forceNextStep = false; // Força o próximo passo do inimigo, usado para testes
  navGrid = []; // Matriz de navegação do inimigo dentro do mapa, será preenchida pelo mapa no momento do carregamento
  chasingPath = []; // Último caminho calculado pelo inimigo  

  // Construtor da classe Enemy
  // Recebe as coordenadas x e y, tipo, tamanho e velocidade do inimigo
  constructor(x, y, name = 'Enemy', type = "echo", radius = 20, speed = 0.2) {
    this.x = x;
    this.y = y;
    this.name = name;
    this.type = type;
    this.radius = radius;
    this.speed = 0.2;
  }

  emitEcho = () => {
    for (let i = 0; i < this.lineCount; i++) {
      const angle = ((Math.PI * 2) / this.lineCount) * i;
      
      var x = this.x + Math.cos(angle) * (this.radius + 10);
      var y = this.y + Math.sin(angle) * (this.radius + 10); 
      
      if (isWallColliding(x, y, this.radius)) {
        // Se colidir com parede, ajusta a posição para evitar que o eco nasça dentro da parede
        const wallOffset = 5; // Distância mínima do eco para a parede
        const offsetX = Math.cos(angle) * wallOffset;
        const offsetY = Math.sin(angle) * wallOffset;
        x += offsetX;
        y += offsetY;
        // Verifica novamente se colide com parede após o ajuste
        if (isWallColliding(x, y, this.radius)) {
          console.warn(`Eco não pode ser emitido: colidindo com parede em (${x}, ${y})`);
          continue; // Pula este eco se ainda colidir com parede
        }        
      } 
      
      game.lines.push(
        new EchoLine(          
          x,
          y,
          angle,
          "enemy",
          this,
          3
        )
      );
    }
  }
  // Verifica se o inimigo está colidindo com uma linha ou se está se movimentando
  update() {
    const now = Date.now();

    // Se o inimigo estiver tocando linhas inicia ou atualiza a perseguição
    if (this.chasingPoint.x != 0 && this.chasingPoint.y != 0) 
    {
      this.chasing = true; // Começa a perseguir o jogador, se já não estiver
      this.visible = true; // Torna o inimigo visível
      
      this.chasingPath = findPath(
        convertToCellCoordinates(this.x, this.y),
        convertToCellCoordinates(this.chasingPoint.x, this.chasingPoint.y),
        this.navGrid
      );        
    } else {
      this.chasing = false; // Se não há ponto de perseguição, para a perseguição
      this.visible = false; // Torna o inimigo invisível
    }

    // Está perseguindo o jogador
    // Se o inimigo estiver perseguindo o jogador, calcula o próximo passo
    if (this.chasing) {
      var moved = false;

      const prevX = this.x;
      const prevY = this.y;
      var nextX = this.x;
      var nextY = this.y;

      const currentCell = convertToCellCoordinates(this.x, this.y);
      var nextCell = currentCell;

      // Se o inimigo tem um caminho de perseguição, pega o próximo nó do caminho
      if (this.chasingPath != null && this.chasingPath.length > 1) {
        nextCell = this.chasingPath[1];
      } else {
        // Não há caminho, tenta mover para a célula vizinha mais próxima do chasingPoint          
        const targetCell = convertToCellCoordinates(this.chasingPoint.x, this.chasingPoint.y);

        let bestNeighbor = currentCell;
        let minDist = Infinity;
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
        for (const n of neighbors) {
          if (
            n.x >= 0 && n.x < this.navGrid[0].length &&
            n.y >= 0 && n.y < this.navGrid.length &&
            this.navGrid[n.y][n.x] === 0
          ) {
            const dist = Math.abs(n.x - targetCell.x) + Math.abs(n.y - targetCell.y);
            if (dist < minDist) {
              minDist = dist;
              bestNeighbor = n;
            }
          }
        }
        nextCell.x = bestNeighbor.x;
        nextCell.y = bestNeighbor.y;          

      }
      const target = convertToWorldCoordinates(nextCell);        

      // Calcula direção
      const dx = target.x - this.x;
      const dy = target.y - this.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 1) {
        // Move suavemente em direção ao próximo nó
        nextX += (dx / dist) * this.speed;
        nextY += (dy / dist) * this.speed;
      } else {
        // Se já está muito próximo do centro da célula, pode avançar para o próximo nó no próximo update
        nextX = target.x;
        nextY = target.y;
      }        
              
      
      if (!isWallColliding(nextX, nextY, this.radius)) {
        this.x = nextX;
        this.y = nextY;                   
      } else  {
        if (!isWallColliding(nextX, this.y, this.radius))  {
          this.x = nextX;
        } else if (!isWallColliding(this.x, nextY, this.radius))  {
          this.y = nextY;
        } else {          
          // Se não puder se mover, recalcula rota, se não for possível, interrompe a perseguição.
          this.chasingPath = findPath(
            convertToCellCoordinates(this.x, this.y),
            convertToCellCoordinates(this.chasingPoint.x, this.chasingPoint.y),
            this.navGrid
          );
          if (this.chasingPath.length <= 0) {              
            this.chasing = false;
            this.visible = false;
          }
        }
      }      
      
      moved = this.x !== prevX || this.y !== prevY;
      if (moved) {
        if (this.chasingPath != null && this.chasingPath.length > 1) {
          this.chasingPath.splice(1, 1); // Remove o primeiro nó, pois já se moveu até lá.
        }

        if ( (this.type == "echo" && (now - this.lastEcho) >= this.miliSecBetweenEchos) || this.forceNextStep ) {
          this.lastEcho = now;
          this.forceNextStep = false;          
          this.emitEcho();
          console.log(`Inimigo ${this.name} emitiu um eco.`);
          //playStepSound(false);
        }
      }

      if (this.chasingPoint.x != 0 && this.chasingPoint.y != 0) {
        if (this.x == this.chasingPoint.x && this.y == this.chasingPoint.y) {
          // Se chegou ao ponto de perseguição, reseta o ponto
          this.chasingPoint = { x: 0, y: 0 };
          this.touchingLines = 0; // Reseta o contador de linhas tocadas
          this.chasing = false; // Para a perseguição
          this.visible = false; // Torna invisível
          this.chasingPath = []; // Limpa o caminho
        }
      }       

      // Player alcançado pelo inimigo
      if (isPlayerColliding(this.x, this.y, this.radius + 5)) { game.player.isDead = true; }
    }

    /*if (this.chasingPath.length > 0) {
      this.chasing = true; // Continua perseguindo se ainda há caminho
      this.visible = true; // Mantém visível enquanto estiver perseguindo
    }*/

  }

  // Desenha um círculo ondulado
  drawWavyCircle(radius, speed, color, rotationOffset, time) {
    game.ctx.beginPath();
    const ctxX = this.x - window.game.camera.x;
    const ctxY = this.y - window.game.camera.y;

    for (let i = 0; i <= 360; i += 5) {
      const angle = (i * Math.PI) / 180;
      const wave =
        Math.sin(angle * this.waveCount + time * speed + rotationOffset) *
        this.waveAmplitude;
      const r = radius + wave;
      const x = ctxX + Math.cos(angle) * r;
      const y = ctxY + Math.sin(angle) * r;
      if (i === 0) game.ctx.moveTo(x, y);
      else game.ctx.lineTo(x, y);
    }
    game.ctx.closePath();
    game.ctx.strokeStyle = color;
    game.ctx.lineWidth = 2;
    game.ctx.stroke();
  }

  // Desenha o inimigo
  // Se for um inimigo do tipo radar, desenha o efeito de circulos ondulados
  draw() {
    if (this.type == "radar" && this.visible) {
      const circle1Radius = this.radius;
      const circle2Radius = this.radius + 5;
      const now = Date.now();

      this.drawWavyCircle(circle1Radius, 0.002, "rgba(255, 0, 0, 0.5)", 0, now);
      this.drawWavyCircle(circle2Radius,-0.0015,"rgba(255, 50, 50, 0.3)",Math.PI / 2,now);
    }

    
    if (config.DEBUG) {
     
      // Desenha o círculo do inimigo
      game.ctx.save();
      game.ctx.beginPath();
      game.ctx.arc(
        this.x - game.camera.x,
        this.y - game.camera.y,
        this.radius,
        0,
        Math.PI * 2
      );
      game.ctx.fillStyle = this.bodyColor;
      game.ctx.fill();
      game.ctx.strokeStyle = "black";
      game.ctx.lineWidth = 1;
      game.ctx.stroke();
      game.ctx.restore();
    
      // Desenha uma representação visual das células do pathfinder ao redor do inimigo
      if (this.navGrid && this.navGrid.length > 0) {
        const cellSize = config.CELL_SIZE;
        const cellX = Math.floor(this.x / cellSize);
        const cellY = Math.floor(this.y / cellSize);

        game.ctx.save();
        for (let dy = -2; dy <= 2; dy++) {
          for (let dx = -2; dx <= 2; dx++) {
            const nx = cellX + dx;
            const ny = cellY + dy;
            if (
              ny >= 0 && ny < this.navGrid.length &&
              nx >= 0 && nx < this.navGrid[0].length
            ) {
              const blocked = this.navGrid[ny][nx] !== 0;
              game.ctx.strokeStyle = blocked ? "red" : "lime";
              game.ctx.lineWidth = 1;
              game.ctx.strokeRect(
                nx * cellSize - game.camera.x,
                ny * cellSize - game.camera.y,
                cellSize, cellSize
              );
            }
          }
        }
        game.ctx.restore();
      }

      //Desenha o caminho do pathfinder ===
      if (this.chasingPath && this.chasingPath.length > 1) {
        game.ctx.save();
        game.ctx.strokeStyle = "yellow";
        game.ctx.lineWidth = 2;
        game.ctx.beginPath();
        for (let i = 0; i < this.chasingPath.length; i++) {
          // Converte célula para coordenada do mundo
          const cell = this.chasingPath[i];
          const wx = cell.x * config.CELL_SIZE + config.CELL_SIZE / 2 - game.camera.x;
          const wy = cell.y * config.CELL_SIZE + config.CELL_SIZE / 2 - game.camera.y;
          if (i === 0) {
            game.ctx.moveTo(wx, wy);
          } else {
            game.ctx.lineTo(wx, wy);
          }
        }
        game.ctx.stroke();
        game.ctx.restore();
      } 
    }    
  }  
}
